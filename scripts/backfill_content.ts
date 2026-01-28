import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

const supabaseUrl = "https://dlflpvmdzkeouhgqwqba.supabase.co";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfill() {
    console.log("🚀 Starting backfill of generated content...");

    const { data: jobs, error: jobsError } = await supabase
        .from('jobs')
        .select('*')
        .eq('status', 'completed')
        .not('result', 'is', null)
        .ilike('payload->>topic', '%medical%');

    if (jobsError) {
        console.error("Error fetching jobs:", jobsError);
        return;
    }

    console.log(`Found ${jobs.length} completed medical jobs to backfill.`);

    for (const job of jobs) {
        const result = job.result;
        const userId = job.user_id;
        const topic = job.payload?.topic;

        if (job.job_type === 'carousel_generate') {
            const carousel = result.carousel;
            const metrics = result.metadata?.generation_metadata;

            const insertData = {
                admin_user_id: userId,
                user_id: userId,
                topic: topic,
                target_audience: job.payload?.targetAudience || 'Medical Professionals',
                pain_point: job.payload?.painPoint || 'Unknown',
                desired_outcome: job.payload?.desiredOutcome || 'Innovation',
                slides: carousel.slides,
                caption: carousel.caption,
                format: carousel.format || 'carousel',
                image_urls: carousel.imageUrls || [],
                status: 'pending_approval',
                generation_settings: { source: 'backfill', original_job_id: job.id }
            };

            const { data, error } = await supabase.from('linkedin_carousels').insert([insertData]).select().single();
            if (error) {
                console.error(`Failed to backfill carousel for job ${job.id}:`, error.message);
            } else {
                console.log(`✅ Backfilled carousel: ${topic}`);
            }
        } else if (job.job_type === 'blog_generate') {
            const insertData = {
                author_id: userId,
                user_id: userId,
                title: result.title,
                content: result.content,
                excerpt: result.excerpt,
                status: 'pending_review',
                ai_generated: true,
                metadata: { source: 'backfill', original_job_id: job.id }
            };

            const { data, error } = await supabase.from('blog_posts').insert([insertData]).select().single();
            if (error) {
                console.error(`Failed to backfill blog for job ${job.id}:`, error.message);
            } else {
                console.log(`✅ Backfilled blog: ${result.title}`);
            }
        }
    }

    console.log("🏁 Backfill complete.");
}

backfill();
