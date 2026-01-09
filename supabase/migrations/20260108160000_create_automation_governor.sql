-- Create table for storing role-based daily limits
CREATE TABLE IF NOT EXISTS public.automation_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL CHECK (role IN ('founder', 'growth', 'sales_machine')) UNIQUE,
    daily_invites INTEGER NOT NULL DEFAULT 0,
    daily_inmails INTEGER NOT NULL DEFAULT 0,
    daily_messages INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: user_id references auth.users if you use Supabase Auth, or just a text storage for now if purely external.
-- We'll assume a link to a 'users' table or profiles. For simplicity here:
CREATE TABLE IF NOT EXISTS public.automation_profiles (
    user_id UUID PRIMARY KEY, -- Links to auth.users
    role TEXT NOT NULL DEFAULT 'founder' REFERENCES public.automation_limits(role),
    unipile_account_id TEXT, -- The account_id from Unipile
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create table for logging every single automation action (The Audit Log)
CREATE TABLE IF NOT EXISTS public.automation_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.automation_profiles(user_id),
    action_type TEXT NOT NULL CHECK (action_type IN ('invite', 'inmail', 'message')),
    target_url TEXT,
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'blocked_limit')),
    performed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create a view or function to check current usage
CREATE OR REPLACE FUNCTION public.check_daily_limit(p_user_id UUID, p_action_type TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_role TEXT;
    v_limit INTEGER;
    v_usage INTEGER;
BEGIN
    -- 1. Get User Role
    SELECT role INTO v_role FROM public.automation_profiles WHERE user_id = p_user_id;
    
    IF v_role IS NULL THEN
        RAISE EXCEPTION 'User profile not found';
    END IF;

    -- 2. Get Limit for that Role and Action
    SELECT 
        CASE 
            WHEN p_action_type = 'invite' THEN daily_invites
            WHEN p_action_type = 'inmail' THEN daily_inmails
            WHEN p_action_type = 'message' THEN daily_messages
            ELSE 0
        END 
    INTO v_limit
    FROM public.automation_limits 
    WHERE role = v_role;

    -- 3. Get Current Usage for Today
    SELECT count(*) INTO v_usage
    FROM public.automation_logs
    WHERE user_id = p_user_id
      AND action_type = p_action_type
      AND status = 'success'
      AND performed_at >= date_trunc('day', now());

    -- 4. Compare
    IF v_usage >= v_limit THEN
        RETURN FALSE; -- Blocked
    ELSE
        RETURN TRUE; -- Allowed
    END IF;
END;
$$;

-- Insert Default Limits from Strategy
INSERT INTO public.automation_limits (role, daily_invites, daily_inmails, daily_messages) VALUES
('founder', 15, 0, 20),
('growth', 30, 0, 40),
('sales_machine', 80, 50, 100)
ON CONFLICT (role) DO NOTHING;
