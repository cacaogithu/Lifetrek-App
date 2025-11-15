-- Create enum for lead status
CREATE TYPE public.lead_status AS ENUM ('new', 'contacted', 'in_progress', 'quoted', 'closed', 'rejected');

-- Create enum for lead priority
CREATE TYPE public.lead_priority AS ENUM ('low', 'medium', 'high');

-- Create contact_leads table
CREATE TABLE public.contact_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  phone TEXT NOT NULL,
  project_type TEXT NOT NULL,
  annual_volume TEXT,
  technical_requirements TEXT NOT NULL,
  message TEXT,
  status lead_status NOT NULL DEFAULT 'new',
  priority lead_priority NOT NULL DEFAULT 'medium',
  admin_notes TEXT,
  assigned_to UUID REFERENCES public.admin_users(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Admins can view all leads"
  ON public.contact_leads
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update leads"
  ON public.contact_leads
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete leads"
  ON public.contact_leads
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Public can insert leads"
  ON public.contact_leads
  FOR INSERT
  WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_contact_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_contact_leads_updated_at
  BEFORE UPDATE ON public.contact_leads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_leads_updated_at();

-- Create index for faster queries
CREATE INDEX idx_contact_leads_status ON public.contact_leads(status);
CREATE INDEX idx_contact_leads_created_at ON public.contact_leads(created_at DESC);
CREATE INDEX idx_contact_leads_email ON public.contact_leads(email);