import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const VECTOR_BUCKET_NAME = Deno.env.get("VECTOR_BUCKET_NAME") || "knowledge-base";
const VECTOR_INDEX_NAME = Deno.env.get("VECTOR_INDEX_NAME") || "kb-index";
const VECTOR_INDEX_DIMENSION = Number(Deno.env.get("VECTOR_INDEX_DIMENSION") || "0");
const VECTOR_DISTANCE_METRIC = Deno.env.get("VECTOR_DISTANCE_METRIC") || "cosine";
const BATCH_SIZE = Number(Deno.env.get("VECTOR_SYNC_BATCH_SIZE") || "200");
const MAX_ROWS = Number(Deno.env.get("VECTOR_SYNC_MAX_ROWS") || "0");

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function parseEmbedding(raw: unknown): number[] | null {
  if (Array.isArray(raw)) {
    const values = raw.map((value) => Number(value)).filter((value) => Number.isFinite(value));
    return values.length ? values : null;
  }

  if (typeof raw === "string") {
    const cleaned = raw.replace(/[{}()]/g, "").trim();
    if (!cleaned) return null;
    const values = cleaned
      .split(",")
      .map((value) => Number(value.trim()))
      .filter((value) => Number.isFinite(value));
    return values.length ? values : null;
  }

  return null;
}

async function ensureBucketAndIndex(dimension: number) {
  const bucket = supabase.storage.vectors.from(VECTOR_BUCKET_NAME);

  const bucketResult = await supabase.storage.vectors.createBucket(VECTOR_BUCKET_NAME);
  if (bucketResult.error) {
    console.log(`ℹ️ Bucket create: ${bucketResult.error.message}`);
  } else {
    console.log(`✅ Bucket created: ${VECTOR_BUCKET_NAME}`);
  }

  const indexResult = await bucket.createIndex({
    indexName: VECTOR_INDEX_NAME,
    dataType: "float32",
    dimension,
    distanceMetric: VECTOR_DISTANCE_METRIC,
  });

  if (indexResult.error) {
    console.log(`ℹ️ Index create: ${indexResult.error.message}`);
  } else {
    console.log(`✅ Index created: ${VECTOR_INDEX_NAME}`);
  }
}

console.log("🔁 Syncing knowledge_base → Vector Bucket");

let offset = 0;
let synced = 0;
let dimension = VECTOR_INDEX_DIMENSION;

while (true) {
  const limit = BATCH_SIZE;
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("id, content, metadata, source_type, source_id, embedding")
    .not("embedding", "is", null)
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("❌ Failed to fetch knowledge_base rows:", error);
    break;
  }

  if (!data || data.length === 0) break;

  if (!dimension) {
    const firstEmbedding = parseEmbedding(data[0].embedding);
    if (!firstEmbedding) {
      console.error("❌ Could not infer embedding dimension.");
      break;
    }
    dimension = firstEmbedding.length;
    await ensureBucketAndIndex(dimension);
  }

  const vectors = data
    .map((row) => {
      const embedding = parseEmbedding(row.embedding);
      if (!embedding) return null;

      const content = typeof row.content === "string" ? row.content.slice(0, 1000) : "";
      const metadata = {
        title: row.metadata?.title || row.metadata?.name || `KB ${row.id}`,
        source_type: row.source_type,
        source_id: row.source_id,
        content,
      };

      return {
        key: `kb-${row.id}`,
        data: { float32: embedding },
        metadata,
      };
    })
    .filter(Boolean);

  if (!vectors.length) {
    offset += data.length;
    continue;
  }

  const { error: vectorError } = await supabase.storage.vectors
    .from(VECTOR_BUCKET_NAME)
    .index(VECTOR_INDEX_NAME)
    .putVectors({ vectors: vectors as any[] });

  if (vectorError) {
    console.error("❌ Failed to store vectors:", vectorError);
    break;
  }

  synced += vectors.length;
  console.log(`✅ Synced ${synced} vectors`);

  offset += data.length;
  if (MAX_ROWS && synced >= MAX_ROWS) break;
}

console.log(`🎉 Done. Synced ${synced} vectors to ${VECTOR_BUCKET_NAME}/${VECTOR_INDEX_NAME}.`);
