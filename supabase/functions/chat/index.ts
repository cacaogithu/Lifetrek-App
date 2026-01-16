import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, mode = 'general' } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }

    const ORCHESTRATOR_SYSTEM_PROMPT = `You are the Content Orchestrator for Lifetrek. Your goal is to help users brainstorm and refine content strategies before generation.

YOUR ROLE:
- Act as a Senior Content Strategist.
- Guide the user from a vague idea to a concrete content plan.
- Support two formats: "LinkedIn Carousel" and "Blog Post".
- Language: ALWAYS reply in Portuguese (PT-BR).
- Format: Use clean text only. Do NOT use Markdown formatting (bold, italics, headers) in your conversational response. Use simple spacing for readability.

WORKFLOW:
1. **Discovery**: Ask the user what they want to write about. Ask for the Target Audience and the Main Pain Point/Goal.
2. **Brainstorming**: Suggest 3 distinct "Angles" or "Hooks" for the content (e.g., Contrarian, Educational, Story-driven).
3. **Refinement**: Help the user pick an angle and refine the outline.
4. **Handoff**: When the user is ready to generate, output a SPECIAL JSON BLOCK that the system will use to trigger the generation job.

HANDOFF FORMAT:
Se o usuário disser "Vá em frente", "Pode gerar", "Gere o conteúdo" ou confirmar o plano, você DEVE responder com uma conclusão curta em texto limpo e anexar EXATAMENTE este bloco JSON ao final:

\`\`\`json
{
  "handoff_action": "trigger_job",
  "job_type": "carousel_generate",
  "payload": {
    "topic": "O tópico final refinado",
    "targetAudience": "O público-alvo específico",
    "painPoint": "A dor abordada",
    "desiredOutcome": "O objetivo do post",
    "angle": "O ângulo selecionado",
    "format": "carousel"
  }
}
\`\`\`

Para postagens de blog, use \`job_type: "blog_generate"\` e \`format: "blog"\`.

Regra de Ouro: Nunca invente fatos sobre a capacidade da Lifetrek. Foque na ESTRATÉGIA DE CONTEÚDO. Responda SEMPRE em Português sem Markdown.`;

    const GENERAL_SYSTEM_PROMPT = `You are an expert AI assistant for Lifetrek, a precision medical device contract manufacturer based in Brazil. You have comprehensive knowledge about:

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

    const activeSystemPrompt = mode === 'orchestrator' ? ORCHESTRATOR_SYSTEM_PROMPT : GENERAL_SYSTEM_PROMPT;

    // Convert OpenAI messages to Gemini format
    // OpenAI: { role: "user" | "assistant" | "system", content: string }
    // Gemini: { role: "user" | "model", parts: [{ text: string }] }
    // System prompt goes into specific system_instruction field or prepended

    const geminiContent = messages.map((msg: any) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    })).filter((msg: any) => msg.role !== 'system');

    // --- RAG IMPLEMENTATION ---
    let ragContext = "";
    try {
      const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content;

      if (lastUserMessage) {
        // 1. Generate Embedding
        const embedResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${GEMINI_API_KEY}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            content: { parts: [{ text: lastUserMessage }] }
          })
        });

        if (embedResponse.ok) {
          const embedData = await embedResponse.json();
          const embedding = embedData.embedding.values;

          // 2. Search Supabase
          // Create a new client to access DB (reuse existing if possible or create new)
          const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
          );

          const { data: documents } = await supabaseClient.rpc('match_product_assets', {
            query_embedding: embedding,
            match_threshold: 0.5,
            match_count: 3
          });

          if (documents && documents.length > 0) {
            ragContext = "\n\nRELEVANT KNOWLEDGE BASE:\n" + documents.map((doc: any) =>
              `- ${doc.name}: ${doc.description} (${doc.image_url || 'No Image'})`
            ).join("\n");
          }
        }
      }
    } catch (err) {
      console.error("RAG Error:", err);
      // Continue without RAG if it fails
    }

    // Append RAG Context to System Prompt
    const finalSystemPrompt = activeSystemPrompt + ragContext;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: geminiContent,
        system_instruction: {
          parts: [{ text: finalSystemPrompt }]
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

    // --- AUTO-DISPATCH CAROUSEL GENERATION ---
    // Check if orchestrator included handoff JSON for carousel generation
    if (mode === 'orchestrator' && assistantMessage) {
      const handoffMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/);
      if (handoffMatch && handoffMatch[1]) {
        try {
          const handoffData = JSON.parse(handoffMatch[1]);
          if (handoffData.handoff_action === 'trigger_job' && handoffData.job_type === 'carousel_generate') {
            // Automatically dispatch the carousel job 
            const supabaseClient = createClient(
              Deno.env.get('SUPABASE_URL') ?? '',
              Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
              { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
            );

            const { data: { user } } = await supabaseClient.auth.getUser(req.headers.get('Authorization')?.replace('Bearer ', '') || '');

            if (user) {
              await supabaseClient.from('jobs').insert({
                job_type: 'carousel_generate',
                payload: handoffData.payload,
                user_id: user.id,
                status: 'queued'
              });

              console.log('✅ Auto-dispatched carousel job:', handoffData.payload.topic);
            }
          }
        } catch (e) {
          console.error('Failed to auto-dispatch job:', e);
        }
      }
    }

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
