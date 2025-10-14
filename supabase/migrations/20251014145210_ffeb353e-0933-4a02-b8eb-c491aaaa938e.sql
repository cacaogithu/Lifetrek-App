-- Fix Critical Security Issue: Remove self-promotion admin access
-- Drop the dangerous INSERT policy that allows any user to make themselves admin
DROP POLICY IF EXISTS "Users can insert their own admin record" ON public.admin_users;

-- Also drop the SELECT policy as it's not needed (admins are checked server-side)
DROP POLICY IF EXISTS "Users can view their own admin record" ON public.admin_users;

-- Create a secure admin account
-- First, we need to ensure the auth user exists, then add to admin_users
-- Note: This assumes the auth user admin@precisionparts.com already exists
-- If not, it will need to be created manually via Supabase dashboard

-- Insert admin record (will only work if the auth user exists)
-- Using ON CONFLICT to avoid errors if already exists
INSERT INTO public.admin_users (user_id)
SELECT id FROM auth.users WHERE email = 'admin@precisionparts.com'
ON CONFLICT (user_id) DO NOTHING;

-- Add a comment explaining the security model
COMMENT ON TABLE public.admin_users IS 'Admin users table. New admins can only be added via migrations or superuser access. No INSERT policy to prevent privilege escalation.';