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
    const { topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, format = "carousel" } = await req.json();

    console.log("Generating LinkedIn content:", { topic, targetAudience, format });

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
      .select("id, filename, category, tags, public_url:id") // Assuming we can construct URL or need a public URL field. Let's use id and construct valid URLs in frontend or here if possible. 
      // Actually, storage buckets are predictable. We can construct the URL if we know the bucket.
      .limit(50); // Limit context window usage

    if (assetsError) {
      console.error("Error fetching assets:", assetsError);
    }

    // Construct asset context
    const assetsContext = assets?.map(a =>
      `- [${a.category.toUpperCase()}] ID: ${a.id} (Tags: ${a.tags?.join(", ")}, Filename: ${a.filename})`
    ).join("\n") || "No assets available.";

    // Build the system prompt with Hormozi principles and LinkedIn best practices
    const systemPrompt = `You are an expert LinkedIn content strategist specializing in B2B medical device manufacturing content. You follow Alex Hormozi's $100M framework and LinkedIn carousel best practices.

CORE PRINCIPLES:
1. ONE core problem/question per carousel
2. Hook = Callout + Implied Value
3. Use proof early (experience, certifications, outcomes)
4. Always include low-friction CTA
5. Favor reusable winners

CAROUSEL STRUCTURE:
- Slide 1 (Hook): Bold hook with ICP callout + promise/risk. 1-2 sentences max, create curiosity gap.
- Slides 2-N (Content): One key idea per slide. Use bullets/numbers. Mix text with concepts. Specific language. Tie to business outcomes.
- Last Slide (CTA): Single clear CTA. State what they get and why it matters. Low friction.

CONTENT RULES:
- Headline: 5-10 words, attention-grabbing, benefit-led
- Body: 20-40 words max, scannable
- Use "you" language
- 1-2 professional emojis per slide (✅ ⚠️ ⏱️)
- High technical credibility, minimal jargon
- Every carousel: calls out audience + promises outcome + clear next step

ASSET AWARENESS:
You have access to a library of approved brand assets. You should STRATEGICALLY select an existing asset if it matches the slide content perfectly (e.g., use a "machining_center.jpg" for a slide about precision machining).
Available Assets:
${assetsContext}

If no asset fits perfectly, choose "generate" to create a new image.
`;

    const userPrompt = `Generate a LinkedIn carousel with the following details:

Topic: ${topic}
Target Audience: ${targetAudience}
Core Pain Point: ${painPoint}
${desiredOutcome ? `Desired Outcome: ${desiredOutcome}` : ""}
${proofPoints ? `Proof Points: ${proofPoints}` : ""}
${ctaAction ? `CTA Action: ${ctaAction}` : ""}

Create 5-7 slides following the structure:
1. Hook slide (call out audience + promise)
2. 3-5 content slides (numbered insights, mistakes to avoid, or before/after comparisons)
3. CTA slide

Also create an engaging LinkedIn caption (150-200 words).`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_carousel",
              description: "Create a LinkedIn carousel with structured slides and asset selection",
              parameters: {
                type: "object",
                properties: {
                  topic: { type: "string" },
                  targetAudience: { type: "string" },
                  slides: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: {
                          type: "string",
                          enum: ["hook", "content", "cta"],
                        },
                        headline: { type: "string" },
                        body: { type: "string" },
                        backgroundType: {
                          type: "string",
                          enum: ["asset", "generate"],
                          description: "Whether to use an existing asset or generate a new image"
                        },
                        assetId: {
                          type: "string",
                          description: "The ID of the selected asset if backgroundType is 'asset'"
                        },
                        imageGenerationPrompt: {
                          type: "string",
                          description: "Detailed prompt for generating an image if backgroundType is 'generate'"
                        }
                      },
                      required: ["type", "headline", "body", "backgroundType"],
                    },
                  },
                  caption: { type: "string" },
                },
                required: ["topic", "targetAudience", "slides", "caption"],
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_carousel" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const carousel = JSON.parse(toolCall.function.arguments);
    console.log("Text content generated, processing visual assets...");

    // Image generation / Asset resolution
    const processedSlides = [];
    const slidesToGenerate = format === "single-image" ? [carousel.slides[0]] : carousel.slides;

    for (const slide of slidesToGenerate) {
      let imageUrl = "";

      if (slide.backgroundType === "asset" && slide.assetId) {
        // Construct public URL for the asset
        const { data } = supabase.storage.from("content-assets").getPublicUrl(`${slide.assetId}`);
        // Note: The previous select didn't actually return the filename path, just ID. 
        // We need to store the path or lookup properly. 
        // Correction: The table has 'file_path'. I should have selected that.
        // Let's do a quick lookup here if we have ID, or rely on client knowing the bucket pattern if I fix the initial query.
        // Better: Fix the initial query to return file_path or just do a lookup here if needed.
        // Actually, let's fix the logic below by re-fetching if needed or just trusting the assetId IS the file_path if I prompted it that way?
        // No, I prompted with ID.
        // Let's resolve the ID to a public URL.
        const { data: assetData } = await supabase.from("content_assets").select("filename").eq("id", slide.assetId).single();
        if (assetData) {
          const { data: publicUrlData } = supabase.storage.from("content-assets").getPublicUrl(assetData.filename);
          imageUrl = publicUrlData.publicUrl;
          console.log("Using asset:", imageUrl);
        }
      }

      if (!imageUrl && (slide.backgroundType === "generate" || !slide.assetId)) {
        // Fallback to generation
        const imagePrompt = `Create a professional LinkedIn background image for Lifetrek Medical.
HEADLINE CONTEXT: ${slide.headline}
BODY CONTEXT: ${slide.body}
STYLE: Professional medical device aesthetic, clean, technical.
${slide.imageGenerationPrompt || ""}
`;
        try {
          const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
          const imageData = await imageResponse.json();
          imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
        } catch (e) {
          console.error("Image gen error", e);
        }
      }

      processedSlides.push({
        ...slide,
        imageUrl
      });
    }

    return new Response(
      JSON.stringify({
        carousel: {
          ...carousel,
          slides: processedSlides,
          format,
          // Legacy support (list of URLs)
          imageUrls: processedSlides.map(s => s.imageUrl)
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
