-- Fix vector dimension mismatch
-- We are using Google's text-embedding-004 which produces 768-dimensional embeddings
-- The previous migration incorrectly set it to 1536 (OpenAI standard)

ALTER TABLE public.linkedin_carousels 
  ALTER COLUMN content_embedding TYPE vector(768);

COMMENT ON COLUMN public.linkedin_carousels.content_embedding IS 
  'Vector embedding (768d) of carousel content using Google text-embedding-004';
