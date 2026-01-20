-- Create content_assets table for asset library
CREATE TABLE public.content_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  content_type TEXT,
  size INTEGER,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  admin_user_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;

-- Policies for admins using has_role function
CREATE POLICY "Admins can view all assets" 
  ON public.content_assets FOR SELECT 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert assets" 
  ON public.content_assets FOR INSERT 
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update assets" 
  ON public.content_assets FOR UPDATE 
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete assets" 
  ON public.content_assets FOR DELETE 
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Create updated_at trigger
CREATE TRIGGER update_content_assets_updated_at
  BEFORE UPDATE ON public.content_assets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_content_templates_updated_at();

-- Create storage bucket for content assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('content-assets', 'content-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for content-assets bucket
CREATE POLICY "Anyone can view content assets"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'content-assets');

CREATE POLICY "Admins can upload content assets"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'content-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update content assets"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'content-assets' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete content assets"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'content-assets' AND has_role(auth.uid(), 'admin'::app_role));