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
    const { topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction } = await req.json();

    console.log("Generating LinkedIn carousel for:", { topic, targetAudience });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

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

TARGET AUDIENCE CONTEXT:
${targetAudience}: These are professionals in medical device manufacturing who care about quality, compliance, speed-to-market, and risk mitigation.`;

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

Also create an engaging LinkedIn caption (150-200 words) that:
- Opens with the same hook as slide 1
- Teases the carousel content
- Includes relevant hashtags
- Ends with the CTA`;

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

    console.log("Carousel generated successfully");

    return new Response(
      JSON.stringify({ carousel }),
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
