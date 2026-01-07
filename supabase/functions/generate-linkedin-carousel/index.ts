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

    // Fetch company assets (logos, ISO badge, etc.)
    const { data: companyAssets, error: companyAssetsError } = await supabase
      .from("company_assets")
      .select("type, url, name, metadata");

    if (companyAssetsError) {
      console.warn("Could not fetch company assets (non-fatal):", companyAssetsError.message);
    }

    const companyAssetsContext = companyAssets?.map((a: any) => 
      `- [${a.type.toUpperCase()}] URL: ${a.url} (${a.name || 'No name'})`
    ).join("\n") || "No company assets available.";

    // Fetch processed product images for visual reference
    const { data: products, error: productsError } = await supabase
      .from("processed_product_images")
      .select("name, enhanced_url, category")
      .eq("is_visible", true)
      .limit(15);

    if (productsError) {
      console.warn("Could not fetch products (non-fatal):", productsError.message);
    }

    const productsContext = products?.map((p: any) =>
      `- [${p.category || 'general'}] ${p.name}: ${p.enhanced_url}`
    ).join("\n") || "No product images available.";
    
    console.log("📚 RAG Context loaded:", { 
      contentAssets: assets?.length || 0, 
      companyAssets: companyAssets?.length || 0,
      products: products?.length || 0 
    });

    // Combined System Prompt with EMBEDDED CONTEXT
    const SYSTEM_PROMPT = constructSystemPrompt(assetsContext, companyAssetsContext, productsContext);

    // Construct User Prompt
    let userPrompt = constructUserPrompt(topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, isBatch, numberOfCarousels);
    
    // --- PLAN MODE ADJUSTMENT ---
    if (mode === 'plan') {
        userPrompt += "\n\nIMPORTANT: The user wants to see 3 DISTINCT STRATEGIC ANGLES/PLANS for this topic. Generate 3 variants (Batch Mode) so the user can choose the best one. Focus on the HEADLINES and HOOKS diffentiation.";
    }

    // Define Tools
    const tools = getTools(isBatch);

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

    if (!response.ok) {
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

    // If Mode is 'plan', we return here WITHOUT generating images or running critique.
    // The user just wants to see the text plans.
    if (mode === 'plan') {
         return new Response(
            JSON.stringify({ carousels: resultCarousels, mode: 'plan_results' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // --- CRITIQUE LOOP (BRAND ANALYST) ---
    // Only run if not in mock mode and not image_only
    if (LOVABLE_API_KEY !== "mock-key-for-testing" && mode !== "image_only") {
      console.log("🧐 Analyst Agent: Reviewing content against Brand Book...");
      
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

         if (!critiqueRes.ok) {
           if (critiqueRes.status === 429 || critiqueRes.status === 402) {
             console.warn(`Critique API rate limit/payment issue: ${critiqueRes.status}`);
           } else {
             console.warn(`Critique API error: ${critiqueRes.status}`);
           }
         }
         
         const critiqueData = await critiqueRes.json();
         const refinedToolCall = critiqueData.choices?.[0]?.message?.tool_calls?.[0];
         
         if (refinedToolCall) {
            const refinedArgs = JSON.parse(refinedToolCall.function.arguments);
            const refinedCarousels = isBatch ? refinedArgs.carousels : [refinedArgs];
            if (refinedCarousels && refinedCarousels.length > 0) {
               console.log("✅ Content refined by Analyst Agent.");
               resultCarousels = refinedCarousels;
            }
         }
       } catch (e) {
         console.warn("⚠️ Analyst Agent critique failed, using original draft:", e);
       }
    }

    // Process Images for ALL carousels
    // Fix: Explicitly type carousel as any to allow adding imageUrls
    for (const carousel of (resultCarousels as any[])) {
      if (!carousel) continue;

      const processedSlides = [];
      const slidesToProcess = format === "single-image" && carousel.slides?.length > 0 ? [carousel.slides[0]] : (carousel.slides || []);

      for (const slide of slidesToProcess) {
        let imageUrl = "";

        // 1. Try Asset
        if (slide.backgroundType === "asset" && slide.assetId) {
          const { data: assetData } = await supabase.from("content_assets").select("filename").eq("id", slide.assetId).single();
          if (assetData) {
            const { data: publicUrlData } = supabase.storage.from("content-assets").getPublicUrl(assetData.filename);
            imageUrl = publicUrlData.publicUrl;
          }
        }

        // 2. Generate if needed
        if (!imageUrl && wantImages && (slide.backgroundType === "generate" || !slide.assetId)) {
          try {
            let imagePrompt = `Create a professional LinkedIn background image for Lifetrek Medical.
HEADLINE: ${slide.headline}
CONTEXT: ${slide.body}
VISUAL DESCRIPTION: ${slide.imageGenerationPrompt || "Professional medical manufacturing scene"}
STYLE: Photorealistic, clean, ISO 13485 medical aesthetic.`;

            // Handling Text Placement Strategy (Strategist Decision)
            if (slide.textPlacement === "burned_in") {
                imagePrompt += `\nIMPORTANT: You MUST render the headline text ("${slide.headline}") CLEARLY and LEGIBLY inside the image. Integrated professional typography.`;
            } else {
                imagePrompt += `\nIMPORTANT: Create a clean, abstract background optimized for professional presentation.`;
            }

            // Handle Logo Integration
            if (slide.showLogo && companyAssets) {
              const logo = companyAssets.find((a: any) => a.type === 'lifetrek_logo');
              if (logo) {
                const position = slide.logoPosition || 'top-right';
                imagePrompt += `\n\nBRANDING: Include the Lifetrek Medical logo at the ${position} corner of the image.`;
                imagePrompt += `\nLogo should be subtle but visible, professional placement.`;
              }
            }

            // Handle ISO Badge Integration
            if (slide.showISOBadge && companyAssets) {
              const isoBadge = companyAssets.find((a: any) => a.type === 'iso_13485_logo');
              if (isoBadge) {
                imagePrompt += `\n\nCERTIFICATION: Include the ISO 13485:2016 certification badge.`;
                imagePrompt += `\nBadge should be prominently displayed to emphasize quality standards.`;
              }
            }

            // Handle Product Reference Images
            if (slide.productReferenceUrls && slide.productReferenceUrls.length > 0) {
              imagePrompt += `\n\nPRODUCT REFERENCES: Use the following product images as visual reference for technical accuracy:`;
              slide.productReferenceUrls.forEach((url: string, idx: number) => {
                imagePrompt += `\n${idx + 1}. ${url}`;
              });
              imagePrompt += `\nIncorporate visual elements from these products to ensure authenticity and technical precision.`;
            }

            const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: IMAGE_MODEL, // Nano Banana Pro 3.0
                messages: [
                  { role: "system", content: "You are an expert design agent using Gemini 3 Pro (Nano Banana). You excel at high-fidelity text rendering." },
                  { role: "user", content: imagePrompt }
                ],
                modalities: ["image", "text"]
              }),
            });
            
            if (!imgRes.ok) {
              if (imgRes.status === 429) {
                console.warn("Image generation rate limited, skipping this slide");
              } else if (imgRes.status === 402) {
                console.warn("Image generation payment required, skipping this slide");
              } else {
                console.warn(`Image generation error: ${imgRes.status}`);
              }
            } else {
              const imgData = await imgRes.json();
              imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
            }
          } catch (e) {
            console.error("Image gen error", e);
          }
        }

        processedSlides.push({ ...slide, imageUrl });
      }
      carousel.slides = processedSlides;
      carousel.imageUrls = processedSlides.map((s: any) => s.imageUrl || "");
    }

    // --- SAVE TO DATABASE ---
    console.log("Saving generated carousels to database...");
    
    // Normalize to array for processing
    const carouselsToSave = (Array.isArray(resultCarousels) ? resultCarousels : [resultCarousels]).filter(Boolean);

    for (const carousel of (carouselsToSave as any[])) {
       try {
          // 1. Insert into linkedin_carousels
          const { data: insertedCarousel, error: insertError } = await supabase
            .from("linkedin_carousels")
            .insert({
              topic: carousel.topic,
              content: carousel, // Store full JSON structure
              status: 'draft',
              scheduled_date: carousel.scheduledDate || null  // if generated
            })
            .select("id")
            .single();

          if (insertError) {
            console.error("Failed to insert carousel into DB:", insertError);
          } else {
            console.log("✅ Saved carousel to DB:", insertedCarousel.id);
            // Add ID to the returned object so the client knows it
            carousel.id = insertedCarousel.id;
             
             // 2. Log generation event
            await supabase.from("linkedin_generation_logs").insert({
                admin_user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000', // Fallback if anon
                carousel_id: insertedCarousel.id,
                input_params: { topic, targetAudience, painPoint, desiredOutcome, mode },
                final_output: carousel,
                model_used: TEXT_MODEL
            });
          }

       } catch (dbError) {
         console.error("Database save error:", dbError);
       }
    }

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
