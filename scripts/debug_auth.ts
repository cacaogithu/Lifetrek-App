
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "jsr:@std/dotenv/load";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("VITE_SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing env vars");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Attempting sign in with dummy credentials...");
const { data, error } = await supabase.auth.signInWithPassword({
    email: "test_admin_debug@example.com",
    password: "password123",
});

if (error) {
    console.log("Error Status:", error.status);
    console.log("Error Name:", error.name);
    console.log("Error Message:", error.message);
    console.log("Full Error:", error);
} else {
    console.log("Sign in successful (unexpected for dummy user unless it exists)", data);
}
