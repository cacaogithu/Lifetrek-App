
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts"; // Not used but keeps imports clean

const FUNCTION_URL = `https://dlflpvmdzkeouhgqwqba.supabase.co/functions/v1/repurpose-content`;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(Deno.env.get("SUPABASE_URL")!, SUPABASE_SERVICE_ROLE_KEY);

console.log("🧪 Testing repurpose-content (Async)...");

// 1. Create Job
const { data: job, error: jobError } = await supabase.from('jobs').insert({
    type: 'repurpose_content',
    status: 'pending',
    payload: { content: "Remote Work Best Practices. 1. Communication. 2. Boundaries." },
    user_id: (await supabase.auth.admin.listUsers()).data.users[0].id
}).select().single();

if (jobError) {
    console.error("❌ Failed to create job:", jobError);
    Deno.exit(1);
}

const jobId = job.id;
console.log(`✅ Job Created: ${jobId}`);

// 2. Dispatch to Function
try {
    const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
            job_id: jobId,
            content: job.payload.content
        })
    });

    if (response.status !== 202) {
        throw new Error(`Function failed: ${response.status} ${await response.text()}`);
    }
    console.log("✅ Function Dispatched (202 Accepted)");

    // 3. Poll for Completion
    let attempts = 0;
    while (attempts < 30) {
        const { data: updatedJob } = await supabase.from('jobs').select('*').eq('id', jobId).single();

        if (updatedJob.status === 'completed') {
            console.log("\n✅ Job Completed!");
            console.log("Result:", JSON.stringify(updatedJob.result, null, 2));

            if (updatedJob.result.rag_references > 0) {
                console.log("✅ RAG successful (References found)");
            } else {
                console.warn("⚠️ RAG returned 0 references");
            }
            break;
        } else if (updatedJob.status === 'failed') {
            console.error("\n❌ Job Failed:", updatedJob.error);
            break;
        }

        process.stdout.write(".");
        await new Promise(r => setTimeout(r, 1000));
        attempts++;
    }

} catch (e) {
    console.error("❌ Test Failed:", e.message);
}
