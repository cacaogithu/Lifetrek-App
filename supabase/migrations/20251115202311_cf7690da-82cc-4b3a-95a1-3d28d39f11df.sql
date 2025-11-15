-- Create linkedin_carousels table for storing generated carousels
CREATE TABLE public.linkedin_carousels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  topic TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  pain_point TEXT,
  desired_outcome TEXT,
  proof_points TEXT,
  cta_action TEXT,
  slides JSONB NOT NULL,
  caption TEXT NOT NULL,
  performance_metrics JSONB DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE public.linkedin_carousels ENABLE ROW LEVEL SECURITY;

-- Admins can view all carousels
CREATE POLICY "Admins can view all carousels"
  ON public.linkedin_carousels
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can insert carousels
CREATE POLICY "Admins can insert carousels"
  ON public.linkedin_carousels
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Admins can update carousels
CREATE POLICY "Admins can update carousels"
  ON public.linkedin_carousels
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Admins can delete carousels
CREATE POLICY "Admins can delete carousels"
  ON public.linkedin_carousels
  FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger for updated_at
CREATE TRIGGER update_linkedin_carousels_updated_at
  BEFORE UPDATE ON public.linkedin_carousels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_leads_updated_at();