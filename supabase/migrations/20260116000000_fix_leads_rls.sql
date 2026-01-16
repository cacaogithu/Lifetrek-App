-- Fix RLS for contact_leads to allow all authenticated users to read
-- This should resolve the "118 instead of 2000" issue

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Admins can view all leads" ON public.contact_leads;

-- Create new policy allowing all authenticated users to view leads
CREATE POLICY "Authenticated users can view leads"
  ON public.contact_leads
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Alternatively, if you want NO restriction at all (allow anyone including anon):
-- CREATE POLICY "Public can view leads"
--   ON public.contact_leads
--   FOR SELECT
--   USING (true);

-- Keep the admin-only policies for write operations
-- (These should already exist from previous migrations)
