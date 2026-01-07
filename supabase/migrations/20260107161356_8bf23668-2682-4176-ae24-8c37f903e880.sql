-- Remove insecure user_metadata reference in RLS policy
DROP POLICY IF EXISTS "Users can read their own permission" ON public.admin_permissions;

CREATE POLICY "Users can read their own permission"
ON public.admin_permissions
FOR SELECT
TO authenticated
USING (
  email = (auth.jwt() ->> 'email')
);
