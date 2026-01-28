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
} from "./tools.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 20;

interface AgentState {
    messages: BaseMessage[];
}

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || supabaseServiceKey; // Fallback for internal calls
        const openRouterKey = Deno.env.get("OPEN_ROUTER_API") || Deno.env.get("OPEN_ROUTER_API_KEY");

        if (!openRouterKey) {
            throw new Error("OPEN_ROUTER_API key is missing");
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // --- AUTH CHECK ---
        const authHeader = req.headers.get("Authorization");
        const { data: { user }, error: authError } = await supabase.auth.getUser(
            authHeader?.replace("Bearer ", "")
        );

        if (authError || !user) {
            return new Response(
                JSON.stringify({ error: "Unauthorized", status: 401 }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // --- RATE LIMITING ---
        const { count, error: countError } = await supabase
            .from("api_usage_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)
            .gt("created_at", new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString());

        if (countError) throw countError;

        if (count !== null && count >= MAX_REQUESTS_PER_WINDOW) {
            return new Response(
                JSON.stringify({
                    error: "Muitas solicitações. Aguarde um minuto.",
                    code: "RATE_LIMIT_EXCEEDED",
                }),
                { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        await supabase.from("api_usage_logs").insert({ user_id: user.id, endpoint: "chat" });

        // --- PARSE REQUEST ---
        const { messages: rawMessages } = await req.json();

        // Convert raw messages to LangChain format
        const langchainMessages: BaseMessage[] = rawMessages.map((m: any) => {
            if (m.role === "user") return new HumanMessage(m.content);
            if (m.role === "assistant") return new AIMessage(m.content);
            return new HumanMessage(m.content); // Fallback
        });

        // --- INITIALIZE MODEL WITH TOOLS ---
        const tools = [
            createGenerateCarouselTool(supabaseUrl, supabaseAnonKey),
            createSearchKnowledgeTool(supabase, openRouterKey),
            createConsultDesignerTool(openRouterKey),
            createConsultStrategistTool(openRouterKey),
        ];

        const model = new ChatOpenAI({
            modelName: "google/gemini-2.0-flash-001",
            temperature: 0.7,
            configuration: {
                baseURL: "https://openrouter.ai/api/v1",
                apiKey: openRouterKey,
                defaultHeaders: {
                    "HTTP-Referer": "https://lifetrek.app",
                    "X-Title": "Lifetrek App",
                },
            },
        }).bindTools(tools);

        // --- DEFINE GRAPH ---
        const shouldContinue = (state: AgentState) => {
            const lastMessage = state.messages[state.messages.length - 1];
            // If the last message has tool_calls, route to "tools"
            if (lastMessage instanceof AIMessage && lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
                return "tools";
            }
            return END;
        };

        const callAgent = async (state: AgentState): Promise<Partial<AgentState>> => {
            console.log("🤖 Agent Node: Processing...");

            // Add system message with context
            const systemMessage = new HumanMessage(`[SYSTEM] Você é o Content Orchestrator da Lifetrek Medical (B2B de dispositivos médicos).

FERRAMENTAS DISPONÍVEIS:
- generate_carousel: Use para CRIAR novo conteúdo de carrossel LinkedIn.
- search_knowledge: Use para buscar informações na base de dados (marca, ISO, produtos).
- consult_designer: Use para perguntas visuais/design.
- consult_strategist: Use para perguntas de estratégia de conteúdo.

REGRAS:
1. Se o usuário pedir para CRIAR/GERAR um carrossel, USE a ferramenta 'generate_carousel'.
2. Se precisar de informação factual sobre a Lifetrek, USE 'search_knowledge' ANTES de responder.
3. Responda em português, de forma concisa e profissional.
4. NUNCA invente informações sobre ISO ou certificações sem consultar a base.

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
