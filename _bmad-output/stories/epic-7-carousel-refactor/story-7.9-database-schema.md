# Story 7.9: Database Schema Updates

**Epic**: Epic-7: Carousel Refactor - Mirror Approach on Edge Functions
**Status**: Ready to Start
**Priority**: High
**Estimated Effort**: 1 day
**Dependencies**: None (can be done early)

---

## Description

Update the `linkedin_carousels` table to support multi-agent workflow metadata, quality tracking, and improved analytics. This schema update can be implemented early and will be used by Stories 7.2, 7.8 for observability.

---

## Acceptance Criteria

### Must Have
- [ ] Add `generation_metadata` JSONB column for storing agent metrics
- [ ] Add `quality_score` numeric column for Brand Analyst ratings
- [ ] Add `assets_used` text[] column for tracking real asset usage
- [ ] Add `regeneration_count` integer column for tracking iterations
- [ ] Migration preserves all existing data
- [ ] Indexes created for analytics queries
- [ ] RLS policies updated to allow access to new columns

### Should Have
- [ ] Default values set for new columns
- [ ] NULL handling for backwards compatibility
- [ ] Migration tested on development database first

### Nice to Have
- [ ] Migration includes comments explaining purpose
- [ ] Performance testing for large carousels table
- [ ] Example queries for new columns in migration comments

---

## Technical Details

### Migration File

**File**: `/Users/rafaelalmeida/Lifetrek-App/supabase/migrations/20260115000000_carousel_metadata.sql`

**Migration SQL**:
```sql
-- Story 7.9: Add metadata columns for multi-agent carousel generation
-- Epic-7: Carousel Refactor - Mirror Approach
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
  'JSON metadata from multi-agent pipeline: {strategy_time_ms, copywriting_time_ms, design_time_ms, review_time_ms, assets_used_count, assets_generated_count}';

COMMENT ON COLUMN public.linkedin_carousels.quality_score IS
  'Brand Analyst quality rating (0-100), null if not reviewed';

COMMENT ON COLUMN public.linkedin_carousels.assets_used IS
  'Array of storage URLs for real company assets used in carousel';

COMMENT ON COLUMN public.linkedin_carousels.regeneration_count IS
  'Number of times carousel was regenerated due to quality issues';

-- Grant access to new columns (inherit existing RLS policies)
-- No explicit grants needed - RLS policies apply to all columns

-- Example queries for analytics (commented out, for reference)
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
  AVG((generation_metadata->>'review_time_ms')::numeric) as avg_review_ms
FROM linkedin_carousels
WHERE generation_metadata IS NOT NULL;
*/
```

---

## Schema Definition

### New Columns

#### `generation_metadata` (JSONB)
**Purpose**: Store detailed metrics from multi-agent pipeline

**Structure**:
```typescript
interface GenerationMetadata {
  strategy_time_ms: number;        // Time spent in Strategist agent
  copywriting_time_ms: number;     // Time spent in Copywriter agent
  design_time_ms: number;          // Time spent in Designer agent
  review_time_ms: number;          // Time spent in Brand Analyst
  assets_used_count: number;       // Number of real company assets used
  assets_generated_count: number;  // Number of AI-generated images
  total_time_ms: number;           // End-to-end generation time
  model_versions: {                // Models used
    strategist: string;
    copywriter: string;
    designer: string;
    reviewer: string;
  };
  errors?: string[];               // Any non-fatal errors during generation
}
```

**Example Value**:
```json
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
```

#### `quality_score` (NUMERIC)
**Purpose**: Brand Analyst's quality rating (0-100)
**Range**: 0-100 (null if not reviewed)
**Interpretation**:
- 90-100: Excellent
- 75-89: Good
- 60-74: Acceptable
- 0-59: Needs regeneration

#### `assets_used` (TEXT[])
**Purpose**: Track which real company assets were used
**Example**:
```sql
['https://supabase.co/storage/v1/object/public/assets/facility/cnc-machine.jpg',
 'https://supabase.co/storage/v1/object/public/products/implant-2.jpg']
```

#### `regeneration_count` (INTEGER)
**Purpose**: Count how many times carousel was regenerated
**Default**: 0
**Interpretation**: Higher count = more iterations needed for quality

---

## Implementation Plan

### Step 1: Create Migration File
```bash
# Create timestamped migration
cd /Users/rafaelalmeida/Lifetrek-App
supabase migration new carousel_metadata
```

