-- Create company_assets table for logo and brand assets
CREATE TABLE public.company_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  name TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.company_assets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Public can view assets" ON public.company_assets FOR SELECT USING (true);
CREATE POLICY "Admins manage assets" ON public.company_assets FOR ALL USING (has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert placeholder logo
INSERT INTO public.company_assets (type, url, name) 
VALUES ('logo', 'https://iijkbhiqcsvtnfernrbs.supabase.co/storage/v1/object/public/website-assets/logo.png', 'Lifetrek Logo');