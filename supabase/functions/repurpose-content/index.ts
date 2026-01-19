
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { job_id, content, url, format = 'carousel', postType = 'value' } = await req.json();

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

        if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

        // Async Processing Logic
        const processJob = async () => {
            try {
                if (job_id) {
                    await supabase.from('jobs').update({
                        status: 'processing',
                        started_at: new Date().toISOString()
                    }).eq('id', job_id);
                }

                console.log(`♻️ Repurposing Content (Job: ${job_id || 'sync'})...`);

                // 1. Generate Embedding
                const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
                const embedResult = await embedModel.embedContent(content || url);
                const vector = embedResult.embedding.values;

                // 2. RAG (Threshold 0.25)
                const { data: similarSlides, error: matchError } = await supabase.rpc('match_successful_carousels', {
                    query_embedding: vector,
                    match_threshold: 0.25,
                    match_count: 3
                });

                if (matchError) console.error("Match Error:", matchError);

                let ragContext = "";
                if (similarSlides?.length > 0) {
                    ragContext = JSON.stringify(similarSlides.map((s: any) => ({
                        topic: s.topic,
                        structure: s.slides,
                        score: s.quality_score
                    })), null, 2);
                }

                // 3. Generate Carousel
                const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
                const formatInstruction = format === 'single-image'
                    ? `Generate a SINGLE-IMAGE post structure:
                       - Exactly 1 slide in the "slides" array for the Hero Image visual context.
                       - Use "image_headline" as the "title" of that slide.
                       - A comprehensive, "mini-article" style caption in the "caption" field (300-600 words).
                       - Caption structure: Hook → Framework/Insight → Results → CTA.`
                    : `Generate a CAROUSEL post structure:
                       - 5-7 slides in the "slides" array.
                       - Slide 1: Hook. Slides 2-N: Value. Final Slide: CTA.
                       - A concise, engaging caption in the "caption" field (50-100 words).`;

                const postTypeInstruction = postType === 'value'
                    ? `POST TYPE: EDUCATIONAL/VALUE. Focus on teaching, frameworks, and standalone value (80% strategy). CTA: Low-friction resource (PDF, Checklist, or DM keyword).`
                    : `POST TYPE: COMMERCIAL. Focus on the Lifetrek solution, co-engineering, and manufacturing capacity (20% strategy). CTA: Stronger (Schedule meeting or Request quote).`;

                const prompt = `
                Role: Expert LinkedIn Content Strategist for Lifetrek Medical (ISO 13485 Manufacturing).
                Goal: Repurpose the provided content into a high-engagement LinkedIn post.
                
                FORMAT: ${format.toUpperCase()}
                ${formatInstruction}
                
                ${postTypeInstruction}
                
                Reference Styles for inspiration:
                ${ragContext}
                
                User Content to repurpose:
                "${content || url}"
                
                OUTPUT JSON FORMAT (STRICT):
                {
                  "slides": [
                    { "slide_number": 1, "title": "Headline", "body": "...", "design_note": "..." },
                    ...
                  ],
                  "caption": "Full LinkedIn post text here..."
                }

                LANGUAGE: All text MUST be in PORTUGUESE (pt-BR).
                Tone: Expert, technical, but conversion-focused. Avoid generic "marketing-speak".
                `;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                const generatedJson = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

                const responseData = {
                    source: content ? 'text' : 'url',
                    rag_references: similarSlides?.length || 0,
                    carousel: generatedJson, // Standardized structure: { slides, caption }
                    format: format,
                    postType: postType
                };

                // Update Job
                if (job_id) {
                    await supabase.from('jobs').update({
                        status: 'completed',
                        completed_at: new Date().toISOString(),
                        result: responseData
                    }).eq('id', job_id);
                }

                return responseData;

            } catch (err) {
                console.error("Processing Failed:", err);
                if (job_id) {
                    await supabase.from('jobs').update({
                        status: 'failed',
                        error: err.message,
                        completed_at: new Date().toISOString()
                    }).eq('id', job_id);
                }
            }
        };

        // Trigger Background Work
        EdgeRuntime.waitUntil(processJob());

        // Return Immediate Response
        return new Response(JSON.stringify({
            message: "Job dispatched",
            job_id,
            status: "processing"
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 202
        });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
