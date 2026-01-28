-- Story 7.9: Add metadata columns for multi-agent carousel generation
-- Epic-7: Carousel Refactor - Mirror Approach on Edge Functions
-- Date: 2026-01-15

-- Add new columns for tracking agent performance and quality
ALTER TABLE public.linkedin_carousels
  ADD COLUMN IF NOT EXISTS generation_metadata JSONB DEFAULT '{}'::JSONB,
  ADD COLUMN IF NOT EXISTS quality_score NUMERIC,
  ADD COLUMN IF NOT EXISTS assets_used TEXT[],
  ADD COLUMN IF NOT EXISTS regeneration_count INTEGER DEFAULT 0;

-- Add indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_carousels_quality
  ON public.linkedin_carousels(quality_score DESC NULLS LAST);

CREATE INDEX IF NOT EXISTS idx_carousels_regeneration
  ON public.linkedin_carousels(regeneration_count);

CREATE INDEX IF NOT EXISTS idx_carousels_metadata
  ON public.linkedin_carousels USING GIN (generation_metadata);

-- Add comments for documentation
COMMENT ON COLUMN public.linkedin_carousels.generation_metadata IS
  'JSON metadata from multi-agent pipeline: {strategy_time_ms, copywriting_time_ms, design_time_ms, review_time_ms, assets_used_count, assets_generated_count, total_time_ms, model_versions}';

COMMENT ON COLUMN public.linkedin_carousels.quality_score IS
  'Brand Analyst quality rating (0-100), null if not reviewed. 90-100: Excellent, 75-89: Good, 60-74: Acceptable, 0-59: Needs regeneration';

COMMENT ON COLUMN public.linkedin_carousels.assets_used IS
  'Array of storage URLs for real company assets used in carousel (RAG retrieval)';

COMMENT ON COLUMN public.linkedin_carousels.regeneration_count IS
  'Number of times carousel was regenerated due to quality issues (0 = first attempt successful)';

-- Example metadata structure (for reference):
/*
{
  "strategy_time_ms": 1247,
  "copywriting_time_ms": 2103,
  "design_time_ms": 8654,
  "review_time_ms": 1543,
  "assets_used_count": 2,
  "assets_generated_count": 5,
  "total_time_ms": 13547,
  "model_versions": {
    "strategist": "gemini-2.5-flash",
    "copywriter": "gemini-2.5-flash",
    "designer": "gemini-3-pro-image",
    "reviewer": "gemini-1.5-pro"
  }
}
*/

-- Example analytics queries (commented for reference):
/*
-- Average quality score by user
SELECT
  user_id,
  AVG(quality_score) as avg_quality,
  COUNT(*) as total_carousels
FROM linkedin_carousels
WHERE quality_score IS NOT NULL
GROUP BY user_id
ORDER BY avg_quality DESC;

-- Asset usage statistics
SELECT
  COUNT(*) as total_carousels,
  COUNT(assets_used) FILTER (WHERE array_length(assets_used, 1) > 0) as carousels_with_assets,
  ROUND(
    COUNT(assets_used) FILTER (WHERE array_length(assets_used, 1) > 0)::numeric /
    NULLIF(COUNT(*), 0) * 100,
    1
  ) as asset_usage_rate
FROM linkedin_carousels;

-- Agent performance metrics
SELECT
  AVG((generation_metadata->>'strategy_time_ms')::numeric) as avg_strategy_ms,
  AVG((generation_metadata->>'copywriting_time_ms')::numeric) as avg_copy_ms,
  AVG((generation_metadata->>'design_time_ms')::numeric) as avg_design_ms,
  AVG((generation_metadata->>'review_time_ms')::numeric) as avg_review_ms,
  AVG((generation_metadata->>'total_time_ms')::numeric) as avg_total_ms
FROM linkedin_carousels
WHERE generation_metadata IS NOT NULL;

-- Regeneration rate analysis
SELECT
  regeneration_count,
  COUNT(*) as carousel_count,
  ROUND(COUNT(*)::numeric / (SELECT COUNT(*) FROM linkedin_carousels) * 100, 1) as percentage
FROM linkedin_carousels
GROUP BY regeneration_count
ORDER BY regeneration_count;
*/
