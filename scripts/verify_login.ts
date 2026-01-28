
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "jsr:@std/dotenv/load";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing env vars");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Attempting sign in with NEW credentials...");
const { data, error } = await supabase.auth.signInWithPassword({
    email: "temp_admin@lifetrek.com",
    password: "temp_password_123",
});

if (error) {
    console.log("Login Failed:", error.message);
} else {
    console.log("Login SUCCESS!");
    console.log("User:", data.user?.email);

    // Also verify admin access
    const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", data.user!.id)
        .single();

    if (adminError || !adminData) {
        console.log("Admin Check FAILED: Not found in admin_users or error", adminError);
    } else {
        console.log("Admin Check SUCCESS: User is super_admin");
    }
}
