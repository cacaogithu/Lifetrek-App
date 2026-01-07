-- Ensure admins can read their own admin_users row (used by ProtectedRoute fallback)
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their own admin_users row" ON public.admin_users;
CREATE POLICY "Users can read their own admin_users row"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Super admins can manage admin_users
DROP POLICY IF EXISTS "Super admins can manage admin_users" ON public.admin_users;
CREATE POLICY "Super admins can manage admin_users"
ON public.admin_users
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());
