-- Create resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    type TEXT NOT NULL, -- 'checklist', 'guide', 'calculator'
    persona TEXT,
    thumbnail_url TEXT,
    status TEXT DEFAULT 'published',
    slug TEXT UNIQUE NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Allow public read access to resources
CREATE POLICY "Allow public read access to resources" 
ON public.resources FOR SELECT 
TO public 
USING (status = 'published');

-- Allow authenticated users to manage resources
CREATE POLICY "Allow authenticated users to manage resources" 
ON public.resources FOR ALL 
TO authenticated 
USING (true);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE resources;
