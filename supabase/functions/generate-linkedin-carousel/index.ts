// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { constructSystemPrompt, constructUserPrompt, getTools } from "./functions_logic.ts";

// Type definitions
interface CarouselSlide {
  type: string;
  headline: string;
  body: string;
  imageGenerationPrompt?: string;
  backgroundType: string;
  assetId?: string;
  imageUrl?: string;
}

interface Carousel {
  topic: string;
  targetAudience: string;
  slides: CarouselSlide[];
  imageUrls?: string[];
  caption?: string; 
}

// Serve handling...
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // --- CONSTANTS ---
  const TEXT_MODEL = "google/gemini-2.5-flash";
  const IMAGE_MODEL = "google/gemini-3-pro-image-preview"; // Nano Banana Pro 3.0

  try {
    const {
      topic,
      targetAudience,
      painPoint,
      desiredOutcome,
      proofPoints,
      ctaAction,
      format = "carousel",
      wantImages = true,
      numberOfCarousels = 1,
      mode = "generate", // 'generate', 'image_only', 'plan'
      // For image_only mode
      headline,
      body: slideBody,
      imagePrompt
    } = await req.json();

    const isBatch = (numberOfCarousels > 1) || (mode === 'plan'); // Plan mode always implies batch of options

    console.log("Generating LinkedIn content:", { topic, mode, isBatch });

    // --- HANDLE IMAGE ONLY MODE ---
    if (mode === "image_only") {
         const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
         if (!LOVABLE_API_KEY) throw new Error("Missing Lovable Key");

         const finalPrompt = `Create a professional LinkedIn background image for Lifetrek Medical.
HEADLINE: ${headline}
CONTEXT: ${slideBody}
VISUAL DESCRIPTION: ${imagePrompt || "Professional medical manufacturing scene"}
STYLE: Photorealistic, clean, ISO 13485 medical aesthetic.`;

        const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
            model: IMAGE_MODEL,
            messages: [
                { role: "system", content: "You are a professional medical designer." },
                { role: "user", content: finalPrompt }
            ],
            modalities: ["image", "text"]
            }),
        });
        const imgData = await imgRes.json();
        const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
        
        return new Response(
            JSON.stringify({ imageUrl }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }


    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing configuration keys");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch available assets
    const { data: assets, error: assetsError } = await supabase
      .from("content_assets")
      .select("id, filename, category, tags")
      .limit(50);

    // Log and handle assets error gracefully
    if (assetsError) {
      console.warn("Could not fetch assets (non-fatal):", assetsError.message, assetsError.code);
    }

    const assetsContext = assets?.map((a: any) => {
      const category = a.category || "general";
      const tags = Array.isArray(a.tags) ? a.tags.join(", ") : "none";
      return `- [${category.toUpperCase()}] ID: ${a.id} (Tags: ${tags}, Filename: ${a.filename})`;
    }).join("\n") || "No assets available. AI will generate all images.";

    // Combined System Prompt with EMBEDDED CONTEXT
    const SYSTEM_PROMPT = constructSystemPrompt(assetsContext);

    // Construct User Prompt
    let userPrompt = constructUserPrompt(topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, isBatch, numberOfCarousels);
    
    // --- PLAN MODE ADJUSTMENT ---
    if (mode === 'plan') {
        userPrompt += "\n\nIMPORTANT: The user wants to see 3 DISTINCT STRATEGIC ANGLES/PLANS for this topic. Generate 3 variants (Batch Mode) so the user can choose the best one. Focus on the HEADLINES and HOOKS diffentiation.";
    }

    // Define Tools
    const tools = getTools(isBatch);

    // === STRATEGIST AGENT ===
    const strategistStartTime = Date.now();
    console.log("📝 [STRATEGIST] Starting content generation...");
    console.log(`📝 [STRATEGIST] Topic: "${topic}", Audience: "${targetAudience}", Mode: ${mode}`);

    // Call AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: tools,
        tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
      }),
    });

    const strategistTime = Date.now() - strategistStartTime;

    if (!response.ok) {
      console.error(`❌ [STRATEGIST] API error: ${response.status}`);
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few seconds." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const args = JSON.parse(toolCall.function.arguments);

    // Normalize to array
    let resultCarousels = isBatch ? args.carousels : [args];
    if (!resultCarousels) resultCarousels = []; // Safety check

    console.log(`⏱️ [STRATEGIST] Response received in ${strategistTime}ms`);
    console.log(`📄 [STRATEGIST] Generated ${resultCarousels.length} carousel(s) with ${resultCarousels[0]?.slides?.length || 0} slides each`);
    if (resultCarousels[0]?.slides?.[0]) {
      console.log(`📄 [STRATEGIST] Hook headline: "${resultCarousels[0].slides[0].headline?.substring(0, 50)}..."`);
    }

    // If Mode is 'plan', we return here WITHOUT generating images or running critique.
    // The user just wants to see the text plans.
    if (mode === 'plan') {
         console.log(`✅ [PLAN MODE] Returning ${resultCarousels.length} strategy options (no images/critique)`);
         return new Response(
            JSON.stringify({ carousels: resultCarousels, mode: 'plan_results' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // --- CRITIQUE LOOP (BRAND ANALYST) ---
    // Only run if not in mock mode and not image_only
    if (LOVABLE_API_KEY !== "mock-key-for-testing" && mode !== "image_only") {
      const analystStartTime = Date.now();
      console.log("🧐 [ANALYST] Starting brand review...");
      console.log(`🧐 [ANALYST] Reviewing ${resultCarousels.length} carousel(s) against Brand Book checklist`);
      
      const critiqueSystemPrompt = `You are the Brand & Quality Analyst for Lifetrek Medical.
Mission: Review drafts to ensure On-brand voice, Technical credibility, and Strategic alignment.

=== CHECKLIST ===
1. **Avatar & Problem**: Is the avatar clearly identified (Callout)? Is ONE main problem addressed?
2. **Value**: Is the "dream outcome" (safer launches, fewer NCs) obvious?
3. **Hook**: Does slide 1 follow the "Callout + Payoff" formula? (e.g. "Orthopedic OEMs: ...")
4. **Proof**: Are specific machines (Citizen M32) or standards (ISO 13485) used as proof? No generic claims.
5. **CTA**: Is there a single, low-friction CTA?

=== OUTPUT ===
Refine the content and output the SAME JSON structure. 
- If the hook is weak, REWRITE IT.
- If the proof is vague, ADD specific machine names.
- If the tone is salesy, make it more ENGINEER-to-ENGINEER.
`;

      const critiqueUserPrompt = `Here is the draft content produced by the Copywriter:
${JSON.stringify(resultCarousels)}

Critique and REFINE this draft using your checklist.
Focus heavily on the HOOK (Slide 1) and PROOF (Technical specificities).
Return the refined JSON object (carousels array).`;

       try {
         const critiqueRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: TEXT_MODEL,
              messages: [
                { role: "system", content: critiqueSystemPrompt },
                { role: "user", content: critiqueUserPrompt }
              ],
               // We reuse the same tool definition to force structured output
               tools: tools,
               tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
            }),
         });

         const analystTime = Date.now() - analystStartTime;

         if (!critiqueRes.ok) {
           if (critiqueRes.status === 429 || critiqueRes.status === 402) {
             console.warn(`❌ [ANALYST] Rate limit/payment issue: ${critiqueRes.status}`);
           } else {
             console.warn(`❌ [ANALYST] API error: ${critiqueRes.status}`);
           }
         }
         
         const critiqueData = await critiqueRes.json();
         const refinedToolCall = critiqueData.choices?.[0]?.message?.tool_calls?.[0];
         
         if (refinedToolCall) {
            const refinedArgs = JSON.parse(refinedToolCall.function.arguments);
            const refinedCarousels = isBatch ? refinedArgs.carousels : [refinedArgs];
            if (refinedCarousels && refinedCarousels.length > 0) {
               // Log changes made by analyst
               const originalHook = resultCarousels[0]?.slides?.[0]?.headline || "";
               const refinedHook = refinedCarousels[0]?.slides?.[0]?.headline || "";
               const hookChanged = originalHook !== refinedHook;
               
               console.log(`⏱️ [ANALYST] Response received in ${analystTime}ms`);
               console.log(`✅ [ANALYST] Content refined. Changes:`);
               if (hookChanged) {
                 console.log(`   - Hook REWRITTEN: "${originalHook.substring(0, 40)}..." → "${refinedHook.substring(0, 40)}..."`);
               } else {
                 console.log(`   - Hook unchanged (already strong)`);
               }
               
               resultCarousels = refinedCarousels;
            }
         } else {
           console.log(`⏱️ [ANALYST] Response received in ${analystTime}ms (no changes)`);
         }
       } catch (e) {
         console.warn("⚠️ [ANALYST] Critique failed, using original draft:", e);
       }
    }

    // === PARALLEL IMAGE PROCESSING ===
    console.log(`🖼️ Starting parallel image processing for ${resultCarousels.length} carousels...`);
    const imageStartTime = Date.now();

    // Helper function to generate a single image with retry
    async function generateSlideImage(slide: any): Promise<string> {
      // 1. Try Asset first
      if (slide.backgroundType === "asset" && slide.assetId) {
        try {
          const { data: assetData } = await supabase.from("content_assets").select("filename").eq("id", slide.assetId).single();
          if (assetData) {
            const { data: publicUrlData } = supabase.storage.from("content-assets").getPublicUrl(assetData.filename);
            if (publicUrlData?.publicUrl) {
              console.log(`✅ Using asset for slide: ${slide.headline?.substring(0, 25)}...`);
              return publicUrlData.publicUrl;
            }
          }
        } catch (e) {
          console.warn(`Asset fetch failed for ${slide.assetId}:`, e);
        }
      }

      // 2. Generate new image if needed
      if (!wantImages || (slide.backgroundType !== "generate" && slide.assetId)) {
        return "";
      }

      // Lifetrek logo as base64 PNG for multimodal input
      const LIFETREK_LOGO_BASE64 = "data:image/png;base64,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+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r/6v+r/6v+r/q/6v+r
          
          if (!imgRes.ok) {
            const errorText = await imgRes.text();
            console.error(`❌ Image API error ${imgRes.status}: ${errorText.substring(0, 500)}`);
            if (imgRes.status === 429 || imgRes.status === 402) {
              console.warn(`Rate limit/payment issue (${imgRes.status}), attempt ${attempt + 1}`);
              if (attempt < maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
                continue;
              }
            }
            throw new Error(`Image API error: ${imgRes.status}`);
          }

          const imgData = await imgRes.json();
          const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
          
          if (imageUrl) {
            console.log(`✅ Image generated for: ${slide.headline?.substring(0, 25)}...`);
            return imageUrl;
          }
        } catch (e) {
          console.error(`Image gen attempt ${attempt + 1} failed:`, e);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }
      return "";
    }

    // Collect all slides needing processing
    interface SlideTask {
      carouselIndex: number;
      slideIndex: number;
      slide: any;
    }
    
    const allSlideTasks: SlideTask[] = [];
    (resultCarousels as any[]).forEach((carousel, carouselIndex) => {
      if (!carousel?.slides) return;
      const slidesToProcess = format === "single-image" ? [carousel.slides[0]] : carousel.slides;
      slidesToProcess.forEach((slide: any, slideIndex: number) => {
        if (slide) {
          allSlideTasks.push({ carouselIndex, slideIndex, slide });
        }
      });
    });

    console.log(`📊 Total slides to process: ${allSlideTasks.length}`);

    // Process in parallel batches (concurrency limit = 5)
    const CONCURRENCY_LIMIT = 5;
    const imageResults: { carouselIndex: number; slideIndex: number; imageUrl: string }[] = [];

    for (let i = 0; i < allSlideTasks.length; i += CONCURRENCY_LIMIT) {
      const batch = allSlideTasks.slice(i, i + CONCURRENCY_LIMIT);
      console.log(`⚡ Processing batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1}/${Math.ceil(allSlideTasks.length / CONCURRENCY_LIMIT)} (${batch.length} images)`);
      
      const batchPromises = batch.map(async (task) => {
        const imageUrl = await generateSlideImage(task.slide);
        return { carouselIndex: task.carouselIndex, slideIndex: task.slideIndex, imageUrl };
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          imageResults.push(result.value);
        } else {
          console.error(`Slide image failed:`, result.reason);
          imageResults.push({
            carouselIndex: batch[idx].carouselIndex,
            slideIndex: batch[idx].slideIndex,
            imageUrl: ""
          });
        }
      });
    }

    // Apply results back to carousels
    imageResults.forEach(({ carouselIndex, slideIndex, imageUrl }) => {
      const carousel = (resultCarousels as any[])[carouselIndex];
      if (carousel?.slides?.[slideIndex]) {
        carousel.slides[slideIndex].imageUrl = imageUrl;
      }
    });

    // Update imageUrls array for each carousel
    (resultCarousels as any[]).forEach((carousel) => {
      if (carousel?.slides) {
        carousel.imageUrls = carousel.slides.map((s: any) => s.imageUrl || "");
      }
    });

    const imageTime = Date.now() - imageStartTime;
    const successCount = imageResults.filter(r => r.imageUrl).length;
    console.log(`✅ Image processing complete: ${successCount}/${allSlideTasks.length} images in ${imageTime}ms`);

    return new Response(
      JSON.stringify(isBatch ? { carousels: resultCarousels } : { carousel: resultCarousels[0] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An internal error occurred",
        details: "Check edge function logs for more information"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
