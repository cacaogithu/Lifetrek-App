-- Add super_admin to the app_role enum
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'super_admin';

-- Create admin_permissions table to store email-based permissions
CREATE TABLE IF NOT EXISTS public.admin_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  permission_level text NOT NULL DEFAULT 'admin' CHECK (permission_level IN ('super_admin', 'admin')),
  display_name text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Only super_admins can manage permissions
CREATE POLICY "Super admins can manage permissions"
ON public.admin_permissions
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.admin_permissions ap
    WHERE ap.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND ap.permission_level = 'super_admin'
  )
);

-- All admins can view permissions
CREATE POLICY "Admins can view permissions"
ON public.admin_permissions
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert initial permissions
INSERT INTO public.admin_permissions (email, permission_level, display_name) VALUES
  ('rafacrvg@icloud.com', 'super_admin', 'Rafael'),
  ('njesus@lifetrek-medical.com', 'admin', 'Nelson Jesus'),
  ('rbianchini@lifetrek-medical.com', 'admin', 'Renner Bianchini'),
  ('erenner@lifetrek-medical.com', 'admin', 'Eduardo Renner')
ON CONFLICT (email) DO UPDATE SET
  permission_level = EXCLUDED.permission_level,
  display_name = EXCLUDED.display_name,
  updated_at = now();

-- Function to check if current user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.admin_permissions
    WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    AND permission_level = 'super_admin'
  )
$$;

-- Function to get current admin permission level
CREATE OR REPLACE FUNCTION public.get_admin_permission_level()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT permission_level FROM public.admin_permissions
     WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())),
    'none'
  )
$$;