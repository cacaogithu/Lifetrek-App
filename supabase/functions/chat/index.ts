// supabase/functions/chat/index.ts
// LangGraph ReAct Agent for Content Orchestration

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { StateGraph, END, START } from "npm:@langchain/langgraph@^0.0.12";
import { ChatOpenAI } from "npm:@langchain/openai@^0.0.14";
import { HumanMessage, AIMessage, BaseMessage, ToolMessage } from "npm:@langchain/core@^0.1.30/messages";
import { ToolNode } from "npm:@langchain/langgraph@^0.0.12/prebuilt";

import {
    createGenerateCarouselTool,
    createSearchKnowledgeTool,
    createConsultDesignerTool,
    createConsultStrategistTool,
    createSaveLeadTool,
} from "./tools.ts";

// ... (imports remain)

        // --- AUTH CHECK ---
        const authHeader = req.headers.get("Authorization");
        let user: any = null;
        
        if (authHeader) {
            const { data, error } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
            if (!error && data?.user) {
                user = data.user;
            }
        }
        
        // STRICT AUTH: Orchestrator is for internal use only.
        if (!user) {
            console.warn("🚫 Unauthorized access attempt to Orchestrator.");
            return new Response(
                JSON.stringify({ error: "Unauthorized. Orchestrator requires login.", status: 401 }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const userId = user.id;

        // --- RATE LIMITING (Skip for now or use IP based in future) ---
        // If user is logged in, use table. If anon, skip table check to avoid error if RLS blocks 'anon' inserts.
        if (user) {
            const { count, error: countError } = await supabase
                .from("api_usage_logs")
                .select("*", { count: "exact", head: true })
                .eq("user_id", user.id)
                .gt("created_at", new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString());
    
            if (!countError && count !== null && count >= MAX_REQUESTS_PER_WINDOW) {
                return new Response(
                    JSON.stringify({ error: "Rate limit exceeded", code: "RATE_LIMIT_EXCEEDED" }),
                    { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }
             await supabase.from("api_usage_logs").insert({ user_id: user.id, endpoint: "chat" });
        }

        // ... (Parse Request)

        // --- INITIALIZE MODEL WITH TOOLS ---
        const tools = [
            createSaveLeadTool(supabase), // LEAD GEN TOOL ADDED
            createGenerateCarouselTool(supabaseUrl, supabaseAnonKey),
            createSearchKnowledgeTool(supabase, openRouterKey),
            // createConsultDesignerTool(openRouterKey), // Reduced tools for public chat to save tokens/latency
            // createConsultStrategistTool(openRouterKey),
        ];

        // ... (Model Init)

        const callAgent = async (state: AgentState): Promise<Partial<AgentState>> => {
            console.log("🤖 Agent Node: Processing...");

            // Add system message with context
            const systemMessage = new HumanMessage(`[SYSTEM] Você é o Assistente Virtual da Lifetrek Medical.
Seu objetivo é ajudar visitantes do site com dúvidas sobre fabricação de dispositivos médicos (Implantes, Instrumentais, Caixas Gráficas) e capturar leads.

FERRAMENTAS:
- save_lead: USE IMEDIATAMENTE se o usuário demonstrar interesse comercial, pedir cotação, ou fornecer contato (email/telefone). Peça o contato se eles mostrarem interesse.
- search_knowledge: Use para responder perguntas técnicas sobre ISO 13485, Capacidade de Fábrica, Metrologia, etc.

DIRETRIZES:
1. Seja educado, breve e profissional.
2. Se não souber a resposta, peça o e-mail para que um especialista entre em contato.
3. Se o usuário falar "Oi" ou "Ola", apresente-se brevemente e pergunte como pode ajudar na jornada de dispositivos médicos.

[END SYSTEM]`);

            const messagesWithSystem = [systemMessage, ...state.messages];
            const response = await model.invoke(messagesWithSystem);
            return { messages: [response] };
        };

        const toolNode = new ToolNode(tools);

        const workflow = new StateGraph<AgentState>({
            channels: {
                messages: {
                    value: (x: BaseMessage[], y: BaseMessage[]) => x.concat(y),
                    default: () => [],
                },
            },
        });

        workflow.addNode("agent", callAgent);
        workflow.addNode("tools", toolNode);

        workflow.setEntryPoint("agent");
        workflow.addConditionalEdges("agent", shouldContinue, {
            tools: "tools",
            [END]: END,
        });
        workflow.addEdge("tools", "agent");

        const app = workflow.compile();

        // --- EXECUTE GRAPH ---
        const result = await app.invoke({ messages: langchainMessages });

        // Extract final AI message
        const aiMessages = result.messages.filter((m: BaseMessage) => m instanceof AIMessage);
        const lastAiMessage = aiMessages[aiMessages.length - 1];
        const responseText = lastAiMessage?.content || "Sem resposta do agente.";

        return new Response(
            JSON.stringify({ text: responseText }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    } catch (error: any) {
        console.error("Chat Agent Error:", error);
        return new Response(
            JSON.stringify({ error: error.message, status: 500 }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
