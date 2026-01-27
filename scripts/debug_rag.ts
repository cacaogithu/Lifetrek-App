
import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";
import OpenAI from "openai";

config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPEN_ROUTER_API_KEY = process.env.OPEN_ROUTER_API;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing Supabase credentials in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const openai = new OpenAI({
    apiKey: OPEN_ROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

async function main() {
    const query = "ISO 7 cleanroom";

    if (!OPEN_ROUTER_API_KEY) {
        console.warn("\n⚠️  OPEN_ROUTER_API key missing/empty. Skipping embedding generation/search.");
        console.log("Checking if ANY known table has data (using Supabase config)...\n");

        const tables = ['knowledge_base', 'product_catalog', 'linkedin_carousels', 'resources'];

        for (const table of tables) {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (error) {
                console.error(`- ${table}: Error checking - ${error.message}`);
            } else {
                console.log(`- ${table} count: ${count}`);
                if ((count || 0) > 0) {
                    const { data } = await supabase.from(table).select('*').limit(1);
                    console.log(`  > SAMPLE [${table}]:`, JSON.stringify(data?.[0]).substring(0, 50) + "...");
                }
            }
        }

        console.log("\n--- Self-Query Test (Simulating RAG) ---");
        // 1. Fetch a REAL embedding from the database
        const { data: sourceData } = await supabase
            .from('linkedin_carousels')
            .select('topic, content_embedding')
            .not('content_embedding', 'is', null)
            .limit(1);

        if (sourceData && sourceData.length > 0) {
            const sample = sourceData[0];
            console.log(`Using existing embedding from topic: "${sample.topic}"`);

            // 2. Query using this embedding
            // Note: We use match_successful_carousels because we know this embedding comes from there
            const { data: matches, error: matchError } = await supabase.rpc('match_successful_carousels', {
                query_embedding: sample.content_embedding,
                match_threshold: 0.7, // High threshold because it should match itself
                match_count: 5
            });

            if (matchError) {
                console.error("RPC Error:", matchError);
            } else {
                console.log(`Found ${matches.length} matches (Self-test):`);
                matches.forEach((m: any, i: number) => {
                    console.log(`- Match ${i + 1}: "${m.topic}" (Score: ${m.similarity.toFixed(4)})`);
                });
                if (matches.some((m: any) => m.topic === sample.topic)) {
                    console.log("✅ SUCCESS: RAG retrieval logic is working (found itself).");
                } else {
                    console.warn("⚠️ WARNING: Did not find itself. Check thresholds/index.");
                }
            }
        } else {
            console.warn("No embeddings found in 'linkedin_carousels' to test with.");
        }
        return;
    }

    // Normal flow if API key exists
    console.log(`Generating embedding for: "${query}"...`);
    try {
        const response = await openai.embeddings.create({
            model: "google/text-embedding-004",
            input: query,
        });
        // ... (rest of full RAG test would go here, but we are focusing on self-test without keys)
    } catch (e) {
        console.error("OpenAI Error:", e);
    }
}

main();
