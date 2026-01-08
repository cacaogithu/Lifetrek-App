
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { ensureDir } from "https://deno.land/std@0.177.0/fs/mod.ts";

const SUPABASE_URL = "https://iijkbhiqcsvtnfernrbs.supabase.co";
// This script requires the SERVICE_ROLE_KEY to write to the DB
const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SERVICE_KEY) {
  console.error("❌ Error: SUPABASE_SERVICE_ROLE_KEY is required.");
  console.error("   Run with: export SUPABASE_SERVICE_ROLE_KEY='...' && deno run ...");
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

const INPUT_DIR = "execution/generated_carousels";

async function importCarousels() {
  console.log(`📂 Reading carousels from: ${INPUT_DIR}`);
  
  try {
    const success = [];
    const failed = [];

    for await (const entry of Deno.readDir(INPUT_DIR)) {
      if (entry.isFile && entry.name.endsWith(".json")) {
        console.log(`\n📄 Processing: ${entry.name}`);
        const content = await Deno.readTextFile(`${INPUT_DIR}/${entry.name}`);
        const carousel = JSON.parse(content);
        
        console.log(`   Topic: "${carousel.topic}"`);
        console.log(`   Slides: ${carousel.slides.length}`);
        
        // Prepare payload
        const payload = {
          topic: carousel.topic,
          target_audience: carousel.targetAudience,
          pain_point: carousel.painPoint || '',
          desired_outcome: carousel.desiredOutcome || '',
          proof_points: carousel.proofPoints || '',
          cta_action: carousel.ctaAction || '',
          slides: { slides: carousel.slides },
          image_urls: carousel.imageUrls || [],
          caption: carousel.caption || '',
          content: carousel, // Full JSON dump
          status: 'approved', // Auto-approve since we reviewed it
          created_at: new Date().toISOString()
        };

        // Insert
        const { data, error } = await supabase
          .from('linkedin_carousels')
          .insert(payload)
          .select('id')
          .single();

        if (error) {
          console.error(`   ❌ Failed to insert: ${error.message}`);
          failed.push(entry.name);
        } else {
          console.log(`   ✅ Imported! ID: ${data.id}`);
          success.push(entry.name);
        }
      }
    }

    console.log("\n---------------------------------------------------------");
    console.log(`🏁 Import Finished!`);
    console.log(`✅ Success: ${success.length}`);
    console.log(`❌ Failed: ${failed.length}`);

  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
        console.error(`❌ Input directory not found: ${INPUT_DIR}`);
    } else {
        console.error("❌ Unexpected error:", err);
    }
  }
}

importCarousels();
