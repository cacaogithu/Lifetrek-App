
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
                    ? `Generate a SINGLE-IMAGE post with:
                       - 1 powerful hero image specification
                       - A comprehensive, value-packed caption (200-500 words)
                       - Focus on Hook → Insight/Framework → Low-friction CTA
                       Output as JSON: { "image_headline": "...", "image_description": "...", "caption": "..." }`
                    : `Generate a 5-slide CAROUSEL with:
                       - Slide 1: Hook (callout + payoff)
                       - Slides 2-4: Value/insights
                       - Slide 5: CTA
                       Output as JSON Array: [{ "slide_number": 1, "title": "Hook", "body": "...", "design_note": "..." }, ...]`;

                const postTypeInstruction = postType === 'value'
                    ? `This is an EDUCATIONAL/VALUE post (80% content mix). CTA should be low-friction (PDF, checklist, DM "KEYWORD").`
                    : `This is a COMMERCIAL OFFER post (20% content mix). CTA can be stronger (schedule call, quote request).`;

                const prompt = `
                Role: Expert LinkedIn Content Creator for Lifetrek Medical.
                Task: Create high-engagement LinkedIn content based on the User Content.
                
                FORMAT: ${format.toUpperCase()}
                POST TYPE: ${postType.toUpperCase()}
                
                ${formatInstruction}
                
                ${postTypeInstruction}
                
                Reference Styles (Use these for structural inspiration only):
                ${ragContext}
                
                User Content:
                "${content || url}"
                
                IMPORTANT: All content must be in PORTUGUESE (pt-BR).
                Use technical but accessible language.
                Focus on engineer-to-engineer tone, not salesy.
                `;

                const result = await model.generateContent(prompt);
                const text = result.response.text();
                const jsonMatch = text.match(/\[[\s\S]*\]/);
                const generatedJson = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

                const responseData = {
                    source: content ? 'text' : 'url',
                    rag_references: similarSlides?.length || 0,
                    carousel: generatedJson || text,
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
