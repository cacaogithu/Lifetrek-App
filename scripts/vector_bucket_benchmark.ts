import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const OPEN_ROUTER_API = Deno.env.get("OPEN_ROUTER_API")!;
const VECTOR_BUCKET_NAME = Deno.env.get("VECTOR_BUCKET_NAME") || "knowledge-base";
const VECTOR_INDEX_NAME = Deno.env.get("VECTOR_INDEX_NAME") || "kb-index";
const EMBEDDING_MODEL = Deno.env.get("OPEN_ROUTER_EMBEDDING_MODEL") || "openai/text-embedding-3-small";
const QUERY = Deno.args.join(" ").trim() || "Manufatura de dispositivos médicos no Brasil";

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !OPEN_ROUTER_API) {
  console.error("Missing SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, or OPEN_ROUTER_API.");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function createOpenRouterEmbedding(input: string): Promise<number[] | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch("https://openrouter.ai/api/v1/embeddings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPEN_ROUTER_API}`,
        "HTTP-Referer": "https://lifetrek.app",
        "X-Title": "Lifetrek App",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error("Embedding request failed:", await response.text());
      return null;
    }

    const data = await response.json();
    return data?.data?.[0]?.embedding || null;
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("Embedding error:", error);
    return null;
  }
}

console.log(`🔍 Benchmarking RAG for: "${QUERY}"`);

const embeddingStart = performance.now();
const queryEmbedding = await createOpenRouterEmbedding(QUERY);
const embeddingMs = Math.round(performance.now() - embeddingStart);

if (!queryEmbedding) {
  console.error("❌ Failed to generate embedding.");
  Deno.exit(1);
}

console.log(`✅ Embedding generated in ${embeddingMs}ms (${queryEmbedding.length} dims)`);

// Vector bucket query
const vectorStart = performance.now();
const { data: vectorData, error: vectorError } = await supabase.storage.vectors
  .from(VECTOR_BUCKET_NAME)
  .index(VECTOR_INDEX_NAME)
  .queryVectors({
    queryVector: { float32: queryEmbedding },
    topK: 5,
    returnDistance: true,
    returnMetadata: true,
  });
const vectorMs = Math.round(performance.now() - vectorStart);

if (vectorError) {
  console.error("❌ Vector bucket query error:", vectorError);
} else {
  console.log(`✅ Vector bucket query in ${vectorMs}ms`);
  vectorData?.vectors?.forEach((match: any, index: number) => {
    const title = match.metadata?.title || match.key || "Untitled";
    const similarity = match.distance != null ? (1 - match.distance).toFixed(4) : "n/a";
    console.log(`  ${index + 1}. ${title} (similarity ${similarity})`);
  });
}

// pgvector query
const pgStart = performance.now();
const { data: pgData, error: pgError } = await supabase.rpc("match_knowledge_base", {
  query_embedding: queryEmbedding,
  match_threshold: 0.7,
  match_count: 5,
});
const pgMs = Math.round(performance.now() - pgStart);

if (pgError) {
  console.error("❌ pgvector query error:", pgError);
} else {
  console.log(`✅ pgvector query in ${pgMs}ms`);
  (pgData || []).forEach((match: any, index: number) => {
    const title = match.metadata?.title || match.source_type || match.id || "Untitled";
    const similarity = match.similarity != null ? Number(match.similarity).toFixed(4) : "n/a";
    console.log(`  ${index + 1}. ${title} (similarity ${similarity})`);
  });
}
