import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Missing Env Vars");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugAsyncHandler() {
    console.log("🔍 Setup: Creating a test job...");

    // 1. Create Job with NO user_id (Service Role should allow it if nullable, or we need to see).
    const payload = {
        topic: "Async Debug",
        targetAudience: "Systems",
        painPoint: "Latency",
        format: "single-image",
        profileType: "company",
        action: "test_run"
    };

    const { data: job, error } = await supabase
        .from('jobs')
        .insert({
            type: 'carousel_generation',
            status: 'pending',
            payload: payload
        })
        .select()
        .single();

    if (error) {
        console.error("❌ Job Creation Failed:", error);
        return;
    }
    console.log(`✅ Job Created: ${job.id}`);

    // 2. Invoke generate-linkedin-carousel in ASYNC mode
    console.log("🔍 Invoking generate-linkedin-carousel (ASYNC MODE - with job_id)...");

    const { data, error: invokeError } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: { job_id: job.id }
    });

    if (invokeError) {
        console.error("❌ Invocation Error:", invokeError);
        if (invokeError.context) {
            try {
                const body = await invokeError.context.text();
                // Check if body is parsable
                try {
                    const json = JSON.parse(body);
                    console.error("❌ Response JSON:", json);
                } catch {
                    console.error("❌ Response Body (Raw):", body);
                }
            } catch (e) {
                console.error("Could not read response body:", e);
            }
        }
    } else {
        console.log("✅ Success! Function returned:", data);
    }
}

debugAsyncHandler();
