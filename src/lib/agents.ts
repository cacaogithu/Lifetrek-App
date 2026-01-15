
import { supabase } from "@/integrations/supabase/client";

export interface RepurposeJobInput {
    content?: string;
    url?: string;
}

/**
 * Dispatches a content repurposing job to the 'repurpose-content' Edge Function.
 * It follows the Async Job Pattern:
 * 1. Insert 'pending' job into 'jobs' table.
 * 2. Invoke Edge Function with job_id.
 * 3. Return job_id for polling.
 */
export const dispatchRepurposeJob = async (input: RepurposeJobInput): Promise<string> => {
    // 1. Get User
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    console.log("dispatchRepurposeJob: Creating job...");

    // 2. Create Job in DB
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
            type: 'repurpose_content',
            status: 'pending',
            payload: input, // Storing full input in payload
            user_id: user.id
        })
        .select()
        .single();

    if (jobError) {
        console.error("Job Creation Error:", jobError);
        throw new Error(`Failed to create job: ${jobError.message}`);
    }

    console.log("dispatchRepurposeJob: Job created", job.id);

    // 3. Invoke Edge Function (Fire and Forget - it's async)
    const { error: invokeError } = await supabase.functions.invoke('repurpose-content', {
        body: {
            job_id: job.id,
            content: input.content,
            url: input.url
        }
    });

    if (invokeError) {
        console.error("Edge Function Invocation Error:", invokeError);
        // Note: Even if invocation fails, the job is in DB. But it will stay pending.
        // We might want to mark it failed if invoke fails.
        await supabase.from('jobs').update({ status: 'failed', error: 'Invocation failed' }).eq('id', job.id);
        throw new Error(`Failed to start agent: ${invokeError.message}`);
    }

    return job.id;
};

/**
 * Dispatches a Deep Research job.
 */
export const dispatchResearchJob = async (topic: string, depth: 'deep' | 'comprehensive'): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    console.log("dispatchResearchJob: Creating job...");

    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
            type: 'deep_research',
            status: 'pending',
            payload: { topic, depth },
            user_id: user.id
        })
        .select()
        .single();

    if (jobError) throw new Error(`Failed to create job: ${jobError.message}`);

    // Invoke Edge Function
    const { error: invokeError } = await supabase.functions.invoke('deep-research', {
        body: { job_id: job.id, topic, depth }
    });

    if (invokeError) {
        // Mark failed if dispatch fails
        await supabase.from('jobs').update({ status: 'failed', error: 'Invocation failed' }).eq('id', job.id);
        throw new Error(`Failed to start researcher: ${invokeError.message}`);
    }

    return job.id;
};

/**
 * Fetches the current status and result of a job.
 */
export const getJobStatus = async (jobId: string) => {
    const { data, error } = await supabase
        .from('jobs')
        .select('status, result, error')
        .eq('id', jobId)
        .single();

    if (error) throw error;
    return data;
};
