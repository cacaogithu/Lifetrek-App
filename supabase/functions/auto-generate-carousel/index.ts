import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Full Auto Carousel Generation
 * AI handles everything: image selection/generation, text writing, positioning
 */
serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { request, userId } = await req.json();

        if (!request) {
            throw new Error("Request description is required");
        }

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            throw new Error("Gemini API not configured");
        }

        // Step 1: AI analyzes request and creates content strategy
        const strategyPrompt = `You are a LinkedIn content strategist for Lifetrek Medical, a precision medical device manufacturer.

User Request: "${request}"

TASK: Create a carousel content strategy. Decide:
1. Should we use existing facility photos or generate new AI backgrounds?
2. What should the headline be? (Portuguese, max 40 chars, impactful)
3. What should the subheadline be? (Portuguese, max 100 chars)
4. Where should text be positioned? (top or bottom)

RESPONSE (JSON only):
{
  "useExistingPhotos": <boolean>,
  "imageDescription": "<description of needed image>",
  "headline": "<Portuguese headline>",
  "subhead": "<Portuguese subheadline>",
  "textPosition": "top" | "bottom",
  "reasoning": "<brief explanation of choices>"
}`;

        const strategyResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: strategyPrompt }] }],
                    generationConfig: {
                        temperature: 0.7,
                        response_mime_type: "application/json"
                    }
                })
            }
        );

        if (!strategyResponse.ok) {
            throw new Error(`Gemini strategy failed: ${strategyResponse.status}`);
        }

        const strategyData = await strategyResponse.json();
        const strategy = JSON.parse(strategyData.candidates?.[0]?.content?.parts?.[0]?.text || "{}");

        console.log("AI Strategy:", strategy);

        // Step 2: Get image (browse storage or generate new)
        let imageSource: string;
        let imageMethod: string;

        if (strategy.useExistingPhotos) {
            // Browse existing photos
            const browseResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/browse-storage`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
                },
                body: JSON.stringify({ prompt: strategy.imageDescription })
            });

            const browseData = await browseResponse.json();
            imageSource = browseData.selectedImage?.path || '';
            imageMethod = 'ai-browse';
        } else {
            // Generate new image via composite function
            const compositeResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/composite-carousel-image`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`
                },
                body: JSON.stringify({
                    imageSource: 'ai-generated',
                    aiPrompt: strategy.imageDescription,
                    text: {
                        headline: strategy.headline,
                        subhead: strategy.subhead,
                        position: strategy.textPosition
                    }
                })
            });

            const compositeData = await compositeResponse.json();
            imageSource = compositeData.baseImage;
            imageMethod = 'generate';
        }

        // Step 3: Save to database
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL") ?? "",
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
        );

        const { data: carouselData, error: dbError } = await supabase
            .from('linkedin_carousels')
            .insert({
                admin_user_id: userId,
                topic: strategy.headline,
                format: 'single-image',
                slides: [{
                    type: 'content',
                    headline: strategy.headline,
                    body: strategy.subhead
                }],
                image_urls: [imageSource],
                caption: `${strategy.headline}\n\n${strategy.subhead}`,
                generation_method: `auto-${imageMethod}`,
                generation_settings: {
                    mode: 'auto',
                    userRequest: request,
                    strategy: strategy
                }
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return new Response(
            JSON.stringify({
                success: true,
                carousel: carouselData,
                strategy: {
                    reasoning: strategy.reasoning,
                    imageMethod: strategy.useExistingPhotos ? 'Existing photos' : 'AI generated'
                }
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in auto-generate-carousel:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
