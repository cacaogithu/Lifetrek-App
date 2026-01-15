-- Create jobs table for Async Job Engine
-- Date: 2026-01-15

CREATE TABLE IF NOT EXISTS public.jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    job_type text NOT NULL,
    status text NOT NULL DEFAULT 'queued', -- queued, processing, completed, failed
    payload jsonb DEFAULT '{}'::jsonb,
    result jsonb DEFAULT '{}'::jsonb,
    error text,
    checkpoint_data jsonb DEFAULT '{}'::jsonb, -- For resumable/stateful jobs
    created_at timestamptz DEFAULT now(),
    started_at timestamptz,
    completed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own jobs"
    ON public.jobs
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own jobs"
    ON public.jobs
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Service Role can do everything (implied, but explicit policy sometimes needed depending on config)
-- Usually service role bypasses RLS, so no policy needed for it.

-- Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON public.jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;

-- Comment
COMMENT ON TABLE public.jobs IS 'Centralized async job queue for hybrid microservices';
