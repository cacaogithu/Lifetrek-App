
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "jsr:@std/dotenv/load";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || Deno.env.get("VITE_SUPABASE_ANON_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing env vars");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const EMAIL = "temp_admin@lifetrek.com";
const PASSWORD = "temp_password_123";

console.log(`Checking user ${EMAIL}...`);

// 1. Try to login first (since it might exist from previous run)
let userId: string | undefined;

const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email: EMAIL,
    password: PASSWORD
});

if (loginData.user) {
    console.log("Logged in successfully. User ID:", loginData.user.id);
    userId = loginData.user.id;
} else {
    // 2. If login fails, try to sign up
    console.log("Login failed or user not found. Attempting signup...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: EMAIL,
        password: PASSWORD,
    });

    if (authError) {
        console.error("Signup failed:", authError);
        Deno.exit(1);
    }

    if (authData.user) {
        console.log("User created:", authData.user.id);
        userId = authData.user.id;
    }
}

if (!userId) {
    console.error("No user ID found and could not create one.");
    Deno.exit(1);
}

console.log(`Adding ${userId} to admin_users...`);

// Check if already exists
const { data: existing } = await supabase.from('admin_users').select('*').eq('user_id', userId).single();

if (existing) {
    console.log("User is already in admin_users table.");
} else {
    const { error: dbError } = await supabase
        .from('admin_users')
        .insert([
            {
                id: crypto.randomUUID(),
                user_id: userId,
                permission_level: 'super_admin'
            }
        ]);

    if (dbError) {
        console.error("Error adding to admin_users:", dbError);
    } else {
        console.log("Successfully added user to admin_users!");
    }
}
console.log("\nCreated/Verified Admin User:");
console.log("Email:", EMAIL);
console.log("Password:", PASSWORD);
