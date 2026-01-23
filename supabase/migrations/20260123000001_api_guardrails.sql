-- Create table for tracking AI usage to prevent loops
CREATE TABLE IF NOT EXISTS public.api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    endpoint TEXT NOT NULL,
    tokens_used INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast rate-limiting queries
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON public.api_usage_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user_id ON public.api_usage_logs(user_id);

-- Enable RLS
ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view logs
CREATE POLICY "Admins can view usage logs" ON public.api_usage_logs
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM public.profiles WHERE permission_level = 'super_admin'
    ));
