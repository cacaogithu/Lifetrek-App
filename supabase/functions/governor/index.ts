import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.log("Governor initialized");

serve(async (req) => {
    try {
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        // 1. Fetch Governance Rules
        const { data: rules, error: rulesError } = await supabase
            .from('governance_rules')
            .select('*');

        if (rulesError) throw rulesError;

        const results = [];

        // 2. Process Each Rule (e.g., 'linkedin_outreach_daily')
        for (const rule of rules) {
            const { rule_key, config, current_usage } = rule;
            const { max, window_start, window_end, timezone } = config;

            console.log(`Checking Rule: ${rule_key}`, config);

            // A. Time Window Check
            const now = new Date();
            // Get current hour in the target timezone
            const localTime = now.toLocaleTimeString('en-US', { timeZone: timezone, hour12: false });
            // localTime format "HH:mm:ss"

            const inWindow = localTime >= window_start && localTime <= window_end;

            if (!inWindow) {
                console.log(`[${rule_key}] Outside Active Hours (${localTime}). Sleeping.`);
                results.push({ rule: rule_key, status: 'sleeping_hours' });
                continue;
            }

            // B. Daily Limit Check
            if (current_usage >= max) {
                console.log(`[${rule_key}] Daily Limit Hit (${current_usage}/${max}). Sleeping.`);
                results.push({ rule: rule_key, status: 'limit_hit' });
                continue;
            }

            // C. Find Pending Jobs for this Rule
            // Assumption: Job 'type' maps to 'rule_key' via loose matching or explicit map.
            // For MVP, we'll assume job.type == 'linkedin_outreach' maps to this rule.
            let jobType = '';
            if (rule_key === 'linkedin_outreach_daily') jobType = 'linkedin_outreach';

            if (!jobType) continue;

            // Fetch jobs that are:
            // 1. Pending
            // 2. Scheduled for <= NOW
            // 3. Limit to (Max - Current) to prevent over-sending, or small batch (5)
            const remainingQuota = max - current_usage;
            const batchSize = Math.min(remainingQuota, 5); // Conservative batch

            const { data: jobs, error: jobsError } = await supabase
                .from('jobs')
                .select('id, type')
                .eq('status', 'pending')
                .eq('type', jobType)
                .lte('scheduled_for', new Date().toISOString())
                .limit(batchSize);

            if (jobsError) {
                console.error(`Error fetching jobs for ${jobType}:`, jobsError);
                continue;
            }

            if (jobs && jobs.length > 0) {
                console.log(`[${rule_key}] Releasing ${jobs.length} jobs...`);

                // Dispatch them!
                const dispatcherUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/worker-dispatcher`;

                for (const job of jobs) {
                    // We simulate a Webhook Payload to the Dispatcher, OR invoke worker directly.
                    // Invoking Dispatcher is safer as it centralizes logic, but Dispatcher ignores "Future" jobs. 
                    // Since we filtered by lte('scheduled_for', NOW), Dispatcher will see them as "Immediate" and execute.
                    // Wait, Dispatcher expects { record: ... }.
                    // Let's invoke the Dispatcher endpoint locally.

                    const { error: dispatchError } = await supabase.functions.invoke('worker-dispatcher', {
                        body: {
                            type: 'INSERT',
                            record: { ...job, scheduled_for: new Date().toISOString() } // Force "Now" to ensure Dispatcher takes it
                        }
                    });

                    if (!dispatchError) {
                        // Increment Usage
                        await supabase.rpc('increment_governance_usage', { rule_key_param: rule_key });
                    }
                }

                results.push({ rule: rule_key, released: jobs.length });
            } else {
                results.push({ rule: rule_key, status: 'no_pending_jobs' });
            }
        }

        return new Response(JSON.stringify(results), {
            headers: { "Content-Type": "application/json" }
        });

    } catch (err) {
        console.error("Governor Error:", err);
        return new Response("Governor Error", { status: 500 });
    }
});
