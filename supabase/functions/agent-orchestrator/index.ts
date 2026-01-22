import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { message, history, agent_role } = await req.json();

        const apiKey = Deno.env.get("GEMINI_API_KEY");
        if (!apiKey) {
            throw new Error("GEMINI_API_KEY is not set");
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        console.log(`Received request: ${message} [Role: ${agent_role}]`);

        let responseText = "";

        if (agent_role === "strategist") {
            const prompt = `
        You are a World-Class Content Strategist for Lifetrek Medical (CNC Machining & MedTech).
        Your goal is to plan a high-impact LinkedIn Carousel.

        TOPIC: ${message}

        Context:
        Lifetrek manufactures high-precision medical components. 
        Brand Voice: Professional, Innovative, Precision-Obsessed, Trustworthy.

        Task:
        Create a strategic plan for a 5-slide carousel.
        - Slide 1: Hook (High impact)
        - Slide 2: Problem/Context
        - Slide 3: Solution/Insight (The "Meat")
        - Slide 4: Proof/Technical Detail
        - Slide 5: CTA (Call to Action)

        Output a structured PLAN in markdown format.
        `;
            const result = await model.generateContent(prompt);
            responseText = result.response.text();

        } else {
            // Orchestrator / Default
            const chat = model.startChat({
                history: history.map((h: any) => ({
                    role: h.role === "assistant" ? "model" : "user",
                    parts: [{ text: h.content }],
                })),
                generationConfig: {
                    maxOutputTokens: 1000,
                },
            });

            const systemPrompt = `You are the Orchestrator Agent for Lifetrek Medical.
        You coordinate a team of agents (Strategist, Copywriter, Designer).
        Currently, you can answer questions directly or delegate.
        
        User Request: ${message}
        `;

            const result = await chat.sendMessage(message); // History is loaded, just send next msg
            responseText = result.response.text();
        }

        return new Response(
            JSON.stringify({ response: responseText, metadata: { role: agent_role } }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in agent-orchestrator:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
