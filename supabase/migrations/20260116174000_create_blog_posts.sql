-- Create blog_posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES auth.users(id),
    user_id UUID REFERENCES auth.users(id),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    category_id UUID,
    status TEXT DEFAULT 'draft',
    slug TEXT UNIQUE,
    seo_title TEXT,
    seo_description TEXT,
    keywords TEXT[],
    ai_generated BOOLEAN DEFAULT false,
    metadata JSONB DEFAULT '{}',
    published_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to view all posts
CREATE POLICY "Allow authenticated users to view all posts" 
ON public.blog_posts FOR SELECT 
TO authenticated 
USING (true);

-- Allow users to manage their own posts
CREATE POLICY "Allow users to manage their own posts" 
ON public.blog_posts FOR ALL 
TO authenticated 
USING (auth.uid() = user_id OR auth.uid() = author_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE blog_posts;
