-- Enable RAG for Product Catalog and Assets
-- Adds vector embedding support for semantic search of assets

CREATE EXTENSION IF NOT EXISTS vector;

-- Ensure product_catalog exists (if not created earlier)
CREATE TABLE IF NOT EXISTS public.product_catalog (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    image_url text,
    metadata jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- Add embedding column
ALTER TABLE public.product_catalog 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Create index
CREATE INDEX IF NOT EXISTS idx_product_catalog_embedding 
ON public.product_catalog 
USING hnsw (embedding vector_cosine_ops);

-- Search Function
CREATE OR REPLACE FUNCTION match_product_assets(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  image_url text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pc.id,
    pc.name,
    pc.description,
    pc.image_url,
    1 - (pc.embedding <=> query_embedding) as similarity
  FROM product_catalog pc
  WHERE 1 - (pc.embedding <=> query_embedding) > match_threshold
  ORDER BY pc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

GRANT EXECUTE ON FUNCTION match_product_assets TO service_role;
GRANT EXECUTE ON FUNCTION match_product_assets TO authenticated;
