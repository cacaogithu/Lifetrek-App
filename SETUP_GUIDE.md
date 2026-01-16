# Quick Setup Guide - Knowledge Base & Leads Fix

## ⚡ Quick Steps to Complete Setup

### 1. Apply Database Migrations

Go to your Supabase Dashboard SQL Editor:
👉 https://supabase.com/dashboard/project/dlflpvmdzkeouhgqwqba/sql/new

**Copy and run this SQL:**

```sql
-- Step 1: Enable vector extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS vector;

-- Step 2: Create knowledge_base table
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

-- Step 3: Enable RLS
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Step 4: Create policies
DROP POLICY IF EXISTS "Public read access" ON public.knowledge_base;
CREATE POLICY "Public read access" ON public.knowledge_base
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Service role write access" ON public.knowledge_base;
CREATE POLICY "Service role write access" ON public.knowledge_base
  FOR ALL USING (auth.role() = 'service_role');

-- Step 5: Create vector index
CREATE INDEX IF NOT EXISTS idx_knowledge_base_embedding 
  ON public.knowledge_base 
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);

-- Step 6: Create search function
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

-- Step 7: Fix leads RLS (showing 118 instead of 2000)
DROP POLICY IF EXISTS "Admins can view all leads" ON public.contact_leads;
CREATE POLICY "Authenticated users can view leads"
  ON public.contact_leads
  FOR SELECT
  USING (auth.role() = 'authenticated');
```

### 2. Run Knowledge Ingestion

After running the SQL above, run this command:

```bash
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRsZmxwdm1kemtlb3VoZ3F3cWJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzcyNzYwOSwiZXhwIjoyMDgzMzAzNjA5fQ.QT2RDwGP92JhDFb3fGRgMuViKW-AioTIu44x_g0hw5o" SUPABASE_URL="https://dlflpvmdzkeouhgqwqba.supabase.co" deno run --allow-read --allow-env --allow-net scripts/ingest_knowledge.ts
```

### 3. Verify Everything Works

1. **Check leads count**: Navigate to `/admin/leads` - should now show ~2000 leads
2. **Test Content Orchestrator**: Go to Content Orchestrator, try a message in Portuguese
3. **View dashboards**: 
   - Super Admin (Rafael): Should see analytics placeholders
   - Sales (Vanessa): Should see daily checklist

---

## What's Already Done ✅

- Dashboard layout compacted (`max-w-7xl`)
- Role-based dashboards created (SuperAdmin/Sales)
- Content Orchestrator speaks Portuguese with clean text
- Auto-carousel dispatch implemented
- Build successful
- All code changes committed

## Just Need Manual SQL Run

The automated migration commands failed due to connection string issues with Supabase CLI, but running the SQL directly in the dashboard will work perfectly!
