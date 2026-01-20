-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge embeddings table for RAG
CREATE TABLE public.knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  embedding vector(768), -- Using 768 dimensions for Gemini embeddings
  source_type TEXT NOT NULL, -- 'brand_book', 'hormozi_framework', 'product_catalog', 'content_template'
  source_id TEXT, -- Reference to original document/section
  chunk_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for vector similarity search
CREATE INDEX knowledge_embeddings_embedding_idx ON public.knowledge_embeddings 
USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Create index for filtering by source type
CREATE INDEX knowledge_embeddings_source_type_idx ON public.knowledge_embeddings(source_type);

-- Enable RLS
ALTER TABLE public.knowledge_embeddings ENABLE ROW LEVEL SECURITY;

-- Admins can manage embeddings
CREATE POLICY "Admins can manage knowledge embeddings" 
ON public.knowledge_embeddings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Edge functions can read embeddings (service role)
CREATE POLICY "Service role can read knowledge embeddings" 
ON public.knowledge_embeddings 
FOR SELECT 
USING (true);

-- Create function to search knowledge base
CREATE OR REPLACE FUNCTION public.match_knowledge(
  query_embedding vector(768),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5,
  filter_source_type TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  metadata JSONB,
  source_type TEXT,
  source_id TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ke.id,
    ke.content,
    ke.metadata,
    ke.source_type,
    ke.source_id,
    1 - (ke.embedding <=> query_embedding) AS similarity
  FROM public.knowledge_embeddings ke
  WHERE 
    1 - (ke.embedding <=> query_embedding) > match_threshold
    AND (filter_source_type IS NULL OR ke.source_type = filter_source_type)
  ORDER BY ke.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to search products for Designer agent
CREATE OR REPLACE FUNCTION public.search_products_for_carousel(
  search_category TEXT DEFAULT NULL,
  search_query TEXT DEFAULT NULL,
  limit_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  category TEXT,
  enhanced_url TEXT,
  brand TEXT,
  model TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ppi.id,
    ppi.name,
    ppi.description,
    ppi.category,
    ppi.enhanced_url,
    ppi.brand,
    ppi.model
  FROM public.processed_product_images ppi
  WHERE 
    ppi.is_visible = true
    AND (search_category IS NULL OR ppi.category ILIKE '%' || search_category || '%')
    AND (search_query IS NULL OR ppi.name ILIKE '%' || search_query || '%' OR ppi.description ILIKE '%' || search_query || '%')
  ORDER BY ppi.is_featured DESC, ppi.created_at DESC
  LIMIT limit_count;
END;
$$;