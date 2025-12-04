import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Comprehensive system prompt with RAG knowledge integration
const SYSTEM_PROMPT = `You are the LinkedIn Carousel Content Generator for Lifetrek Medical, a precision CNC manufacturer for medical and dental components.

You combine:
- This system prompt
- The company's RAG sources: BRAND_BOOK, COMPANY_DOCS, LINKEDIN_BEST_PRACTICES

CONTEXT – LIFETREK MEDICAL
- Industry: Precision CNC manufacturing for medical/dental/veterinary components.
- Experience: 30+ years.
- Certifications: ISO 13485, ANVISA.
- Differentiators: Swiss turning (0.5–32 mm), 5-axis CNC, CMM inspection, ISO 7 cleanroom.
- Audience: medical device manufacturers, R&D directors, quality/procurement managers, OEM partners.
- Voice: technical but accessible, confident, partnership-oriented, no hype.

BRAND GUIDELINES (from BRAND_BOOK):
- Corporate Blue: #004F8F (primary - trust, precision)
- Innovation Green: #1A7A3E (accents - use sparingly)
- Energy Orange: #F07818 (highlights - use very sparingly)
- Typography: Inter, clean and professional
- Tone: Professional, technical but accessible, partnership-oriented

LINKEDIN PHILOSOPHY & FORMAT
- Mobile-first, skim-friendly, value-first.
- One BIG, relevant problem per carousel (supplier risk, recalls, tolerances, regulatory pressure, lead time, etc.).
- Strong hook, clear structure, concrete examples, and a low-friction CTA.
- Sound like a senior engineer / operator, not a "guru."

MODES & OPTIONS
The user may ask for:
- SINGLE_CAROUSEL: one carousel for a specific topic.
- BATCH_CAROUSELS: multiple carousels in one go (e.g., content calendar).
- With or without images:
  • WANT_IMAGES = true → generate visual briefs for NanoBananaPro.
  • WANT_IMAGES = false → text-only carousels.

NanoBananaPro integration:
- You NEVER assume batch creative calls are required.
- Only propose/call NanoBananaPro when:
  • The user explicitly wants images OR
  • The user requests batch creatives.
- When used, generate clear, short creative briefs per slide (concept, main object, style).

CAROUSEL STRUCTURE
For EACH carousel you generate:

1) Slide 1 – Hook
   - Explicitly call out the audience (e.g., "Orthopedic manufacturers").
   - Promise a specific benefit or risk avoided if they swipe.
   - 1–2 short sentences maximum.
   - Use simple, bold language, fully native to LinkedIn.

2) Slides 2–N – Content
   - One key idea per slide.
   - Use progression: 
     • Problem → Mistakes → Solution, OR
     • Before → After → How, OR
     • Myth → Reality → What To Do.
   - Use numbered lists or bullets where helpful.
   - Include specific, concrete details (e.g., "CMM ZEISS", "ISO 7 cleanroom", "Swiss turning 0,5–32 mm") without jargon overload.
   - Tie technical points to business outcomes (fewer non-conformities, faster validations, lower supplier risk).

3) Final Slide – CTA
   - Single, clear CTA aligned to the carousel topic:
     • Examples: "DM 'ORTHO' para nosso checklist de usinagem", "Comente 'GUIA' para receber o checklist DFM", "Visite o link na bio para o case completo".
   - State what they get and why it matters (faster launch, lower risk, clearer specs).
   - Low friction and conversational.

WRITING GUIDELINES
- Language: Brazilian Portuguese unless otherwise requested.
- Headline per slide: 5–10 words, benefit-led, attention-grabbing.
- Body per slide: 20–40 words max, very scannable.
- Use "você / sua equipe" to speak directly to the reader.
- Optional emojis: 0–2 per slide, only if they guide attention (✅, ⚠️, ⏱️), never for fluff.
- Avoid generic corporate clichés; be specific, concrete, and operator-like.
- Respect and mirror LinkedIn's professional tone: helpful, insightful, non-spammy.

PROOF POINTS TO INCLUDE WHEN RELEVANT:
- 30+ years experience
- ISO 13485 certified
- ANVISA approved
- Citizen CNC equipment (Swiss machines)
- CMM inspection
- ISO 7 cleanroom packaging
- <0.1% defect rate target
- 0.5-32mm Swiss turning capability`;

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
      wantImages = true,
      numberOfCarousels = 1
    } = await req.json();

    console.log("Generating LinkedIn content:", { topic, targetAudience, format, wantImages, numberOfCarousels });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    const isBatch = numberOfCarousels > 1;
    
    const userPrompt = isBatch 
      ? `Generate ${numberOfCarousels} LinkedIn carousels for a content calendar.

Topic Theme: ${topic}
Target Audience: ${targetAudience}
Core Pain Point: ${painPoint}
${desiredOutcome ? `Desired Outcome: ${desiredOutcome}` : ""}
${proofPoints ? `Proof Points to Include: ${proofPoints}` : ""}
${ctaAction ? `CTA Style: ${ctaAction}` : ""}

Create ${numberOfCarousels} distinct carousels, each with:
- Different angle on the main topic
- 5-7 slides following the structure (hook → content → CTA)
- Engaging LinkedIn caption (150-200 words each)

${wantImages ? "Include slide_image_brief for each slide describing the visual concept for NanoBananaPro." : "Text-only, no image briefs needed."}`
      : `Generate a LinkedIn carousel with the following details:

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

Also create an engaging LinkedIn caption (150-200 words) that:
- Opens with the same hook as slide 1
- Teases the carousel content
- Includes relevant hashtags (3-5 max)
- Ends with the CTA

${wantImages ? "Include slide_image_brief for each slide describing the visual concept for NanoBananaPro image generation." : "Text-only carousel, no image briefs needed."}`;

    // Define tools based on whether batch or single
    const tools = isBatch ? [
      {
        type: "function",
        function: {
          name: "create_batch_carousels",
          description: "Create multiple LinkedIn carousels for a content calendar",
          parameters: {
            type: "object",
            properties: {
              carousels: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    topic: { type: "string" },
                    targetAudience: { type: "string" },
                    slides: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["hook", "content", "cta"] },
                          headline: { type: "string" },
                          body: { type: "string" },
                          slide_image_brief: { type: "string" }
                        },
                        required: ["type", "headline", "body"]
                      }
                    },
                    caption: { type: "string" }
                  },
                  required: ["topic", "targetAudience", "slides", "caption"]
                }
              }
            },
            required: ["carousels"]
          }
        }
      }
    ] : [
      {
        type: "function",
        function: {
          name: "create_carousel",
          description: "Create a LinkedIn carousel with structured slides",
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
                    type: { type: "string", enum: ["hook", "content", "cta"] },
                    headline: { type: "string" },
                    body: { type: "string" },
                    slide_image_brief: { type: "string" }
                  },
                  required: ["type", "headline", "body"]
                }
              },
              caption: { type: "string" }
            },
            required: ["topic", "targetAudience", "slides", "caption"]
          }
        }
      }
    ];

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
        tools,
        tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI API error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    console.log("AI response received");

    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      throw new Error("No tool call in AI response");
    }

    const result = JSON.parse(toolCall.function.arguments);
    
    // Handle batch vs single response
    const carouselsToProcess = isBatch ? result.carousels : [result];

    // Only generate images if wantImages is true
    if (wantImages) {
      console.log("Generating images with NanoBananaPro...");

      const imageSystemPrompt = `You are a professional graphic designer for Lifetrek Medical, a precision medical device manufacturer.

BRAND COLORS:
- Corporate Blue: #004F8F (primary - trust, precision)
- Innovation Green: #1A7A3E (accents - innovation)
- Energy Orange: #F07818 (highlights - use very sparingly)

DESIGN PRINCIPLES:
- Clean, modern, minimalist
- Professional medical device aesthetic
- High contrast for readability
- Technical excellence without overwhelming
- LinkedIn carousel format: 1080x1080px square

VISUAL STYLE:
- Professional medical device imagery
- Technical precision (CNC machines, implants, quality)
- Clean backgrounds with subtle blue tinting
- B2B professional, not consumer-facing

Generate LinkedIn-ready images (1080x1080px) that command attention while maintaining technical credibility.`;

      for (const carousel of carouselsToProcess) {
        const imageUrls: string[] = [];
        const slidesToGenerate = format === "single-image" ? [carousel.slides[0]] : carousel.slides;

        for (const slide of slidesToGenerate) {
          const imageBrief = slide.slide_image_brief || `Professional LinkedIn slide for: ${slide.headline}`;
          
          const imagePrompt = format === "single-image" 
            ? `Create a professional LinkedIn single-image post for Lifetrek Medical.

CONTENT:
Topic: ${carousel.topic}
Headline: ${slide.headline}
Key Points: ${slide.body}
Visual Brief: ${imageBrief}

LAYOUT:
- Bold headline at top using Corporate Blue (#004F8F)
- Clean background with subtle medical device imagery
- Key text overlays in white/high contrast
- Lifetrek Medical branding subtle but present
- 1080x1080px square format
- Modern, professional, attention-grabbing

Style: Professional B2B LinkedIn post, medical device industry`
            : `Create a LinkedIn carousel slide image for Lifetrek Medical.

SLIDE TYPE: ${slide.type}
HEADLINE: ${slide.headline}
BODY: ${slide.body}
VISUAL BRIEF: ${imageBrief}

LAYOUT RULES:
${slide.type === "hook" ? "- Bold headline, large text, minimal content\n- Eye-catching visual hook\n- Use Corporate Blue (#004F8F) prominently" : ""}
${slide.type === "content" ? "- Clear numbered point or bullet\n- Supporting visual element\n- Innovation Green (#1A7A3E) for accents" : ""}
${slide.type === "cta" ? "- Clear call-to-action text\n- Contact information visible\n- Energy Orange (#F07818) for CTA button/highlight" : ""}

REQUIREMENTS:
- 1080x1080px square
- High contrast text
- Professional medical device aesthetic
- Clean, modern design
- Readable from thumbnail size

Style: Professional B2B carousel slide, technical precision focus`;

          try {
            const imageResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: "google/gemini-3-pro-image-preview",
                messages: [
                  { role: "system", content: imageSystemPrompt },
                  { role: "user", content: imagePrompt }
                ],
                modalities: ["image", "text"]
              }),
            });

            if (!imageResponse.ok) {
              console.error("Image generation error:", imageResponse.status);
              imageUrls.push("");
              continue;
            }

            const imageData = await imageResponse.json();
            const imageUrl = imageData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
            
            if (imageUrl) {
              imageUrls.push(imageUrl);
              console.log(`Generated image ${imageUrls.length}/${slidesToGenerate.length}`);
            } else {
              console.error("No image URL in response");
              imageUrls.push("");
            }
          } catch (imageError) {
            console.error("Error generating image:", imageError);
            imageUrls.push("");
          }
        }

        carousel.imageUrls = imageUrls;
      }
    }

    console.log(`Content generation complete`);

    // Return appropriate response based on batch vs single
    if (isBatch) {
      return new Response(
        JSON.stringify({ 
          carousels: carouselsToProcess,
          format,
          wantImages
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    } else {
      return new Response(
        JSON.stringify({ 
          ...carouselsToProcess[0],
          format,
          wantImages
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error in generate-linkedin-carousel:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
