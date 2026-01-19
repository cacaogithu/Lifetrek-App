-- Remove legacy CSV leads and any non-website leads from contact_leads
DELETE FROM public.leads;

DELETE FROM public.contact_leads
WHERE source <> 'website';
