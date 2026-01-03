-- Backfill user_roles from admin_users for existing admins
INSERT INTO public.user_roles (user_id, role)
SELECT au.user_id, 'admin'::public.app_role
FROM public.admin_users au
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles ur 
  WHERE ur.user_id = au.user_id AND ur.role = 'admin'
)
ON CONFLICT (user_id, role) DO NOTHING;

-- Create function to auto-sync admin_users to user_roles
CREATE OR REPLACE FUNCTION public.sync_admin_users_to_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.user_id, 'admin'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Create trigger to auto-sync on new admin_users insert
CREATE TRIGGER on_admin_user_created
AFTER INSERT ON public.admin_users
FOR EACH ROW
EXECUTE FUNCTION public.sync_admin_users_to_roles();