
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
            job_type: 'repurpose_content',
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

    // 3. Invoke Edge Function (REMOVED: Now handled by Python Agent Service via Webhook)
    // The Python service listens to INSERTs on the 'jobs' table and picks this up automatically.

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
            job_type: 'deep_research',
            status: 'pending',
            payload: { topic, depth },
            user_id: user.id
        })
        .select()
        .single();

    if (jobError) throw new Error(`Failed to create job: ${jobError.message}`);

    if (jobError) throw new Error(`Failed to create job: ${jobError.message}`);

    // Invoke Edge Function (REMOVED: Handled by Python Agent Service)

    return job.id;
};

/**
 * Dispatches a Lead Magnet generation job.
 */
export const dispatchLeadMagnetJob = async (persona: string, topic: string, templateId: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    console.log("dispatchLeadMagnetJob: Creating job...");

    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
            job_type: 'generate_lead_magnet',
            status: 'pending',
            payload: { persona, topic, templateId },
            user_id: user.id
        })
        .select()
        .single();

    if (jobError) throw new Error(`Failed to create job: ${jobError.message}`);

    if (jobError) throw new Error(`Failed to create job: ${jobError.message}`);

    // Invoke Edge Function (REMOVED: Handled by Python Agent Service)

    return job.id;
};

/**
 * Dispatches a Blog Post generation job.
 */
export const dispatchBlogPostJob = async (topic: string, keywords: string[], category: string): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    console.log("dispatchBlogPostJob: Creating job...");

    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
            job_type: 'generate_blog_post',
            status: 'pending',
            payload: { topic, keywords, category },
            user_id: user.id
        })
        .select()
        .single();

    if (jobError) throw new Error(`Failed to create job: ${jobError.message}`);

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
