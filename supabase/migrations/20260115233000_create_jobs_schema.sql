-- Create jobs table for Async Job Engine
-- Date: 2026-01-15

CREATE TABLE IF NOT EXISTS public.jobs (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid()
);

-- Ensure all columns exist (in case table already exists with different schema)
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS job_type text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS status text DEFAULT 'queued';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS payload jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS result jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS error text;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS checkpoint_data jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS started_at timestamptz;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Set NOT NULL constraints where applicable (can fail if data exists, but we'll try)
DO $$ 
BEGIN
    ALTER TABLE public.jobs ALTER COLUMN user_id SET NOT NULL;
    ALTER TABLE public.jobs ALTER COLUMN job_type SET NOT NULL;
    ALTER TABLE public.jobs ALTER COLUMN status SET NOT NULL;
EXCEPTION WHEN others THEN
    RAISE NOTICE 'Could not set NOT NULL constraints on some columns, probably due to existing null data.';
END $$;

-- Enable RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Policies (drop first if they exist to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
CREATE POLICY "Users can view their own jobs"
    ON public.jobs
    FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own jobs" ON public.jobs;
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
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND schemaname = 'public' 
        AND tablename = 'jobs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
    END IF;
END $$;

-- Comment
COMMENT ON TABLE public.jobs IS 'Centralized async job queue for hybrid microservices';
