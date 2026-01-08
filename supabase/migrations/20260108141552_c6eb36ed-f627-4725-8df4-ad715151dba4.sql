-- Create carousel-images bucket for storing generated carousel images
INSERT INTO storage.buckets (id, name, public)
VALUES ('carousel-images', 'carousel-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy for public read access
CREATE POLICY "Public read access for carousel images"
ON storage.objects FOR SELECT
USING (bucket_id = 'carousel-images');

-- Policy for authenticated uploads
CREATE POLICY "Authenticated users can upload carousel images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'carousel-images' AND auth.role() = 'authenticated');

-- Policy for service role uploads (edge functions)
CREATE POLICY "Service role can upload carousel images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'carousel-images');