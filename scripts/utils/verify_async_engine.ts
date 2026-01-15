import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Load env vars from .env file not possible easily in Deno without config, 
// so we assume user provides them or we hardcode for the test if it was local,
// but better to ask user to run with env vars.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY required.");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyAsyncEngine() {
    console.log("🚀 Starting Async Engine Verification...");

    // 1. Create a Test Job
    console.log("1. Enqueuing Test Job...");
    const payload = {
        topic: "Verification Test",
        targetAudience: "Developers",
        painPoint: "Testing Async Queues",
        format: "single-image", // Faster
        profileType: "company",
        action: "test_run" // We might check this in worker to skip heavy AI
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
        console.error("❌ Failed to insert job:", error);
        return;
    }
    console.log(`✅ Job Created: ${job.id}`);

    // 1.5 Simulate Webhook (Invoke Dispatcher Manually)
    // COMMENTED OUT: We are now testing the REAL Webhook!
    /*
    console.log("1.5 Simulating Webhook -> Dispatcher...");
    const { error: dispatchError } = await supabase.functions.invoke('worker-dispatcher', {
        body: {
            type: 'INSERT',
            record: job
        },
        headers: {
             Authorization: `Bearer ${Deno.env.get("SERVICE_ROLE_KEY") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`
        }
    });

    if (dispatchError) {
        console.error("❌ Dispatcher Invocation Failed:", dispatchError);
    } else {
        console.log("✅ Dispatcher Invoked Successfully.");
    }
    */


    // 2. Poll for Updates
    console.log("2. Waiting for Dispatcher (Polling)...");

    let attempts = 0;
    const maxAttempts = 30; // 60 seconds

    const interval = setInterval(async () => {
        attempts++;
        const { data: current, error: pollError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', job.id)
            .single();

        if (pollError) {
            console.error("Poll Error:", pollError);
            return;
        }

        console.log(`... Status: ${current.status} (${attempts}/${maxAttempts})`);

        if (current.status === 'processing') {
            // Good!
        }

        if (current.status === 'completed') {
            console.log("✅ Job Completed Successfully!");
            console.log("Result Preview:", JSON.stringify(current.result).substring(0, 100) + "...");
            clearInterval(interval);
            Deno.exit(0);
        }

        if (current.status === 'failed') {
            console.error("❌ Job Failed:", current.error);
            clearInterval(interval);
            Deno.exit(1);
        }

        if (attempts >= maxAttempts) {
            console.error("❌ Timeout waiting for job completion.");
            console.error("Possible Causes: Dispatcher not deployed, DB Webhook not active, or Worker crashed.");
            clearInterval(interval);
            Deno.exit(1);
        }

    }, 2000);
}

verifyAsyncEngine();
