-- Add scheduled_for field to linkedin_carousels
ALTER TABLE public.linkedin_carousels 
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;

-- Add scheduled_for field to blog_posts  
ALTER TABLE public.blog_posts
ADD COLUMN IF NOT EXISTS scheduled_for TIMESTAMP WITH TIME ZONE;

-- Create index for efficient querying
CREATE INDEX IF NOT EXISTS idx_linkedin_carousels_scheduled 
ON public.linkedin_carousels (scheduled_for) 
WHERE scheduled_for IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_blog_posts_scheduled 
ON public.blog_posts (scheduled_for) 
WHERE scheduled_for IS NOT NULL;