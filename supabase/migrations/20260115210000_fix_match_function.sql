
-- Redefine match function for 768d (Gemini)
-- Date: 2026-01-15

DROP FUNCTION IF EXISTS match_successful_carousels(vector(1536), float, int);

CREATE OR REPLACE FUNCTION match_successful_carousels(
  query_embedding vector(768),
  match_threshold float DEFAULT 0.5,
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
