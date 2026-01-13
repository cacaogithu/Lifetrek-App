import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * AI Storage Browser
 * Uses Gemini to intelligently select the best image from available assets
 * based on the user's content description
 */
serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { prompt, category = 'all' } = await req.json();

        if (!prompt) {
            throw new Error("Prompt is required");
        }

        const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
        if (!GEMINI_API_KEY) {
            throw new Error("Gemini API not configured");
        }

        // Define available image assets
        // In production, this could be dynamic from Supabase Storage
        const availableImages = [
            { path: 'src/assets/facility/exterior.jpg', description: 'Modern facility exterior, professional' },
            { path: 'src/assets/facility/cleanroom.jpg', description: 'ISO cleanroom environment, sterile manufacturing' },
            { path: 'src/assets/facility/reception.jpg', description: 'Professional reception area, corporate' },
            { path: 'src/assets/facility/factory-exterior-hero.webp', description: 'Large facility exterior, industrial' },
        ];

        // Filter by category if specified
        let imagesToConsider = availableImages;
        if (category !== 'all') {
            imagesToConsider = availableImages.filter(img => img.path.includes(`/${category}/`));
        }

        // Build prompt for Gemini
        const systemPrompt = `You are an AI assistant helping select the most appropriate image for social media content.

User's content: "${prompt}"

Available images:
${imagesToConsider.map((img, idx) => `${idx + 1}. ${img.path} - ${img.description}`).join('\n')}

TASK: Select the single best image that matches the user's content. Consider:
- Visual relevance to the topic
- Professional quality
- Brand alignment (medical/manufacturing)

RESPONSE FORMAT (JSON only):
{
"selectedIndex": <number 0-${imagesToConsider.length - 1}>,
"confidence": <number 0-100>,
"reasoning": "<brief explanation>"
}`;

        // Call Gemini API
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: systemPrompt }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        response_mime_type: "application/json"
                    }
                })
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API failed: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!resultText) {
            throw new Error("No response from Gemini");
        }

        const selection = JSON.parse(resultText);
        const selectedImage = imagesToConsider[selection.selectedIndex];

        return new Response(
            JSON.stringify({
                selectedImage: {
                    path: selectedImage.path,
                    description: selectedImage.description,
                    confidence: selection.confidence,
                    reasoning: selection.reasoning
                },
                allImages: imagesToConsider
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Error in browse-storage:", error);
        return new Response(
            JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
        );
    }
});
