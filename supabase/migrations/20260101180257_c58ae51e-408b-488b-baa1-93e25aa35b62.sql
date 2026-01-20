-- Create website-assets bucket for static website images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'website-assets', 
  'website-assets', 
  true,
  10485760, -- 10MB max file size
  ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/svg+xml']
);

-- Allow public read access to website assets
CREATE POLICY "Public can view website assets"
ON storage.objects
FOR SELECT
USING (bucket_id = 'website-assets');

-- Allow admins to manage website assets
CREATE POLICY "Admins can manage website assets"
ON storage.objects
FOR ALL
USING (bucket_id = 'website-assets' AND has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (bucket_id = 'website-assets' AND has_role(auth.uid(), 'admin'::app_role));