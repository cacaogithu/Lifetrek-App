import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import "jsr:@std/dotenv/load";

const url = Deno.env.get("VITE_SUPABASE_URL");
const key = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY") || Deno.env.get("VITE_SUPABASE_ANON_KEY");

console.log("=== SUPABASE CONFIG ===");
console.log("URL:", url);
console.log("Key exists:", !!key);
console.log("Key length:", key?.length);

if (!url || !key) {
    console.error("Missing env vars!");
    Deno.exit(1);
}

const supabase = createClient(url, key);

console.log("\n=== TESTING LOGIN ===");
const { data, error } = await supabase.auth.signInWithPassword({
    email: "temp_admin@lifetrek.com",
    password: "temp_password_123",
});

if (error) {
    console.log("❌ LOGIN FAILED");
    console.log("Error message:", error.message);
    console.log("Error status:", error.status);
    console.log("Full error:", JSON.stringify(error, null, 2));
} else {
    console.log("✅ LOGIN SUCCESS");
    console.log("User ID:", data.user?.id);
    console.log("Email:", data.user?.email);

    // Check admin_users
    console.log("\n=== CHECKING ADMIN ACCESS ===");
    const { data: adminData, error: adminError } = await supabase
        .from("admin_users")
        .select("*")
        .eq("user_id", data.user!.id)
        .single();

    if (adminError) {
        console.log("❌ Admin check failed:", adminError.message);
    } else if (adminData) {
        console.log("✅ Admin verified:", adminData.permission_level);
    } else {
        console.log("❌ User not in admin_users table");
    }
}
