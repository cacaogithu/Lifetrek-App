-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create a table to store your knowledge base documents
create table if not exists knowledge_embeddings (
  id bigserial primary key,
  content text,
  metadata jsonb,
  embedding vector(768) -- using 768 dimensions for Gemini embeddings
);

-- Enable RLS for security
alter table knowledge_embeddings enable row level security;

-- Create a function to search for documents
create or replace function match_knowledge (
  query_embedding vector(768),
  match_threshold float,
  match_count int
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    ke.id,
    ke.content,
    ke.metadata,
    1 - (ke.embedding <=> query_embedding) as similarity
  from knowledge_embeddings ke
  where 1 - (ke.embedding <=> query_embedding) > match_threshold
  order by ke.embedding <=> query_embedding
  limit match_count;
end;
$$;
