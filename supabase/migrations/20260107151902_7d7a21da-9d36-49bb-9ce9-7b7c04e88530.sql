-- Drop existing restrictive policies on admin_permissions
DROP POLICY IF EXISTS "Super admins can manage permissions" ON public.admin_permissions;
DROP POLICY IF EXISTS "Admins can view permissions" ON public.admin_permissions;

-- Create a simple SELECT policy that allows any authenticated user to check their own permission
CREATE POLICY "Users can read their own permission"
ON public.admin_permissions
FOR SELECT
TO authenticated
USING (email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- Super admins can still manage all permissions (for future admin management page)
CREATE POLICY "Super admins can manage all permissions"
ON public.admin_permissions
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());