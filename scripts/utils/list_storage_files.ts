
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";

await config({ export: true });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function listBucket(bucket: string) {
    console.log(`\n📂 Listing bucket: ${bucket}`);
    const { data, error } = await supabase.storage.from(bucket).list();

    if (error) {
        console.error(`❌ Error listing ${bucket}:`, error.message);
        return;
    }

    if (!data || data.length === 0) {
        console.log("   (Empty)");
        return;
    }

    data.forEach(f => {
        console.log(`   - ${f.name} (${(f.metadata?.size / 1024).toFixed(1)} KB)`);
    });
}

async function run() {
    await listBucket('assets');
    await listBucket('processed_product_images');
    await listBucket('product_images'); // Check potential other name
}

run();
