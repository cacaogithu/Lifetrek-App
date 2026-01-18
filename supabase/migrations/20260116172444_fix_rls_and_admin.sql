-- Migration: Fix RLS and Admin Permissions
-- Date: 2026-01-16

-- 1. Ensure admin_permissions table exists with correct schema
DROP TABLE IF EXISTS public.admin_permissions CASCADE;
CREATE TABLE public.admin_permissions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    permission_level text NOT NULL,
    display_name text,
    created_at timestamptz DEFAULT now()
);

-- 2. Populate admin_permissions for the system user
INSERT INTO public.admin_permissions (email, permission_level, display_name)
VALUES ('admin@lifetrek.ai', 'super_admin', 'Rafael');

-- 3. Fix admin_users table (legacy/internal)
DROP TABLE IF EXISTS public.admin_users CASCADE;
CREATE TABLE public.admin_users (
    id uuid PRIMARY KEY REFERENCES auth.users(id),
    user_id uuid NOT NULL REFERENCES auth.users(id),
    created_at timestamptz DEFAULT now(),
    permission_level text NOT NULL
);

INSERT INTO public.admin_users (id, user_id, permission_level)
SELECT id, id, 'super_admin' FROM auth.users WHERE email = 'admin@lifetrek.ai';

-- 4. Fix jobs table RLS to be more permissive for authenticated users (diagnostic)
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Authenticated users can view all jobs" ON public.jobs;

CREATE POLICY "Authenticated users can view all jobs"
    ON public.jobs
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. Ensure all existing jobs belong to the admin user to be safe
UPDATE public.jobs 
SET user_id = (SELECT id FROM auth.users WHERE email = 'admin@lifetrek.ai')
WHERE user_id IS NULL OR user_id NOT IN (SELECT id FROM auth.users);

-- 6. Grant basic permissions
GRANT ALL ON public.admin_permissions TO authenticated;
GRANT ALL ON public.admin_users TO authenticated;
GRANT ALL ON public.jobs TO authenticated;

-- 7. Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';
