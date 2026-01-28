DO $$
BEGIN
  CREATE TYPE public.lead_source AS ENUM ('website', 'unipile');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.contact_leads
  ADD COLUMN IF NOT EXISTS source public.lead_source;

UPDATE public.contact_leads
SET source = 'website'
WHERE source IS NULL;

ALTER TABLE public.contact_leads
  ALTER COLUMN source SET DEFAULT 'website',
  ALTER COLUMN source SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contact_leads_source
  ON public.contact_leads(source);
