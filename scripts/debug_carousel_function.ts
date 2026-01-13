import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugFunction() {
    console.log("🔍 Invoking generate-linkedin-carousel (SYNC MODE)...");

    const { data, error } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: {
            // The function fetches the job from DB, so we need a real job ID or we need to mock the DB response?
            // Wait, the function receives { job_id: ... }. It then fetches the job.
            // If I run locally, I might not have the job in the local DB if I'm connecting to remote.
            // Actually, 'supabase functions serve' connects to local DB by default unless configured?
            // No, can be --no-verify-jwt.
            // Let's see: The function assumes it receives { job_id: ... }
            // AND it connects to Supabase to fetch that job.
            // If I provide a job_id that doesn't exist, it will fail.
            // So I need to insert a job first? Or mock the function?
            // The function code:
            // const { job_id } = await req.json();
            // const { data: job, error } = await supabase.from('jobs').select('*').eq('id', job_id).single();

            // I can't easily mock the DB call inside the function without changing code.
            // But I can insert a job into the *remote* DB (since my .env points there?) or local?
            // Usually 'supabase start' runs local DB.

            // Let's try to just invoke it and see what happens.
            // If I want to test the Satori part, I need the job payload to be correct.
            // The function fetches the job.

            // Alternative: I can temporarily modify the function to accept payload directly for debugging?
            // Or I can just insert a job into the remote DB (which I have access to via valid keys in .env) and use that ID.
            // My .env likely points to the remote project.
            job_id: "fec459bb-67d8-4aa4-94bf-c76817def8ae", // Use the FAILED job ID, it still exists in the DB.
            style: "text-heavy"
        }
    });

    if (error) {
        console.error("❌ Invocation Error:", error);
        if (error.context) {
            try {
                const body = await error.context.text();
                console.error("❌ Response Body:", body);
            } catch (e) {
                console.error("Could not read response body:", e);
            }
        }
    } else {
        console.log("✅ Success! Data:", data);
    }
}

debugFunction();
