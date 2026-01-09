import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const systemPrompt = `[SYSTEM PROMPT OMITTED FOR BREVITY - SAME AS BEFORE]`;
    // Note: I will inject the full system prompt content here in the actual tool call, 
    // but for this thought trace I'm abbreviating. 
    // Wait, I must provide the full content in the tool call.

    const fullSystemPrompt = `You are an expert AI assistant for Lifetrek, a precision medical device contract manufacturer based in Brazil. You have comprehensive knowledge about:

COMPANY OVERVIEW:
- 30+ years of experience in precision Swiss CNC machining
- ISO 13485:2016 certified for medical device manufacturing
- ANVISA approved facility
- 30+ global partners including major medical device OEMs
- 100% ISO certified operations

CORE CAPABILITIES:
- Swiss-Type CNC Machining: Multi-axis (up to 12-axis) precision manufacturing with ±0.001mm tolerance for parts from Ø0.5-32mm
- Advanced Metrology: ISO 17025 certified lab with ZEISS Contura G2 3D CMM, optical inspection, surface roughness testing (Ra < 0.05μm)
- Cleanroom Manufacturing: ISO 7 (Class 10,000) certified cleanrooms for sterile assembly and packaging
- Surface Treatment: Electropolishing lines producing mirror finishes (Ra < 0.1μm) with enhanced biocompatibility
- Laser Marking: Permanent traceability marking on all components

EQUIPMENT:
- CNC Machines: Citizen L20-VIII LFV, Citizen L32, Tornos GT-26, FANUC Robodrill, Walter Helitronic tool grinders
- Metrology: ZEISS Contura G2 CMM, Optical CNC measurement, Olympus microscopes, Vickers hardness testers
- Finishing: Automated electropolishing lines, laser marking systems
- Software: Esprit CAM programming, advanced CAD/CAM capabilities

PRODUCTS & SERVICES:
- Medical Implants: Orthopedic screws, plates, spinal implants, dental implants
- Surgical Instruments: Precision surgical tools and specialty instruments
- Veterinary Implants: Specialized animal healthcare devices
- Materials: Titanium alloys (Ti-6Al-4V), stainless steel (316L, 17-4PH), cobalt-chrome

MANUFACTURING PROCESS:
1. Design Engineering: CAD/CAM programming and DFM analysis
2. Precision Machining: Swiss CNC manufacturing with live tooling
3. Surface Finishing: Electropolishing, passivation, laser marking
4. Quality Verification: Comprehensive dimensional and material testing

QUALITY & CERTIFICATIONS:
- ISO 13485:2016 Medical Device Quality Management
- ANVISA Brazilian regulatory approval
- Full batch traceability and documentation
- First Article Inspection (FAI) reports
- Material certificates and test reports

Always provide helpful, accurate information about Lifetrek's capabilities. If asked about pricing or specific quotes, recommend scheduling a free assessment. Be professional, knowledgeable, and emphasize quality, precision, and regulatory compliance

Do not output "**" or *. Write quick short sentences that might help the user navigate. Usually, ask questions back to try to better understand the user, and collect informatino from him. Answer the first question, and ask for their segment to help them out better. Then name, email e .`;

    // Convert OpenAI messages to Gemini format
    // OpenAI: { role: "user" | "assistant" | "system", content: string }
    // Gemini: { role: "user" | "model", parts: [{ text: string }] }
    // System prompt goes into specific system_instruction field or prepended
    
    const geminiContent = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })).filter((msg: any) => msg.role !== 'system'); // Remove system prompt from history if present

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiContent,
        system_instruction: {
          parts: [{ text: fullSystemPrompt }]
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API error:", response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

    return new Response(JSON.stringify({ response: assistantMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in chat function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
