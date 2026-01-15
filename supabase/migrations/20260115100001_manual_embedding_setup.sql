-- Run this in Supabase SQL Editor to enable embeddings
-- We use Google's text-embedding-004 which produces 768-dimensional embeddings

-- 0. Enable pgvector extension (REQUIRED)
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Add the column
ALTER TABLE public.linkedin_carousels 
ADD COLUMN IF NOT EXISTS content_embedding vector(768);

-- 2. Create the index for fast similarity search
CREATE INDEX IF NOT EXISTS idx_carousels_content_embedding 
ON public.linkedin_carousels 
USING hnsw (content_embedding vector_cosine_ops);

-- 3. Comment for clarity
COMMENT ON COLUMN public.linkedin_carousels.content_embedding IS 
  'Vector embedding (768d) of carousel content using Google text-embedding-004';
