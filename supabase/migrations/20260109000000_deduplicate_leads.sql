-- Deduplicate leads table based on email
-- Keep the record with the latest content (or just one of them arbitrarily if they are identical)

DELETE FROM public.leads a USING public.leads b
WHERE a.id < b.id
AND a.email = b.email;

-- Now add a unique constraint to prevent future duplicates
ALTER TABLE public.leads ADD CONSTRAINT leads_email_key UNIQUE (email);
