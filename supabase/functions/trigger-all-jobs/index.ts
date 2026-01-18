import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get ALL jobs that are not completed/failed
    const { data: jobs } = await supabase
        .from('jobs')
        .select('*')
        .in('status', ['pending', 'processing']);

    const results = [];

    for (const job of jobs || []) {
        const type = job.job_type === 'carousel_generate' ? 'generate-linkedin-carousel' : 'generate-blog-post';
        console.log(`🚀 Fire-and-forget trigger for ${type} (Job: ${job.id})`);

        // We don't await the body parsing, just the initial request if needed, 
        // or use a short timeout
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), 1000); // 1s timeout to just send the request

        try {
            fetch(`${supabaseUrl}/functions/v1/${type}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${supabaseKey}`
                },
                body: JSON.stringify({ ...job.payload, job_id: job.id }),
                signal: controller.signal
            }).catch(e => console.log(`Trigger backgrounded for ${job.id}`));

            results.push({ job_id: job.id, triggered: true });
        } catch (e) {
            results.push({ job_id: job.id, error: e.message });
        }
    }

    return new Response(JSON.stringify({ triggeredCount: jobs?.length, results }), {
        headers: { "Content-Type": "application/json" }
    });
});
