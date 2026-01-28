import { createClient } from "npm:@supabase/supabase-js@2";
import { parse } from "https://deno.land/std@0.224.0/csv/parse.ts";

// Setup Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "https://your-project.supabase.co";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

if (!supabaseServiceKey) {
    console.error("❌ SUPABASE_SERVICE_ROLE_KEY not set in environment");
    Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function ingestKnowledge() {
    console.log("📖 Starting knowledge base ingestion...\n");

    // Read CSV file
    const csvPath = "/Users/rafaelalmeida/Downloads/knowledge_embeddings-export-2026-01-16_08-30-40.csv";
    const csvText = await Deno.readTextFile(csvPath);

    // Parse CSV (semicolon-separated)
    const records = parse(csvText, {
        skipFirstRow: true,
        separator: ";",
    });

    console.log(`Found ${records.length} knowledge entries to process\n`);

    // First, ensure the table exists
    const { data: tableCheck, error: tableError } = await supabase
        .from("knowledge_base")
        .select("id")
        .limit(1);

    if (tableError) {
        console.log("⚠️  knowledge_base table might not exist. Creating migration...");

        // Create the migration
        const migrationSQL = `
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
`;

        console.log("Migration SQL (run this in Supabase SQL Editor if table doesn't exist):");
        console.log(migrationSQL);
        console.log("\n⏸️  Please create the table first, then run this script again.\n");
        return;
    }

    // Process each record
    let successCount = 0;
    let errorCount = 0;

    for (const record of records) {
        try {
            const [id, content, metadataStr, embeddingStr, sourceType, sourceId, chunkIndex, createdAt, updatedAt] = record;

            // Parse metadata (it's JSON in the CSV)
            let metadata = null;
            try {
                metadata = metadataStr ? JSON.parse(metadataStr) : {};
            } catch (e) {
                console.warn(`⚠️  Could not parse metadata for ${id}: ${e.message}`);
                metadata = {};
            }

            // Parse embedding vector (it's a PostgreSQL array string in CSV)
            // We'll skip embedding for now since the CSV doesn't include it in readable format
            // The embedding column will be NULL, which is fine - we can regenerate later if needed

            const { error } = await supabase
                .from("knowledge_base")
                .upsert({
                    id,
                    content,
                    metadata,
                    embedding: null, // Will be regenerated via Edge Function if needed
                    source_type: sourceType,
                    source_id: sourceId,
                    chunk_index: chunkIndex ? parseInt(chunkIndex) : 0,
                    created_at: createdAt || new Date().toISOString(),
                    updated_at: updatedAt || new Date().toISOString(),
                }, { onConflict: "id" });

            if (error) {
                console.error(`❌ Error inserting ${id}:`, error.message);
                errorCount++;
            } else {
                successCount++;
                if (successCount % 10 === 0) {
                    console.log(`✅ Processed ${successCount}/${records.length} entries...`);
                }
            }
        } catch (e) {
            console.error(`❌ Error processing record:`, e.message);
            errorCount++;
        }
    }

    console.log(`\n✅ Ingestion Complete!`);
    console.log(`   - Success: ${successCount}`);
    console.log(`   - Errors: ${errorCount}`);
    console.log(`\n📝 Note: Embeddings were set to NULL. You can regenerate them via /generate-embeddings Edge Function if needed.\n`);
}

// Run it
ingestKnowledge();
