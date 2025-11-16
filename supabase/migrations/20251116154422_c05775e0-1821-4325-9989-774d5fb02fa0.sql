-- Create public storage bucket for processed product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('processed-products', 'processed-products', true);

-- Create table to store metadata of processed images
CREATE TABLE public.processed_product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- Image URLs
  original_url TEXT NOT NULL,
  enhanced_url TEXT NOT NULL,
  
  -- AI analysis metadata
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  brand TEXT,
  model TEXT,
  
  -- Additional metadata
  original_filename TEXT NOT NULL,
  file_size INTEGER,
  custom_prompt TEXT,
  
  -- Who processed it (admin)
  processed_by UUID REFERENCES auth.users(id),
  
  -- Flags
  is_featured BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX idx_processed_images_category ON public.processed_product_images(category);
CREATE INDEX idx_processed_images_brand ON public.processed_product_images(brand);
CREATE INDEX idx_processed_images_created ON public.processed_product_images(created_at DESC);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_processed_images_updated_at
  BEFORE UPDATE ON public.processed_product_images
  FOR EACH ROW
  EXECUTE FUNCTION public.update_contact_leads_updated_at();

-- Enable RLS
ALTER TABLE public.processed_product_images ENABLE ROW LEVEL SECURITY;

-- RLS Policies for table
CREATE POLICY "Admins have full access to processed images"
  ON public.processed_product_images
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Public can view visible images"
  ON public.processed_product_images
  FOR SELECT
  USING (is_visible = true);

-- Storage policies
CREATE POLICY "Admins can upload processed images"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'processed-products' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can update processed images"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'processed-products' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Admins can delete processed images"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'processed-products' 
    AND has_role(auth.uid(), 'admin'::app_role)
  );

CREATE POLICY "Public can view processed images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'processed-products');