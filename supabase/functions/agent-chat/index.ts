// Agent Chat - Standalone chat interface for individual agents
// Supports Brand Analyst, Copywriter, and Designer agents

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Gemini AI
const GOOGLE_AI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
if (!GOOGLE_AI_API_KEY) {
  console.warn("Missing GEMINI_API_KEY or GOOGLE_AI_API_KEY");
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentType, messages, systemPrompt } = await req.json();

    if (!agentType || !messages || !Array.isArray(messages)) {
      throw new Error("Missing required parameters: agentType and messages");
    }

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("AI API key not configured");
    }

    console.log(`🤖 Agent Chat: ${agentType} - Processing ${messages.length} messages`);

    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt
    });

    // Build chat history
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Get the latest user message
    const latestMessage = messages[messages.length - 1];

    // Start chat with history
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 2048,
      }
    });

    // Send the latest message
    const result = await chat.sendMessage(latestMessage.content);
    const response = result.response.text();

    console.log(`✅ Agent Chat: Response generated (${response.length} chars)`);

    return new Response(
      JSON.stringify({
        response,
        agentType,
        model: "gemini-2.0-flash-exp"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ Agent Chat Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    return new Response(
      JSON.stringify({ error: errorMsg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
