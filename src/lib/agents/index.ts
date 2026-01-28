import { supabase } from "@/integrations/supabase/client";

export * from './registry';

export async function dispatchBlogPostJob(topic: string, keywords: string[], category: string) {
    const { data, error } = await supabase.functions.invoke('generate-blog-post', {
        body: { topic, keywords, category }
    });

    if (error) throw error;
    return data?.jobId;
}

export async function getJobStatus(jobId: string) {
    // Attempt to fetch job status from a hypothetical 'content_jobs' or 'jobs' table
    // Since the table definition is missing in types.ts, we'll try a generic selection
    // or return a mock state to prevent build errors.

    // TODO: Implement actual job status polling once the backend architecture is clarified.
    console.warn("getJobStatus is a placeholder. Backend implementation verification needed.");

    return { status: 'failed', error: 'Job tracking implementation pending' };
}
