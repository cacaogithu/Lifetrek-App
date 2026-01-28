
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "jsr:@std/dotenv/load";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing SUPABASE_SERVICE_ROLE_KEY.");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const EMAIL = "temp_admin@lifetrek.com";
const PASSWORD = "temp_password_123";

console.log(`Searching for user ${EMAIL}...`);

const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
if (listError) Deno.exit(1);
const user = users.find(u => u.email === EMAIL);
if (!user) { console.error("User not found (should have been created)"); Deno.exit(1); }

const userId = user.id;

// 1. Check public.users (or 'users' table)
// Based on error: Key (id)=(...) is not present in table "users".
// This implies we need a row in 'users' table with id = admin_users.id? 
// Or maybe admin_users structure is: id (ref users.id), user_id (ref auth.users.id)? 
// Let's assume 'users' table exists and mirrors auth.users.

console.log("Checking public.users table...");
const { data: publicUser, error: publicError } = await supabase
    .from('users') // Try 'users', if fails try 'profiles' (users is likely based on error)
    .select('*')
    .eq('id', userId)
    .single();

if (publicError && publicError.code !== 'PGRST116') {
    console.log("Error checking users table (might be named profiles?):", publicError.message);
}

if (!publicUser) {
    console.log("User missing in public.users. Creating...");
    // Try to insert into users currently
    const { error: insertUserError } = await supabase.from('users').insert([{
        id: userId,
        email: EMAIL,
        // Add other required fields if known. usually first_name, last_name?
        first_name: "Temp",
        last_name: "Admin"
    }]);

    if (insertUserError) {
        console.error("Failed to insert into public.users:", insertUserError);
        // Fallback: maybe table is 'profiles'? 
        // But error said "users".
    } else {
        console.log("Inserted into public.users successfully.");
    }
} else {
    console.log("User exists in public.users.");
}

console.log(`Adding ${userId} to admin_users...`);

// Check if already exists
const { data: existing } = await supabase.from('admin_users').select('*').eq('user_id', userId).single();

if (existing) {
    console.log("User is already in admin_users table.");
} else {
    // Try inserting with id = userId (assuming 1:1 if fails with random UUID)
    // Actually, previously failed with random UUID.
    // If admin_users.id FKs to users.id, then likely admin_users.id SHOULD be userId?
    // Let's try id = userId.

    const { error: dbError } = await supabase
        .from('admin_users')
        .insert([
            {
                id: userId, // TRYING SAME ID
                user_id: userId,
                permission_level: 'super_admin'
            }
        ]);

    if (dbError) {
        console.error("Error adding to admin_users with id=userId:", dbError);

        // If that failed, maybe it needs a random UUID but referring to users via ANOTHER column? 
        // But previous error was "table "admin_users" violates foreign key constraint "admin_users_id_fkey"".
        // This strongly suggests 'id' column on admin_users is the FK.
    } else {
        console.log("Successfully added user to admin_users!");
    }
}

console.log("\nLOGIN CREDENTIALS:");
console.log("Email:", EMAIL);
console.log("Password:", PASSWORD);
