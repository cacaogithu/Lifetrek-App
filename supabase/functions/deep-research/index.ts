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
        const { topic, depth = 'basic', job_id } = await req.json();

        if (!topic) {
            throw new Error("Topic is required");
        }

        const PERPLEXITY_API_KEY = Deno.env.get('PERPLEXITY_API_KEY');
        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

        // Initialize Supabase Client (if job_id provided)
        let supabase;
        if (job_id && SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
            supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
            await supabase.from('jobs').update({
                status: 'processing',
                started_at: new Date().toISOString()
            }).eq('id', job_id);
        }

        console.log(`🔍 Deep Research requested for: ${topic} (${depth})`);

        // 1. Research Phase (Perplexity)
        let researchData = "";
        if (PERPLEXITY_API_KEY) {
            console.log("Found Perplexity Key, performing live research...");
            try {
                const perplexityRes = await fetch('https://api.perplexity.ai/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${PERPLEXITY_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'sonar',
                        messages: [
                            { role: 'system', content: 'You are a helpful research assistant. Provide detailed, cited information.' },
                            { role: 'user', content: `Research this topic in detail: ${topic}. Focus on: ${depth === 'deep' ? 'technical details, stats, examples' : 'key concepts and overview'}.` }
                        ]
                    })
                });
                const pData = await perplexityRes.json();
                researchData = pData.choices?.[0]?.message?.content || "No results from Perplexity.";
            } catch (e) {
                console.error("Perplexity Call Failed:", e);
                researchData = `Error fetching Perplexity data: ${e.message}`;
            }
        } else {
            console.warn("⚠️ No PERPLEXITY_API_KEY found. Using mock/Gemini internal knowledge.");
            researchData = "Simulated research data (Perplexity Key missing). Using Gemini's internal knowledge instead.";
        }

        // 2. Synthesis Phase (Gemini)
        console.log("🧠 Synthesizing report with Gemini Flash...");
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = `
    Role: You are a Senior Technical Researcher. 
    Task: Synthesize the provided research data into a comprehensive, structured report on: "${topic}".
    Goal: Provide a high-density, actionable report suitable for a product manager or engineer.
    
    Research Data:
    ${researchData}
    
    Report Structure (Markdown):
    # Executive Summary (2-3 sentences)
    # Key Findings (Bulleted list)
    # Deep Dive: ${topic}
    # Strategic Recommendations
    # Sources (Cited from data)
    `;

        const result = await model.generateContent(prompt);
        const report = result.response.text();

        const responseData = {
            topic,
            depth,
            report,
            source: PERPLEXITY_API_KEY ? 'PERPLEXITY+GEMINI' : 'GEMINI_ONLY'
        };

        // Update Job if applicable
        if (job_id && supabase) {
            await supabase.from('jobs').update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                result: responseData
            }).eq('id', job_id);
        }

        return new Response(JSON.stringify(responseData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        // Fail Job if applicable
        if (req && req.json) { // Verify we can even parse to get job_id if we failed earlier... 
            // Logic simplified: If we failed before parsing job_id, we can't update DB.
            // If we failed after, we might not have reference. 
            // Ideally we wrap the whole logic better, but for now just return error.
        }

        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
