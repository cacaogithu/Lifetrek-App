import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function verifyLogosJob() {
    console.log("🚀 Starting Logo Verification Job...");

    // Basic payload
    const payload = {
        topic: "Quality Assurance",
        targetAudience: "Medical Device Manufacturers",
        painPoint: "Compliance headaches",
        desiredOutcome: "ISO 13485 Certified Peace of Mind",
        format: "carousel",
        profileType: "company",
        style: "text-heavy", // Critical
        action: "generate_carousel"
    };

    // 1. Insert Job
    const { data: job, error: insertError } = await supabase
        .from('jobs')
        .insert({
            type: 'generate_linkedin_carousel',
            payload: payload,
            status: 'pending'
        })
        .select()
        .single();

    if (insertError) {
        console.error("❌ Failed to insert job:", insertError);
        Deno.exit(1);
    }

    console.log(`✅ Job Inserted: ${job.id}. Waiting for processing...`);

    // 2. Poll
    let attempts = 0;
    while (attempts < 60) {
        attempts++;
        await new Promise(r => setTimeout(r, 2000));

        const { data: updatedJob, error: pollError } = await supabase
            .from('jobs')
            .select('*')
            .eq('id', job.id)
            .single();

        if (pollError) {
            console.error("⚠️ Error polling job:", pollError);
            continue;
        }

        console.log(`... Status: ${updatedJob.status}`);

        if (updatedJob.status === 'completed') {
            console.log("\n🎉 Job Completed Successfully!");
            const result = updatedJob.result;
            const imageUrls = result.carousel.imageUrls;

            console.log(`📸 Generated ${imageUrls.length} images.`);
            if (imageUrls.length > 0) {
                console.log("Example Image URL:", imageUrls[0].substring(0, 100) + "...");
            }
            break;
        } else if (updatedJob.status === 'failed') {
            console.error("\n❌ Job Failed:", updatedJob.error);
            break;
        }
    }
}

verifyLogosJob();
