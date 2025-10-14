-- Create product_catalog table
CREATE TABLE IF NOT EXISTS public.product_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('dental', 'medical', 'industrial')),
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.product_catalog ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read all products
CREATE POLICY "Anyone can view products"
  ON public.product_catalog
  FOR SELECT
  USING (true);

-- Only authenticated users can insert products
CREATE POLICY "Authenticated users can insert products"
  ON public.product_catalog
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Only authenticated users can update products
CREATE POLICY "Authenticated users can update products"
  ON public.product_catalog
  FOR UPDATE
  TO authenticated
  USING (true);

-- Only authenticated users can delete products
CREATE POLICY "Authenticated users can delete products"
  ON public.product_catalog
  FOR DELETE
  TO authenticated
  USING (true);

-- Create product-images storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for product-images bucket
CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can upload product images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can update product images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images');

CREATE POLICY "Authenticated users can delete product images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_product_catalog_category ON public.product_catalog(category);
CREATE INDEX IF NOT EXISTS idx_product_catalog_created_at ON public.product_catalog(created_at DESC);