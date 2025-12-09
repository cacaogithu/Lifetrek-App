-- Create content_assets table
CREATE TABLE IF NOT EXISTS public.content_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    tags TEXT[] DEFAULT '{}'::TEXT[],
    category TEXT DEFAULT 'general' CHECK (category IN ('general', 'logo', 'product', 'person', 'background', 'icon')),
    admin_user_id UUID REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.content_assets ENABLE ROW LEVEL SECURITY;

-- Create policies for content_assets (only visible to authenticated users, editable by admin is implied by auth.users check)
CREATE POLICY "Allow public read access to content_assets" ON public.content_assets
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated upload to content_assets" ON public.content_assets
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Allow authenticated update to content_assets" ON public.content_assets
    FOR UPDATE TO authenticated USING (auth.uid() = admin_user_id);

CREATE POLICY "Allow authenticated delete to content_assets" ON public.content_assets
    FOR DELETE TO authenticated USING (auth.uid() = admin_user_id);


-- Create storage bucket for assets
INSERT INTO storage.buckets (id, name, public) VALUES ('content-assets', 'content-assets', true);

-- Storage policies
CREATE POLICY "Public Access" 
ON storage.objects FOR SELECT 
TO public 
USING (bucket_id = 'content-assets');

CREATE POLICY "Authenticated Upload" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'content-assets');

CREATE POLICY "Authenticated Update" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'content-assets');

CREATE POLICY "Authenticated Delete" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (bucket_id = 'content-assets');
