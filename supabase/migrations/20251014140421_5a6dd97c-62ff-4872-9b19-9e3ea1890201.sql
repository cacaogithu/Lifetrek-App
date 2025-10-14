-- Create admin user with test credentials
-- Note: In production, use proper signup flow and secure passwords

-- First, we need to insert into auth.users (using a function since we can't directly insert into auth schema)
-- Create a function to help create the admin user
CREATE OR REPLACE FUNCTION create_admin_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Check if admin already exists
  SELECT id INTO admin_user_id
  FROM auth.users
  WHERE email = 'admin@precisionparts.com';
  
  -- If not exists, we'll need to use the signup endpoint
  -- For now, just ensure the admin_users table is ready
  -- The user should sign up through the auth system first
  
  RAISE NOTICE 'Admin user setup ready. Please sign up with admin@precisionparts.com';
END;
$$;

-- Execute the function
SELECT create_admin_user();

-- Drop the function as it's no longer needed
DROP FUNCTION create_admin_user();