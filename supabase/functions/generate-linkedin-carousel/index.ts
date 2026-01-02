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
  const IMAGE_MODEL = "google/gemini-3-pro-image-preview";

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
      mode = "generate",
      headline,
      body: slideBody,
      imagePrompt
    } = await req.json();

    const isBatch = (numberOfCarousels > 1) || (mode === 'plan');

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

    if (assetsError) {
      console.warn("Could not fetch assets (non-fatal):", assetsError.message, assetsError.code);
    }

    const assetsContext = assets?.map((a: any) => {
      const category = a.category || "general";
      const tags = Array.isArray(a.tags) ? a.tags.join(", ") : "none";
      return `- [${category.toUpperCase()}] ID: ${a.id} (Tags: ${tags}, Filename: ${a.filename})`;
    }).join("\n") || "No assets available. AI will generate all images.";

    const SYSTEM_PROMPT = constructSystemPrompt(assetsContext);
    let userPrompt = constructUserPrompt(topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, isBatch, numberOfCarousels);
    
    if (mode === 'plan') {
        userPrompt += "\n\nIMPORTANT: The user wants to see 3 DISTINCT STRATEGIC ANGLES/PLANS for this topic. Generate 3 variants (Batch Mode) so the user can choose the best one. Focus on the HEADLINES and HOOKS differentiation.";
    }

    const tools = getTools(isBatch);

    // === STRATEGIST AGENT ===
    const strategistStartTime = Date.now();
    console.log("📝 [STRATEGIST] Starting content generation...");
    console.log(`📝 [STRATEGIST] Topic: "${topic}", Audience: "${targetAudience}", Mode: ${mode}`);

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

    let resultCarousels = isBatch ? args.carousels : [args];
    if (!resultCarousels) resultCarousels = [];

    console.log(`⏱️ [STRATEGIST] Response received in ${strategistTime}ms`);
    console.log(`📄 [STRATEGIST] Generated ${resultCarousels.length} carousel(s) with ${resultCarousels[0]?.slides?.length || 0} slides each`);
    if (resultCarousels[0]?.slides?.[0]) {
      console.log(`📄 [STRATEGIST] Hook headline: "${resultCarousels[0].slides[0].headline?.substring(0, 50)}..."`);
    }

    if (mode === 'plan') {
         console.log(`✅ [PLAN MODE] Returning ${resultCarousels.length} strategy options (no images/critique)`);
         return new Response(
            JSON.stringify({ carousels: resultCarousels, mode: 'plan_results' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // --- CRITIQUE LOOP (BRAND ANALYST) ---
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

      const basePrompt = slide.imageGenerationPrompt || `Professional medical manufacturing scene for: ${slide.headline}`;
      const fullPrompt = `${basePrompt}
STYLE: Photorealistic, professional, ISO 13485 medical manufacturing aesthetic.
COMPOSITION: Clean, modern, high-end industrial photography.
LIGHTING: Soft studio lighting, highlight precision equipment.`;

      const maxRetries = 2;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🖼️ Generating image for: ${slide.headline?.substring(0, 30)}... (attempt ${attempt + 1})`);
          
          const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: IMAGE_MODEL,
              messages: [
                { role: "system", content: "You are a professional medical equipment photographer and designer." },
                { role: "user", content: fullPrompt }
              ],
              modalities: ["image", "text"]
            }),
          });
          
          if (!imgResponse.ok) {
            console.warn(`Image API returned ${imgResponse.status}`);
            continue;
          }
          
          const imgData = await imgResponse.json();
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

    // Assign images back to carousels
    imageResults.forEach(({ carouselIndex, slideIndex, imageUrl }) => {
      if (resultCarousels[carouselIndex]?.slides?.[slideIndex]) {
        resultCarousels[carouselIndex].slides[slideIndex].imageUrl = imageUrl;
      }
    });

    // Build imageUrls array for each carousel
    resultCarousels.forEach((carousel: any) => {
      if (carousel?.slides) {
        carousel.imageUrls = carousel.slides.map((s: any) => s.imageUrl || "");
      }
    });

    const imageTime = Date.now() - imageStartTime;
    const successCount = imageResults.filter(r => r.imageUrl).length;
    console.log(`🖼️ Image processing complete in ${imageTime}ms (${successCount}/${allSlideTasks.length} successful)`);

    // Return response
    const finalResponse = isBatch 
      ? { carousels: resultCarousels }
      : resultCarousels[0];

    console.log(`✅ LinkedIn content generated successfully`);

    return new Response(
      JSON.stringify(finalResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error generating LinkedIn content:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate content" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
