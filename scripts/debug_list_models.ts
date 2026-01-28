
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

console.log("Listing models via Edge Function...");

const { data, error } = await supabase.functions.invoke('chat', {
    body: {
        debug: true,
        messages: [{ role: 'user', content: 'test' }]
    }
});

if (error) {
    console.log("Function Error found.");
    if (error && typeof error === 'object' && 'context' in error) {
        const response = (error as any).context as Response;
        try {
            const body = await response.text();
            console.log("ERROR BODY:", body);
        } catch (readErr) {
            console.log("Could not read response body.");
        }
    } else {
        console.log("Error details:", error);
    }
} else {
    // Check if error inside data
    if (data.error) {
        console.log("Success with error payload:", data);
    } else {
        console.log("Models Listed:");
        // Likely { models: [...] }
        if (data.models) {
            data.models.forEach((m: any) => console.log(`- ${m.name} (${m.version})`));
        } else {
            console.log(data);
        }
    }
}
