-- Create app_role type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE public.app_role AS ENUM ('admin', 'user');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create admin_users table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.admin_users (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    role public.app_role NOT NULL DEFAULT 'user'::public.app_role,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now(),
    UNIQUE(user_id)
);

-- Enable RLS on admin_users
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Create has_role function (String version)
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE public.admin_users.user_id = has_role.user_id 
    AND public.admin_users.role = has_role.role_name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create has_role function (Enum version)
CREATE OR REPLACE FUNCTION public.has_role(user_id uuid, role_name public.app_role)
RETURNS boolean AS $$
BEGIN
  -- Cast enum to text to reuse logic or just compare
  RETURN EXISTS (
    SELECT 1 
    FROM public.admin_users 
    WHERE public.admin_users.user_id = has_role.user_id 
    AND public.admin_users.role = has_role.role_name::text
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
