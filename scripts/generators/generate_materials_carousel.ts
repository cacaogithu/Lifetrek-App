
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";

await config({ export: true });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateMaterialsCarousel() {
    console.log("🚀 Generating 'Material Science Mastery' Carousel...");

    const payload = {
        // Letting the backend generate the text based on these parameters
        topic: "Material Science Mastery: Beyond Standard Titanium Alloys",
        targetAudience: "Medical Device R&D Engineers, Material Scientists, Product Designers",
        painPoint: "Suppliers who only know standard alloys, lack of advice on material fatigue or biocompatibility nuances",
        desiredOutcome: "Position Lifetrek as a technical authority on materials, capable of advising on best alloys for specific implant lifecycles",
        format: "carousel",
        profileType: "company",
        style: "visual"
    };

    const { data, error } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: payload
    });

    if (error) {
        console.error("❌ Error:", error);
    } else {
        console.log("✅ Carousel Generated Successfully!");
        console.log("Check Google Drive for folder starting with '...Material_Science_Mastery...'");
        console.log(JSON.stringify(data, null, 2));
    }
}

generateMaterialsCarousel();
