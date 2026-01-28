-- Create knowledge_base table for RAG
CREATE TABLE IF NOT EXISTS public.knowledge_base (
  id UUID PRIMARY KEY,
  content TEXT NOT NULL,
  metadata JSONB,
  embedding vector(768),
  source_type TEXT,
  source_id TEXT,
  chunk_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read knowledge base (it's company knowledge)
CREATE POLICY "Public read access" ON public.knowledge_base
  FOR SELECT USING (true);

-- Policy: Only service role can write
CREATE POLICY "Service role write access" ON public.knowledge_base
  FOR ALL USING (auth.role() = 'service_role');

-- Create index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
  ON public.knowledge_base 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Create RPC function for semantic search
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
  match_count int DEFAULT 5
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  source_type text,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    knowledge_base.id,
    knowledge_base.content,
    knowledge_base.metadata,
    knowledge_base.source_type,
    1 - (knowledge_base.embedding <=> query_embedding) as similarity
  FROM knowledge_base
  WHERE 1 - (knowledge_base.embedding <=> query_embedding) > match_threshold
  ORDER BY knowledge_base.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
