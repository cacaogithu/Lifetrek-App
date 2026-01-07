-- Fix admin_permissions SELECT policy to avoid querying auth.users inside RLS
DROP POLICY IF EXISTS "Users can read their own permission" ON public.admin_permissions;

CREATE POLICY "Users can read their own permission"
ON public.admin_permissions
FOR SELECT
TO authenticated
USING (
  email = COALESCE(
    (auth.jwt() ->> 'email'),
    (auth.jwt() -> 'user_metadata' ->> 'email')
  )
);
