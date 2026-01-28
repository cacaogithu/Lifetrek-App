import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";

await config({ export: true });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function debugFunction() {
    console.log("🔍 Invoking generate-linkedin-carousel (SYNC MODE)...");

    const { data, error } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: {
            // Direct payload testing (SYNC MODE)
            topic: "Scaling Medical Device Sales with AI",
            targetAudience: "Medical Manufacturers",
            painPoint: "High cost of sales and slow outreach",
            desiredOutcome: "Automated lead generation and higher margins",
            format: "carousel",
            profileType: "company",
            style: "visual"
        }
    });

    if (error) {
        console.error("❌ Invocation Error:", error);
        if (error.context) {
            try {
                const body = await error.context.text();
                console.error("❌ Response Body:", body);
            } catch (e) {
                console.error("Could not read response body:", e);
            }
        }
    } else {
        console.log("✅ Success! Data:", data);
    }
}

debugFunction();
