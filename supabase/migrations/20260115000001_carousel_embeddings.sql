-- Story 7.7: Semantic Search with pgvector - Carousel Learning Loop
-- Add vector embeddings to store successful carousel patterns for future reference
-- Date: 2026-01-15

-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to linkedin_carousels table
-- Using 1536 dimensions for text-embedding-3-small or gte-small models
ALTER TABLE public.linkedin_carousels
  ADD COLUMN IF NOT EXISTS content_embedding vector(1536);

-- Create HNSW index for fast similarity search
-- HNSW (Hierarchical Navigable Small World) is faster than IVFFlat for < 1M vectors
CREATE INDEX IF NOT EXISTS idx_carousels_content_embedding
  ON public.linkedin_carousels
  USING hnsw (content_embedding vector_cosine_ops);

-- Add status column to track acceptance
ALTER TABLE public.linkedin_carousels
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'draft';

-- Add column comment
COMMENT ON COLUMN public.linkedin_carousels.content_embedding IS
  'Vector embedding (1536d) of carousel content for semantic similarity search. Generated from topic + slides text when carousel is accepted (quality_score >= 70)';

COMMENT ON COLUMN public.linkedin_carousels.status IS
  'Carousel status: draft, accepted, rejected. Only accepted carousels are used for future references';

-- Function to search for similar successful carousels
-- Returns carousels with quality_score >= 70 and similar content
CREATE OR REPLACE FUNCTION match_successful_carousels(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  topic text,
  slides jsonb,
  quality_score numeric,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    linkedin_carousels.id,
    linkedin_carousels.topic,
    linkedin_carousels.slides,
    linkedin_carousels.quality_score,
    1 - (linkedin_carousels.content_embedding <=> query_embedding) as similarity
  FROM linkedin_carousels
  WHERE linkedin_carousels.content_embedding IS NOT NULL
    AND linkedin_carousels.quality_score >= 70
    AND linkedin_carousels.status = 'accepted'
    AND 1 - (linkedin_carousels.content_embedding <=> query_embedding) > match_threshold
  ORDER BY linkedin_carousels.content_embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Example usage (commented for reference):
/*
-- Generate embedding from your text (using OpenAI, Google, etc.)
-- Then search for similar successful carousels:

SELECT * FROM match_successful_carousels(
  '[0.1, 0.2, ..., 0.5]'::vector(1536),  -- Your query embedding
  0.75,  -- Minimum similarity threshold (75%)
  5      -- Return top 5 matches
);

-- Results will show carousels with:
-- - quality_score >= 70 (Brand Analyst approved)
-- - status = 'accepted' (user accepted)
-- - similarity > 0.75 (semantically similar)
-- Ordered by similarity (most similar first)
*/

-- Grant access to the function
GRANT EXECUTE ON FUNCTION match_successful_carousels TO authenticated;
GRANT EXECUTE ON FUNCTION match_successful_carousels TO service_role;
