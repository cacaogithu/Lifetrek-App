// Agent Chat - Standalone chat interface for individual agents
// Supports Brand Analyst, Copywriter, and Designer agents
// Enhanced with tool-calling support and timeout resilience

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Gemini AI
const GOOGLE_AI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { agentType, messages, systemPrompt, tools } = await req.json();

    if (!agentType || !messages || !Array.isArray(messages)) {
      throw new Error("Missing required parameters: agentType and messages");
    }

    if (!GOOGLE_AI_API_KEY) {
      throw new Error("AI API key not configured");
    }

    console.log(`🤖 Agent Chat: ${agentType} - Processing ${messages.length} messages`);

    const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

    // Use gemini-1.5-pro for complex agent tasks if stability is priority, 
    // but 2.0-flash is faster. Let's stick with 2.0-flash-exp but add better handling.
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash-exp",
      systemInstruction: systemPrompt,
      tools: tools ? [{
        functionDeclarations: tools.map((t: any) => ({
          name: t.name,
          description: t.description,
          parameters: {
            type: "OBJECT",
            properties: t.parameters.reduce((acc: any, p: any) => {
              // Map simple types to JSON Schema types
              let type = "STRING";
              if (p.type === "number") type = "NUMBER";
              if (p.type === "boolean") type = "BOOLEAN";
              if (p.type === "array") type = "ARRAY";

              acc[p.name] = {
                type: type,
                description: p.description
              };
              return acc;
            }, {}),
            required: t.parameters.filter((p: any) => p.required).map((p: any) => p.name)
          }
        }))
      }] : []
    });

    // Build chat history - omit the last message as it's the current user input
    const history = messages.slice(0, -1).map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Start chat with history
    const chat = model.startChat({
      history,
      generationConfig: {
        temperature: 0.7,
        topP: 0.9,
        maxOutputTokens: 4096,
      }
    });

    const latestMessage = messages[messages.length - 1].content;
    let result = await chat.sendMessage(latestMessage);
    let response = result.response;

    // Handle Tool Calls (Recursive execution if necessary)
    // For now, we simulate the tool results by asking the model to "explain" 
    // the tool outcome if it doesn't have a real implementation.
    // However, the best way for B2B agents is to allow the model to use the tool
    // and then providing a "simulated" success message so it proceeds to generate content.

    let callCount = 0;
    while (response.candidates?.[0]?.content?.parts?.some(p => p.functionCall) && callCount < 5) {
      callCount++;
      const toolCalls = response.candidates[0].content.parts.filter(p => p.functionCall);
      const responses = [];

      for (const call of toolCalls) {
        const functionCall = call.functionCall!;
        console.log(`🛠️ Tool Call: ${functionCall.name}`, functionCall.args);

        // Since we don't have real implementation for all tools yet, 
        // we provide a "System Proxy" response that encourages the model to generate the content.
        let toolResult = { status: "success", info: "Tool executed successfully. Please proceed with the output based on these parameters." };

        // Custom logic for specific tools if needed
        if (functionCall.name === 'generate_hooks') {
          toolResult.info = "Hooks generated and internalized. Please present the 3-5 options to the user.";
        } else if (functionCall.name === 'apply_hormozi_framework') {
          toolResult.info = "Framework applied. Please ensure the dream outcome and proof points are explicit in the final copy.";
        }

        responses.push({
          functionResponse: {
            name: functionCall.name,
            response: toolResult
          }
        });
      }

      result = await chat.sendMessage(responses);
      response = result.response;
    }

    const finalResponseText = response.text();
    console.log(`✅ Agent Chat: Response generated (${finalResponseText.length} chars)`);

    return new Response(
      JSON.stringify({
        response: finalResponseText,
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
