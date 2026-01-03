-- Add storage policies for processed-products bucket to allow admin uploads

-- Policy for admins to upload files
CREATE POLICY "Admins can upload to processed-products"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'processed-products' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Policy for admins to update files
CREATE POLICY "Admins can update processed-products"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'processed-products' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Policy for admins to delete files
CREATE POLICY "Admins can delete from processed-products"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'processed-products' 
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Policy for public to read files (already public bucket, but explicit)
CREATE POLICY "Public can read processed-products"
ON storage.objects
FOR SELECT
USING (bucket_id = 'processed-products');