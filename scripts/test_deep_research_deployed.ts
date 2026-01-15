
import "https://deno.land/std@0.224.0/dotenv/load.ts";

const PROJECT_REF = "dlflpvmdzkeouhgqwqba";
const FUNCTION_URL = `https://dlflpvmdzkeouhgqwqba.supabase.co/functions/v1/deep-research`;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

console.log(`🚀 Testing Deployed Function: ${FUNCTION_URL}`);

try {
    const response = await fetch(FUNCTION_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`
        },
        body: JSON.stringify({
            topic: "Benefits of Edge Computing for AI Agents",
            depth: "basic"
        })
    });

    if (!response.ok) {
        throw new Error(`Function Error: ${response.status} ${await response.text()}`);
    }

    const data = await response.json();
    console.log("✅ Success! Response:\n", JSON.stringify(data, null, 2).substring(0, 500) + "...");

} catch (e) {
    console.error("❌ Failed:", e.message);
}
