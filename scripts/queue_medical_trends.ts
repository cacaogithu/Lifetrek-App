import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as dotenv from 'https://deno.land/x/dotenv/mod.ts';

// Load environment variables
dotenv.config({ path: './supabase/functions/.env', export: true });

const SUPABASE_URL = "https://dlflpvmdzkeouhgqwqba.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const trends = [
    {
        title: "The Future is Custom-Fit: Personalization in Medical Devices",
        content: "The one-size-fits-all era in medical devices is ending. By 2026, hyper-personalized medicine won't just be a trend—it will be the standard of care...",
    },
    {
        title: "The Robotic Revolution: Smaller, Smarter Surgical Instruments",
        content: "Surgical robots are getting smarter, and the instruments they use are getting smaller...",
    },
    {
        title: "The ASC Shift: Rethinking Instrument Design & Efficiency",
        content: "The hospital is no longer the only center for surgery. By 2026, the migration of procedures like joint replacements to Ambulatory Surgery Centers (ASCs) will be in full swing...",
    },
    {
        title: "Beyond the Mechanical Axis: The New Era of Orthopedic Implants",
        content: "For decades, orthopedic surgery has been about restoring a standard mechanical axis. By 2026, the focus will shift to restoring the patient's natural joint motion...",
    },
    {
        title: "AI & Data-Driven Manufacturing: The Competitive Advantage",
        content: "By 2026, AI won't just be diagnosing diseases—it will be optimizing every aspect of medical device manufacturing...",
    },
    {
        title: "Tariffs, Reshoring & Supply Chain Resilience",
        content: "Trade wars. Tariffs. Supply chain disruptions. By 2026, these aren't just headlines—they're business realities...",
    },
    {
        title: "Remote Patient Monitoring & the Demand for Precision Components",
        content: "Wearables and remote patient monitoring are transforming healthcare. By 2026, these devices will be as common as smartphones...",
    },
    {
        title: "3D Printing & CNC: The Perfect Partnership for Medical Innovation",
        content: "3D printing is revolutionizing medical device design. But here's the truth: additive manufacturing and CNC machining aren't competitors—they're partners...",
    }
];

async function main() {
    // Get a super admin user ID to associate the jobs with
    const { data: admin } = await supabase
        .from('admin_permissions')
        .select('user_id')
        .eq('is_super_admin', true)
        .limit(1)
        .single();

    const userId = admin?.user_id || '00000000-0000-0000-0000-000000000000'; // Fallback if no admin found

    console.log(`Using user_id: ${userId}`);

    for (const trend of trends) {
        console.log(`Queuing job: ${trend.title}`);
        const { data: job, error } = await supabase
            .from('jobs')
            .insert({
                user_id: userId,
                job_type: 'carousel_generate',
                status: 'pending',
                payload: {
                    topic: trend.title,
                    content: trend.content,
                    language: 'Portuguese',
                    format: 'carousel'
                }
            })
            .select()
            .single();

        if (error) {
            console.error(`Error queuing ${trend.title}:`, error.message);
        } else {
            console.log(`Successfully queued job ${job.id}`);

            // Trigger the dispatcher manually for each job to be safe
            await supabase.functions.invoke('worker-dispatcher', {
                body: { record: job }
            });
        }
    }
}

main();
