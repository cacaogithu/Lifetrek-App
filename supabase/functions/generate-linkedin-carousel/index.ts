import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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
      wantImages = true, // Main branch feature
      numberOfCarousels = 1 // Main branch feature
    } = await req.json();

    const isBatch = numberOfCarousels > 1;

    console.log("Generating LinkedIn content:", { topic, targetAudience, format, wantImages, numberOfCarousels });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing configuration keys");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch available assets (HEAD feature)
    const { data: assets, error: assetsError } = await supabase
      .from("content_assets")
      .select("id, filename, category, tags")
      .limit(50);

    if (assetsError) {
      console.error("Error fetching assets:", assetsError);
    }

    const assetsContext = assets?.map(a =>
      `- [${a.category.toUpperCase()}] ID: ${a.id} (Tags: ${a.tags?.join(", ")}, Filename: ${a.filename})`
    ).join("\n") || "No assets available.";

    // Combined System Prompt
    const SYSTEM_PROMPT = `You are the LinkedIn Carousel Content Generator for Lifetrek Medical.
    
CONTEXT – LIFETREK MEDICAL
- Industry: Precision CNC manufacturing for medical/dental/veterinary components.
- Experience: 30+ years.
- Certifications: ISO 13485, ANVISA.
- Audience: medical device manufacturers, R&D directors, quality managers.
- Voice: Technical but accessible, confident, partnership-oriented.

ASSET AWARENESS:
You have access to a library of approved brand assets. You should STRATEGICALLY select an existing asset if it matches the slide content perfectly.
Available Assets:
${assetsContext}

Use 'backgroundType': 'asset' AND 'assetId' when an asset fits.
Use 'backgroundType': 'generate' AND 'imageGenerationPrompt' when no asset fits.

BATCH GENERATION:
If requested, you can generate multiple distinct carousels for a content calendar.
`;

    // Construct User Prompt
    let userPrompt = `Topic: ${topic}
Target Audience: ${targetAudience}
Pain Point: ${painPoint}
${desiredOutcome ? `Outcome: ${desiredOutcome}` : ""}
${proofPoints ? `Proof: ${proofPoints}` : ""}
${ctaAction ? `CTA: ${ctaAction}` : ""}
`;

    if (isBatch) {
      userPrompt += `\nGenerate ${numberOfCarousels} distinct carousels for a content calendar. Each should have a different angle.`;
    } else {
      userPrompt += `\nGenerate a single high-impact carousel.`;
    }

    // Define Tools
    const slideSchema = {
      type: "object",
      properties: {
        type: { type: "string", enum: ["hook", "content", "cta"] },
        headline: { type: "string" },
        body: { type: "string" },
        backgroundType: { type: "string", enum: ["asset", "generate"] },
        assetId: { type: "string" },
        imageGenerationPrompt: { type: "string" }
      },
      required: ["type", "headline", "body", "backgroundType"]
    };

    const tools = [
      {
        type: "function",
        function: {
          name: isBatch ? "create_batch_carousels" : "create_carousel",
          description: isBatch ? "Create multiple carousels" : "Create a single carousel",
          parameters: {
            type: "object",
            properties: isBatch ? {
              carousels: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    targetAudience: { type: "string" },
                    slides: { type: "array", items: slideSchema },
                    caption: { type: "string" }
                  },
                  required: ["topic", "targetAudience", "slides", "caption"]
                }
              }
            } : {
              topic: { type: "string" },
              targetAudience: { type: "string" },
              slides: { type: "array", items: slideSchema },
              caption: { type: "string" }
            },
            required: isBatch ? ["carousels"] : ["topic", "targetAudience", "slides", "caption"]
          }
        }
      }
    ];

    // Call AI
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

    // Process Images for ALL carousels
    for (const carousel of resultCarousels) {
      const processedSlides = [];
      // Support single-image format if requested (legacy/main feature)
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

        // 2. Generate if needed (and wanted)
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
      carousel.imageUrls = processedSlides.map(s => s.imageUrl); // Legacy support
    }

    // Return
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
