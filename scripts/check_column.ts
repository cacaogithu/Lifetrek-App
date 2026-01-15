
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

async function check() {
    const { data, error } = await supabase.from('linkedin_carousels').select('content_embedding').limit(1);
    if (error) {
        console.log("Column missing or error:", error.message);
    } else {
        console.log("Column exists.");
    }
}
check();
