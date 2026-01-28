-- Create a table for application configuration settings
CREATE TABLE IF NOT EXISTS public.app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

-- Allow read access to service role only (for backend functions)
-- Allow read access to service role only (for backend functions)
DROP POLICY IF EXISTS "Allow service role read access" ON public.app_config;
CREATE POLICY "Allow service role read access" ON public.app_config
    FOR SELECT
    TO service_role
    USING (true);

-- Allow admins to manage config (optional, adjust based on your needs)
-- CREATE POLICY "Allow admin full access" ON public.app_config
--     FOR ALL
--     TO authenticated
--     USING (auth.jwt() ->> 'email' IN ('info@cacao-ai.com', 'rafacrvgalmeida@gmail.com'));
