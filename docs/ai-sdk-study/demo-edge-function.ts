import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// In Deno, we can import from esm.sh to get NPM packages
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.1.3";
import { GoogleGenerativeAIStream, StreamingTextResponse } from "https://esm.sh/ai@2.2.31"; // Older version often works better with Deno/esm.sh
// OR use the new SDK if compatible:
// import { streamText } from "https://esm.sh/ai@3.0.19";
// import { createGoogleGenerativeAI } from "https://esm.sh/@ai-sdk/google@0.0.10";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    // Initialize Google Gemini Client
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" }); // Or gemini-1.5-flash

    // Parse messages for Gemini format
    // (Simplification: just taking the last user message for this demo, 
    // but a real implementation would convert the whole history)
    const lastMessage = messages[messages.length - 1].content;

    // Generate a streaming response
    const geminiStream = await model.generateContentStream(lastMessage);

    // Convert Gemini stream to Vercel AI SDK friendly stream
    const stream = GoogleGenerativeAIStream(geminiStream);

    // Respond with the stream
    // This allows the frontend 'useChat' to consume text character-by-character
    return new StreamingTextResponse(stream, {
      headers: { ...corsHeaders },
    });

  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
