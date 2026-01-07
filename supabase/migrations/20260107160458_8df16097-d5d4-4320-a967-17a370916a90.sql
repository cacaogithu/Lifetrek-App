-- Add new columns to contact_leads for CSV import compatibility
ALTER TABLE public.contact_leads 
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS source TEXT,
ADD COLUMN IF NOT EXISTS industry TEXT,
ADD COLUMN IF NOT EXISTS employees TEXT,
ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
ADD COLUMN IF NOT EXISTS cnpj TEXT,
ADD COLUMN IF NOT EXISTS revenue_range TEXT;

-- Create index for better search performance
CREATE INDEX IF NOT EXISTS idx_contact_leads_company ON public.contact_leads(company);
CREATE INDEX IF NOT EXISTS idx_contact_leads_source ON public.contact_leads(source);
CREATE INDEX IF NOT EXISTS idx_contact_leads_industry ON public.contact_leads(industry);