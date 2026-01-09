-- Create leads table based on CSV structure
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT,
    website TEXT,
    phone TEXT,
    address TEXT,
    email TEXT,
    segment TEXT,
    city TEXT,
    state TEXT,
    score NUMERIC,
    enrichment_status TEXT DEFAULT 'pending',
    decision_makers JSONB,
    decision_makers_emails JSONB,
    predicted_score NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Allow read access to anyone (or specific roles, adjusting based on needs)
CREATE POLICY "Enable read access for all users" ON public.leads
    FOR SELECT USING (true);

-- Allow insert/update for service role (implicit, but good to be clear on RLS)
-- Service Role bypasses RLS, so mainly we need policies for client access if any.
