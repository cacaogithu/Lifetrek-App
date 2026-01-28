import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';
import * as dotenv from "https://deno.land/std@0.207.0/dotenv/mod.ts";

const env = await dotenv.load();
const supabaseUrl = env.SUPABASE_URL || Deno.env.get("SUPABASE_URL");
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function downloadContent() {
    console.log("🔍 Fetching generated content from jobs table...");

    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'completed')
        .not('result', 'is', null);

    if (error) {
        console.error("Error fetching jobs:", error);
        return;
    }

    const results = jobs.map(job => ({
        job_id: job.id,
        type: job.job_type,
        topic: job.payload?.topic,
        completed_at: job.completed_at,
        result: job.result
    }));

    const filename = "generated_content_backup.json";
    await Deno.writeTextFile(filename, JSON.stringify(results, null, 2));

    console.log(`✅ Successfully saved ${results.length} items to ${filename}`);
    console.log("You can find the raw content in the 'result' field of each item in the JSON file.");
}

downloadContent();
