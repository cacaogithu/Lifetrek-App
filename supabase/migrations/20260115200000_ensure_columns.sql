
-- Helper migration to ensure all columns exist, since some migrations were skipped
-- Status: 2026-01-15

ALTER TABLE public.linkedin_carousels 
    ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id),
    ADD COLUMN IF NOT EXISTS quality_score numeric DEFAULT 0,
    ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft',
    ADD COLUMN IF NOT EXISTS tone text DEFAULT 'Professional',
    ADD COLUMN IF NOT EXISTS target_audience text DEFAULT 'General',
    ADD COLUMN IF NOT EXISTS content_embedding vector(768);

-- Ensure index exists
CREATE INDEX IF NOT EXISTS idx_carousels_content_embedding 
    ON public.linkedin_carousels 
    USING hnsw (content_embedding vector_cosine_ops);

-- Ensure RLS (Safety)
ALTER TABLE public.linkedin_carousels ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'linkedin_carousels' AND policyname = 'Users can view their own carousels'
    ) THEN
        CREATE POLICY "Users can view their own carousels" 
        ON public.linkedin_carousels FOR SELECT 
        USING (auth.uid() = user_id);
    END IF;
END $$;
