-- Drop existing INSERT policy
DROP POLICY IF EXISTS "Users can insert their own admin record" ON public.admin_users;

-- Create new policy allowing users to insert themselves as admin during development
CREATE POLICY "Users can insert their own admin record"
  ON public.admin_users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Also allow users to check if they are admin
DROP POLICY IF EXISTS "Admin users can view their own record" ON public.admin_users;

CREATE POLICY "Users can view their own admin record"
  ON public.admin_users
  FOR SELECT
  USING (auth.uid() = user_id);