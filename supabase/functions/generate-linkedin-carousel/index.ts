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
}

// Serve handling...
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

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
      mode = "generate", // 'generate' or 'image_only'
      // For image_only mode
      headline,
      body: slideBody,
      imagePrompt
    } = await req.json();

    const isBatch = numberOfCarousels > 1;

    console.log("Generating LinkedIn content:", { topic, targetAudience, format, wantImages, numberOfCarousels, mode });

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
            model: "google/gemini-2.5-flash-image",
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
      console.error("Error fetching assets:", assetsError);
    }

    const assetsContext = assets?.map((a: any) =>
      `- [${a.category.toUpperCase()}] ID: ${a.id} (Tags: ${a.tags?.join(", ")}, Filename: ${a.filename})`
    ).join("\n") || "No assets available.";

// --- EMBEDDED CONTEXTS ---

    // Combined System Prompt with EMBEDDED CONTEXT
    const SYSTEM_PROMPT = constructSystemPrompt(assetsContext);

    // Construct User Prompt
    const userPrompt = constructUserPrompt(topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, isBatch, numberOfCarousels);

    // Define Tools
    const tools = getTools(isBatch);

    // Call AI
    if (LOVABLE_API_KEY === "mock-key-for-testing") {
      console.log("Using MOCK AI response for local testing");
      const mockResponse = isBatch ? {
        carousels: [{
          topic: topic,
          targetAudience: targetAudience,
          slides: [
            {
              type: "hook",
              headline: "Mock Hook Headline",
              body: "This is a mock slide body for local testing.",
              imageGenerationPrompt: "Mock image prompt",
              backgroundType: "generate"
            },
            {
              type: "content",
              headline: "Mock Content Slide",
              body: "Simulated content for testing flow.",
              imageGenerationPrompt: "Mock image 2",
              backgroundType: "generate"
            }
          ]
        }]
      } : {
        carousel: {
          topic: topic,
          targetAudience: targetAudience,
          slides: [
            {
              type: "hook",
              headline: "Mock Hook Headline",
              body: "This is a mock slide body for local testing.",
              imageGenerationPrompt: "Mock image prompt",
              backgroundType: "generate"
            },
            {
              type: "content",
              headline: "Mock Content Slide",
              body: "Simulated content for testing flow.",
              imageGenerationPrompt: "Mock image 2",
              backgroundType: "generate"
            }
          ]
        }
      };

      // Mock tool call structure that the code expects
      const mockToolCall = {
        function: {
          arguments: JSON.stringify(mockResponse)
        }
      };
      
      // Simulate the structure downstream code expects
      const resultCarousels: Carousel[] = isBatch ? (mockResponse.carousels || []) : [mockResponse.carousel!];
      
       // Process Images for ALL carousels (Mock implementation)
s      // Fix: Check if resultCarousels is defined
      if (resultCarousels) {
        for (const carousel of resultCarousels) {
            if (!carousel) continue;
            const processedSlides: any[] = [];
            const slidesToProcess = format === "single-image" ? [carousel.slides[0]] : carousel.slides;

            for (const slide of slidesToProcess) {
            processedSlides.push({ ...slide, imageUrl: "https://via.placeholder.com/800x400?text=Mock+Image" });
            }
            carousel.slides = processedSlides;
            // Fix: Assign to carousel with correct type
            (carousel as any).imageUrls = processedSlides.map((s: any) => s.imageUrl);
        }
      for (const carousel of resultCarousels) {
        const processedSlides: CarouselSlide[] = [];
        const slidesToProcess = format === "single-image" ? [carousel.slides[0]] : carousel.slides;

        for (const slide of slidesToProcess) {
          processedSlides.push({ ...slide, imageUrl: "https://via.placeholder.com/800x400?text=Mock+Image" });
        }
        carousel.slides = processedSlides;
        carousel.imageUrls = processedSlides.map((s) => s.imageUrl || "");
      }

      return new Response(
        JSON.stringify(isBatch ? { carousels: resultCarousels } : { carousel: resultCarousels ? resultCarousels[0] : null }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: tools,
        tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const args = JSON.parse(toolCall.function.arguments);

    // Normalize to array
    let resultCarousels = isBatch ? args.carousels : [args];
    if (!resultCarousels) resultCarousels = []; // Safety check

    // --- CRITIQUE LOOP (BRAND ANALYST) ---
    // Only run if not in mock mode and not image_only
    if (LOVABLE_API_KEY !== "mock-key-for-testing" && mode !== "image_only") {
      console.log("🧐 Analyst Agent: Reviewing content against Brand Book...");
      
      const critiqueSystemPrompt = `You are the Brand Director for Lifetrek Medical. 
Your job is to CRITIQUE and REFINE the draft content produced by the junior copywriter.
STRICTLY ENFORCE:
- Technician Tone (Not salesy)
- Specificity (Did they mention machine names?)
- Formatting (Is it valid JSON?)

Refine the content and output the SAME JSON structure with improved copy.`;

      const critiqueUserPrompt = `Here is the draft content:
${JSON.stringify(resultCarousels)}

Critique it against our core themes: Risk Reduction, Precision, Compliance.
If it's too generic, rewrite the headlines/body to be more technical. 
Ensure specific machines (Citizen M32, Zeiss Contura) are mentioned if relevant to: ${topic}.

Return the refined JSON object (carousels array).`;

       try {
         const critiqueRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: "google/gemini-2.5-flash",
              messages: [
                { role: "system", content: critiqueSystemPrompt },
                { role: "user", content: critiqueUserPrompt }
              ],
               // We reuse the same tool definition to force structured output
               tools: tools,
               tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
            }),
         });
         
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
    const resultCarousels: Carousel[] = isBatch ? args.carousels : [args];

    // Process Images for ALL carousels
    for (const carousel of resultCarousels) {
      const processedSlides: CarouselSlide[] = [];
      const slidesToProcess = format === "single-image" ? [carousel.slides[0]] : carousel.slides;

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
            const imagePrompt = `Create a professional LinkedIn background image for Lifetrek Medical.
HEADLINE: ${slide.headline}
CONTEXT: ${slide.body}
VISUAL DESCRIPTION: ${slide.imageGenerationPrompt || "Professional medical manufacturing scene"}
STYLE: Photorealistic, clean, ISO 13485 medical aesthetic.`;

            const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-image",
                messages: [
                  { role: "system", content: "You are a professional medical designer." },
                  { role: "user", content: imagePrompt }
                ],
                modalities: ["image", "text"]
              }),
            });
            const imgData = await imgRes.json();
            imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
          } catch (e) {
            console.error("Image gen error", e);
          }
        }

        processedSlides.push({ ...slide, imageUrl });
      }
      carousel.slides = processedSlides;
      carousel.imageUrls = processedSlides.map((s: any) => s.imageUrl);
      carousel.imageUrls = processedSlides.map(s => s.imageUrl || "");
    }

    return new Response(
      JSON.stringify(isBatch ? { carousels: resultCarousels } : { carousel: resultCarousels[0] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
