import type { Json } from "@/integrations/supabase/types";

export interface Job {
    id: string;
    job_type: string;
    status: 'pending' | 'queued' | 'processing' | 'completed' | 'failed';
    payload: Json;
    result?: Json | null;
    error?: string;
    created_at: string;
    started_at?: string;
    completed_at?: string;
    checkpoint_data?: Json | null;
    user_id: string;
}

export interface JobFilter {
    status?: Job['status'] | 'all';
    job_type?: string | 'all';
    dateFrom?: string;
    dateTo?: string;
}