### Step 2: Apply Migration Locally
```bash
# Reset local database (if safe)
supabase db reset

# Or apply incrementally
supabase db push
```

### Step 3: Test Migration
```sql
-- Verify columns exist
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'linkedin_carousels'
  AND column_name IN ('generation_metadata', 'quality_score', 'assets_used', 'regeneration_count');

-- Verify indexes exist
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'linkedin_carousels'
  AND indexname LIKE 'idx_carousels_%';

-- Test inserting data with new columns
INSERT INTO linkedin_carousels (
  user_id, topic, generation_metadata, quality_score, assets_used, regeneration_count
) VALUES (
  auth.uid(),
  'Test Topic',
  '{"strategy_time_ms": 1000, "total_time_ms": 5000}'::jsonb,
  85,
  ARRAY['https://example.com/asset1.jpg'],
  0
);
```

### Step 4: Deploy to Production
```bash
# Push migration to remote
supabase db push --linked

# Verify in production
supabase db remote changes
```

---

## Testing Strategy

### Unit Tests (SQL)
```sql
-- Test 1: Insert with all new columns
INSERT INTO linkedin_carousels (...);

-- Test 2: Insert without new columns (backwards compatibility)
INSERT INTO linkedin_carousels (user_id, topic, slides) VALUES (...);

-- Test 3: Query with index (should use idx_carousels_quality)
EXPLAIN ANALYZE
SELECT * FROM linkedin_carousels
WHERE quality_score > 80
ORDER BY quality_score DESC
LIMIT 10;

-- Test 4: JSONB query (should use GIN index)
EXPLAIN ANALYZE
SELECT * FROM linkedin_carousels
WHERE generation_metadata @> '{"assets_used_count": 2}'::jsonb;
```

### Integration Tests (TypeScript)
```typescript
// Test inserting carousel with metadata
const { data, error } = await supabase
  .from('linkedin_carousels')
  .insert({
    user_id: userId,
    topic: 'Test',
    generation_metadata: {
      strategy_time_ms: 1000,
      total_time_ms: 5000
    },
    quality_score: 85,
    assets_used: ['https://example.com/asset.jpg'],
    regeneration_count: 0
  });
```

---

## Success Metrics

- [ ] Migration runs without errors
- [ ] All indexes created successfully
- [ ] Existing data preserved (no data loss)
- [ ] New columns queryable
- [ ] Performance: Queries using indexes complete in < 100ms
- [ ] Backwards compatibility: Old code can still insert without new columns

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Migration fails on large table | Low | High | Test on copy of production data first |
| Index creation locks table | Medium | Medium | Run during low-traffic window |
| Breaking existing queries | Low | Medium | Test existing queries after migration |
| Performance degradation | Low | Low | ANALYZE table after migration |

---

## Analytics Queries Enabled

After this migration, we can answer:

1. **What's our average quality score?**
```sql
SELECT AVG(quality_score) FROM linkedin_carousels WHERE quality_score IS NOT NULL;
```

2. **How often do we use real assets vs AI generation?**
```sql
SELECT
  COUNT(*) FILTER (WHERE array_length(assets_used, 1) > 0) * 100.0 / COUNT(*) as asset_usage_pct
FROM linkedin_carousels;
```

3. **Which agent is the bottleneck?**
```sql
SELECT
  AVG((generation_metadata->>'design_time_ms')::numeric) as avg_design_time
FROM linkedin_carousels
ORDER BY avg_design_time DESC;
```

4. **How many carousels need multiple attempts?**
```sql
SELECT regeneration_count, COUNT(*)
FROM linkedin_carousels
GROUP BY regeneration_count
ORDER BY regeneration_count;
```

---

## Follow-up Stories

After this migration:
- **Story 7.2**: Multi-Agent Pipeline will write to `generation_metadata`
- **Story 7.8**: Observability will query these columns for dashboards
- **Story 7.4**: RAG Asset Retrieval will populate `assets_used`

---

## Definition of Done

- [ ] Migration file created with proper timestamp
- [ ] Migration applied to local database successfully
- [ ] All indexes created
- [ ] Comments added to columns
- [ ] Backwards compatibility tested
- [ ] Performance tested with EXPLAIN ANALYZE
- [ ] Deployed to production (or ready to deploy)
- [ ] Documentation updated (if needed)
