
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Load environment variables (mocking env loading for this script context if needed, but assuming I can pass them or use defaults if public)
// Actually, I'll try to read .env first or just use placeholders if I can't.
// But I don't have access to .env content directly in this runtime easily without reading it.
// I'll read .env first.

const supabaseUrl = Deno.env.get("VITE_SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("VITE_SUPABASE_ANON_KEY") || "";

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase credentials");
    Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkKnowledgeBase() {
    console.log("Checking knowledge_base table...");
    const { data, error, count } = await supabase
        .from("knowledge_base")
        .select("*", { count: 'exact' });

    if (error) {
        console.error("Error fetching knowledge base:", error);
    } else {
        console.log(`Found ${count} items in knowledge_base.`);
        if (data && data.length > 0) {
            console.log("First item:", data[0]);
        } else {
            console.log("Table is empty.");
        }
    }
}

checkKnowledgeBase();
