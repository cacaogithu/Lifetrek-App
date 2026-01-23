
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "jsr:@std/dotenv/load";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_KEY = Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY");

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("Missing env vars");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Logging in...");
const { data: { session }, error: loginError } = await supabase.auth.signInWithPassword({
    email: "temp_admin@lifetrek.com",
    password: "temp_password_123",
});

if (loginError || !session) {
    console.error("Login failed:", loginError);
    Deno.exit(1);
}

console.log("Calling chat function...");

const { data, error } = await supabase.functions.invoke('chat', {
    body: {
        messages: [
            { role: 'user', content: 'Hello, are you working?' }
        ]
    }
});

if (error) {
    console.log("Function Error found.");

    if (error && typeof error === 'object' && 'context' in error) {
        const response = (error as any).context as Response;
        // Check if we can read the body
        try {
            // Clone response if needed or just read text
            const body = await response.text();
            console.log("ERROR BODY:", body);
        } catch (readErr) {
            console.log("Could not read response body:", readErr);
        }
    } else {
        console.log("Error details:", error);
    }
} else {
    console.log("Function Success:", data);
}
