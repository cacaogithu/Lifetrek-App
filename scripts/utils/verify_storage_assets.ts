
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";

await config({ export: true });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const LOGO_URL = "https://dlflpvmdzkeouhgqwqba.supabase.co/storage/v1/object/public/assets/logo.png";
const ISO_URL = "https://dlflpvmdzkeouhgqwqba.supabase.co/storage/v1/object/public/assets/iso.jpg";

async function verifyAssets() {
    console.log("🔍 Verifying Storage Assets...");

    // Check Logo
    console.log(`Checking Logo: ${LOGO_URL}`);
    const logoRes = await fetch(LOGO_URL, { method: "HEAD" });
    if (logoRes.ok) {
        console.log("✅ Logo found!");
    } else {
        console.error(`❌ Logo NOT found (Status: ${logoRes.status})`);

        // List bucket to see what is there
        const { data, error } = await supabase.storage.from('assets').list();
        if (error) {
            console.error("Error listing assets bucket:", error);
        } else {
            console.log("Files in 'assets' bucket:", data.map(f => f.name));
        }
    }

    // Check ISO
    console.log(`Checking ISO: ${ISO_URL}`);
    const isoRes = await fetch(ISO_URL, { method: "HEAD" });
    if (isoRes.ok) {
        console.log("✅ ISO found!");
    } else {
        console.error(`❌ ISO NOT found (Status: ${isoRes.status})`);
    }
}

verifyAssets();
