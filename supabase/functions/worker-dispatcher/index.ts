import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Worker Dispatcher initialized");

serve(async (req: Request) => {
    let record: any = null;

    try {
        const payload = await req.json();
        const { type: eventType } = payload;
        record = payload.record;

        // Only process INSERT events
        if (eventType !== 'INSERT' || !record) {
            return new Response("Ignored non-INSERT event", { status: 200 });
        }

        console.log(`Received Job ${record.id} [${record.job_type}]`);

        // 1. Check Schedule (Buffer of 10s for clock skew / processing time)
        // If scheduled_for is in the future, we IGNORE it. 
        if (record.scheduled_for) {
            const scheduledTime = new Date(record.scheduled_for).getTime();
            const now = Date.now();

            // If job is 10s or more in the future, skip dispatch
            if (scheduledTime > now + 10000) {
                console.log(`Job ${record.id} is scheduled for future (${record.scheduled_for}). Skipping dispatch.`);
                return new Response("Scheduled (Future)", { status: 200 });
            }
        }

        // 2. Route to Worker
        const workerMap: Record<string, string> = {
            'carousel_generation': 'generate-linkedin-carousel',
            'carousel_generate': 'generate-linkedin-carousel',
            'generate_linkedin_carousel': 'generate-linkedin-carousel',
            'blog_generation': 'generate-blog-post',
            'blog_generate': 'generate-blog-post'
        };

        const functionName = workerMap[record.job_type];

        if (!functionName) {
            console.error(`No worker mapped for job type: ${record.job_type}`);
            return new Response("Unknown Job Type", { status: 400 });
        }

        console.log(`Routing to worker: ${functionName}`);

        // 3. Invoke Worker (Using Raw Fetch for Debugging)
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const serviceKey = Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

        console.log(`Dispatching to ${functionName} at ${supabaseUrl}`);
        console.log(`Service Key Present: ${!!serviceKey} (Length: ${serviceKey?.length})`);

        const invokeUrl = `${supabaseUrl}/functions/v1/${functionName}`;

        const response = await fetch(invokeUrl, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${serviceKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ job_id: record.id })
        });

        if (!response.ok) {
            let errorDetails = await response.text();
            console.error(`Failed to invoke worker ${functionName}:`, response.status, errorDetails);

            // Update job status to failed
            const supabase = createClient(supabaseUrl, serviceKey);
            await supabase.from('jobs').update({
                status: 'failed',
                error: `Dispatcher Invoke Error (${response.status}): ${errorDetails}`
            }).eq('id', record.id);

            return new Response(`Invoke Error: ${errorDetails}`, { status: 500 });
        }

        return new Response(`Dispatched to ${functionName}`, { status: 200 });

    } catch (err) {
        console.error("Dispatcher Error:", err);
        const errorMsg = err instanceof Error ? err.message : String(err);

        if (record && record.id) {
            const supabase = createClient(
                Deno.env.get("SUPABASE_URL")!,
                Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
            );
            await supabase.from('jobs').update({
                status: 'failed',
                error: `Dispatcher Crash: ${errorMsg}`
            }).eq('id', record.id);
        }

        return new Response(`Internal Server Error: ${errorMsg}`, { status: 500 });
    }
});
