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
    const { topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, format = "carousel", profileType = "company" } = await req.json();

    console.log("Generating LinkedIn content:", { topic, targetAudience, format, profileType });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    // Context definitions based on profile type
    const contexts = {
      company: {
        role: "authoritative industry leader",
        tone: "professional, innovative, and reliable",
        pronoun: "we",
        perspective: "As a leader in medical manufacturing...",
        imageStyle: "Corporate, clean, highly engineered, official branding elements."
      },
      salesperson: {
        role: "expert medical device consultant",
        tone: "helpful, knowledgeable, and approachable",
        pronoun: "I",
        perspective: "In my experience working with OEMs...",
        imageStyle: "Professional but accessible, focus on the 'expert' view, slightly more dynamic."
      }
    };

    const ctx = contexts[profileType as keyof typeof contexts] || contexts.company;

    // Build the system prompt with Hormozi principles and LinkedIn best practices
    const systemPrompt = `You are an expert LinkedIn content strategist acting as a ${ctx.role}. You follow Alex Hormozi's $100M framework and LinkedIn carousel best practices.

CORE PRINCIPLES:
1. ONE core problem/question per carousel
2. Hook = Callout + Implied Value
3. Use proof early (experience, certifications, outcomes)
4. Always include low-friction CTA
5. Favor reusable winners
6. VOICE & TONE: Use "${ctx.pronoun}" language. Be ${ctx.tone}. Perspective: ${ctx.perspective}

CAROUSEL STRUCTURE:
- Slide 1 (Hook): Bold hook with ICP callout + promise/risk. 1-2 sentences max, create curiosity gap.
- Slides 2-N (Content): One key idea per slide. Use bullets/numbers. Mix text with concepts. Specific language. Tie to business outcomes.
- Last Slide (CTA): Single clear CTA. State what they get and why it matters. Low friction.

CONTENT RULES:
- Headline: 5-10 words, attention-grabbing, benefit-led
- Body: 20-40 words max, scannable
- Use "${ctx.pronoun}" language (e.g., "${ctx.pronoun === 'we' ? "We help" : "I help"}")
- 1-2 professional emojis per slide (✅ ⚠️ ⏱️)
- High technical credibility, minimal jargon
- Every carousel: calls out audience + promises outcome + clear next step

TARGET AUDIENCE CONTEXT:
${targetAudience}: These are professionals in medical device manufacturing who care about quality, compliance, speed-to-market, and risk mitigation.`;

    const userPrompt = `Generate a LinkedIn carousel for my ${profileType} profile with the following details:

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
- Includes relevant hashtags
- Ends with the CTA
- Uses the "${ctx.pronoun}" voice appropriately`;

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
                        type: {
                          type: "string",
                          enum: ["hook", "content", "cta"],
                        },
                        headline: { type: "string" },
                        body: { type: "string" },
                      },
                      required: ["type", "headline", "body"],
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

    const carousel = JSON.parse(toolCall.function.arguments);

    console.log("Text content generated, now generating images...");

    // Brand-specific image generation system prompt
    const imageSystemPrompt = `You are a professional graphic designer for Lifetrek Medical, a precision medical device manufacturer.

BRAND COLORS:
- Corporate Blue: #004F8F (primary - trust, precision)
- Innovation Green: #1A7A3E (accents - innovation)
- Energy Orange: #F07818 (highlights - use sparingly)

DESIGN PRINCIPLES:
- Clean, modern, minimalist
- Professional medical device aesthetic
- High contrast for readability
- Inter font for text overlays
- Technical excellence without overwhelming
- STYLE VARIATION: This is for a ${profileType.toUpperCase()} profile. ${ctx.imageStyle}

VISUAL STYLE:
- Professional medical device imagery
- Technical precision (CNC machines, implants, quality)
- Clean backgrounds with subtle blue tinting
- B2B professional, not consumer-facing

TARGET: Medical device OEMs, orthopedic/dental manufacturers, quality engineers

Generate LinkedIn-ready images (1080x1080px) that command attention while maintaining technical credibility.`;

    // Generate images for each slide
    const imageUrls: string[] = [];
    const slidesToGenerate = format === "single-image" ? [carousel.slides[0]] : carousel.slides;

    for (const slide of slidesToGenerate) {
      const imagePrompt = format === "single-image" 
        ? `Create a professional LinkedIn single-image post for Lifetrek Medical (${profileType} profile).

CONTENT:
Topic: ${carousel.topic}
Headline: ${slide.headline}
Key Points: ${slide.body}

LAYOUT:
- Bold headline at top using Corporate Blue (#004F8F)
- Clean background with subtle medical device imagery
- Key text overlays in white/high contrast
- Lifetrek Medical branding ${profileType === 'company' ? 'prominent' : 'subtle'}
- 1080x1080px square format
- Modern, professional, attention-grabbing
- Include relevant icons or visual elements that represent precision manufacturing

Style: Professional B2B LinkedIn post, medical device industry`
        : `Create a LinkedIn carousel slide image for Lifetrek Medical (${profileType} profile).

SLIDE TYPE: ${slide.type}
HEADLINE: ${slide.headline}
BODY: ${slide.body}

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
            model: "google/gemini-2.5-flash-image",
            messages: [
              { role: "system", content: imageSystemPrompt },
              { role: "user", content: imagePrompt }
            ],
            modalities: ["image", "text"]
          }),
        });

        if (!imageResponse.ok) {
          console.error("Image generation error:", imageResponse.status);
          imageUrls.push(""); // Push empty string on error
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

    console.log(`Content generation complete: ${imageUrls.length} images generated`);

    return new Response(
      JSON.stringify({ 
        carousel: {
          ...carousel,
          format,
          imageUrls
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
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
