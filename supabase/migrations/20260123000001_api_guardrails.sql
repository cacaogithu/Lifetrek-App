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

-- Only admins can view logs (fixed to use admin_permissions table)
CREATE POLICY "Admins can view usage logs" ON public.api_usage_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.admin_permissions
            WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
            AND permission_level IN ('admin', 'super_admin')
        )
    );
