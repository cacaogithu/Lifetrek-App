-- Drop background worker tables
-- Date: 2026-01-23

DROP TABLE IF EXISTS public.jobs CASCADE;
DROP TABLE IF EXISTS public.job_queue CASCADE;
DROP TABLE IF EXISTS public.agent_usage_logs CASCADE;
DROP TABLE IF EXISTS public.linkedin_generation_logs CASCADE;

-- Cleanup any remaining triggers if needed (CASCADE should handle it)
