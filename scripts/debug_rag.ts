
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

console.log("🕵️‍♀️ Debugging RAG Matches...");

const content = "Remote Work Best Practices. 1. Communication. 2. Boundaries.";

// 1. Generate Input Embedding
const embedModel = genAI.getGenerativeModel({ model: "text-embedding-004" });
const embedResult = await embedModel.embedContent(content);
const vector = embedResult.embedding.values;

console.log("Vector Dimensions:", vector.length);

// 2. Call RPC with threshold 0
const { data, error } = await supabase.rpc('match_successful_carousels', {
    query_embedding: vector,
    match_threshold: 0.0, // Get everything
    match_count: 5
});

if (error) {
    console.error("❌ RPC Error:", error);
} else {
    console.log("✅ Matches found:", data.length);
    data.forEach((d: any) => {
        console.log(`- Score: ${d.quality_score} | Similarity: ${d.similarity.toFixed(4)} | Topic: ${d.topic}`);
    });
}
