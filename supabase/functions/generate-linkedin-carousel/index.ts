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

      // Lifetrek logo URL for brand consistency
      const LIFETREK_LOGO_URL = "https://iijkbhiqcsvtnfernrbs.supabase.co/storage/v1/object/public/product-images/lifetrek-logo-white.png";

      const maxRetries = 2;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          let imagePrompt = `Create a professional LinkedIn carousel slide image for Lifetrek Medical (1080x1350px portrait).
HEADLINE: ${slide.headline}
CONTEXT: ${slide.body}
VISUAL DESCRIPTION: ${slide.imageGenerationPrompt || "Professional medical manufacturing scene"}
STYLE: Photorealistic, clean, ISO 13485 medical aesthetic.

BRANDING REQUIREMENT: Include the Lifetrek Medical logo (provided as reference image) in the BOTTOM RIGHT CORNER of the image. The logo should be small (approximately 80-100px wide), subtle but visible, with appropriate padding from the edges.`;

          if (slide.textPlacement === "burned_in") {
            imagePrompt += `\n\nTEXT REQUIREMENT: Render the headline text ("${slide.headline}") CLEARLY and PROMINENTLY inside the image. Use bold white text on dark areas or black text on light areas for maximum contrast.`;
          } else {
            imagePrompt += `\n\nBACKGROUND REQUIREMENT: Create a clean, abstract background optimized for text overlay. Leave space for text to be added later.`;
          }

          console.log(`🎨 Generating image for: ${slide.headline?.substring(0, 30)}... (attempt ${attempt + 1})`);
          
          const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: IMAGE_MODEL,
              messages: [
                { role: "system", content: "You are an expert design agent specializing in professional LinkedIn carousel images. Create high-fidelity, brand-consistent images." },
                { 
                  role: "user", 
                  content: [
                    { type: "text", text: imagePrompt },
                    { type: "image_url", image_url: { url: LIFETREK_LOGO_URL } }
                  ]
                }
              ],
              modalities: ["image", "text"]
            }),
          });
          
          if (!imgRes.ok) {
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
