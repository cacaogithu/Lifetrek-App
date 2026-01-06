
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const FUNCTION_URL = "https://iijkbhiqcsvtnfernrbs.supabase.co/functions/v1/generate-linkedin-carousel";
// Token from generate_all_carousels.sh (Anon Key)
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpamtiaGlxY3N2dG5mZXJucmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTE2MzUsImV4cCI6MjA3NTkyNzYzNX0.HQJ1vRWwn7YXmWDvb9Pf_JgzeyCDOpXdf2NI-76IUbM";
const SUPABASE_URL = "https://iijkbhiqcsvtnfernrbs.supabase.co";

const supabase = createClient(SUPABASE_URL, AUTH_TOKEN);


interface CarouselInput {
  id: string;
  name: string;
  scheduledDate: string;
  input: any;
  cta?: string;
  hashtags?: string[];
}

const inputsPath = new URL("../docs/content/carousel_inputs_feb2026.json", import.meta.url).pathname;

async function generateCampaign() {
  console.log("🚀 Starting February 2026 Campaign Generation...");
  
  try {
    const data = JSON.parse(await Deno.readTextFile(inputsPath));
    const inputs: CarouselInput[] = data.carousels;

    console.log(`Found ${inputs.length} carousels to generate.`);

    for (const item of inputs) {
      console.log(`\n--------------------------------------------------`);
      console.log(`📝 Generating: ${item.name} (${item.id})`);
      console.log(`   Topic: ${item.input.topic}`);
      
      const payload = {
        ...item.input,
        scheduledDate: item.scheduledDate
      };

      try {
        const response = await fetch(FUNCTION_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${AUTH_TOKEN}`
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`❌ Function error: ${response.status} ${response.statusText}`);
            const text = await response.text();
            console.error(`   Details: ${text}`);
        } else {
             const funcData = await response.json();
             const result = funcData.carousel || funcData.carousels?.[0];
             
             if(result) {
                 console.log(`✅ Generated content for: ${result.topic}`);
                 
                 // NOW INSERT INTO DATABASE CHEEKY STYLE (Client-side)
                 const { data: inserted, error: insertError } = await supabase
                    .from("linkedin_carousels")
                    .insert({
                        topic: result.topic,
                        content: result,
                        status: 'draft',
                        scheduled_date: payload.scheduledDate
                    })
                    .select("id")
                    .single();

                 if (insertError) {
                     console.error("❌ Failed to save to DB (RLS likely):", insertError);
                 } else {
                     console.log("✅ Saved to DB:", inserted.id);
                 }

             } else {
                 console.log(`⚠️ Function returned success but no data.`);
             }
        }

      } catch (err) {
        console.error(`❌ Exception generating ${item.id}:`, err);
      }

      // Wait 5 seconds between calls
      console.log("⏳ Waiting 5s...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.log("\n==================================================");
    console.log("🎉 Campaign Generation Complete!");

  } catch (error) {
    console.error("Critical error reading inputs or executing script:", error);
  }
}

generateCampaign();
