-- Phase 1: Create Role-Based Access Control System

-- 1.1 Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- 1.2 Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 1.3 Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- 1.4 Migrate existing admin_users data to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, 'admin'::public.app_role
FROM public.admin_users
ON CONFLICT (user_id, role) DO NOTHING;

-- Phase 2: Fix RLS Policies

-- 2.1 RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert roles"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2.2 Add RLS policies to admin_users (currently has NONE)
CREATE POLICY "Users can view their own admin status"
ON public.admin_users
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all admin users"
ON public.admin_users
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2.3 Fix analytics_events RLS (currently any authenticated user can read)
DROP POLICY IF EXISTS "Only authenticated users can view analytics" ON public.analytics_events;

CREATE POLICY "Only admins can view analytics"
ON public.analytics_events
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Keep the insert policy for tracking
-- Anyone can insert analytics events (existing policy is fine)

-- 2.4 Fix product_catalog RLS (currently any authenticated user can modify)
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.product_catalog;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.product_catalog;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.product_catalog;

CREATE POLICY "Only admins can insert products"
ON public.product_catalog
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update products"
ON public.product_catalog
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete products"
ON public.product_catalog
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Keep the public SELECT policy (existing policy is fine)
-- Anyone can view products