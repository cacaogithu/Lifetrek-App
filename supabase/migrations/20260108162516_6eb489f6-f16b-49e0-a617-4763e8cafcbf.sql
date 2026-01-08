-- Create UNIQUE constraint on email for upsert to work properly
ALTER TABLE public.contact_leads ADD CONSTRAINT contact_leads_email_unique UNIQUE (email);