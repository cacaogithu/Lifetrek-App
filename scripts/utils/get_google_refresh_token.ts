
import { open } from "https://deno.land/x/open@v0.0.6/index.ts";
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";

// Load .env file
await config({ export: true });

const CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");
const REDIRECT_URI = "http://localhost:8080";

if (!CLIENT_ID || !CLIENT_SECRET) {
    console.error("❌ Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.");
    Deno.exit(1);
}

const SCOPES = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/drive.metadata",
    "https://www.googleapis.com/auth/drive.appdata",
    "https://www.googleapis.com/auth/drive.scripts",
];

const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${SCOPES.join(
    " "
)}&access_type=offline&prompt=consent`;

console.log("👉 Opening browser to authorize...");
try {
    await open(authUrl);
} catch {
    console.log("Could not open browser. Please visit this URL manually:");
    console.log(authUrl);
}

console.log("\nListening on http://localhost:8080 for callback...");

const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (code) {
        console.log("✅ Authorization code received!");

        // Exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenResponse.json();

        if (tokens.error) {
            console.error("❌ Error getting tokens:", tokens);
            return new Response(`Error: ${tokens.error_description}`, { status: 400 });
        }

        console.log("\n🎉 SUCCESS! Here is your Refresh Token:");
        console.log("----------------------------------------");
        console.log(tokens.refresh_token);
        console.log("----------------------------------------");
        console.log("Copy this token and set it as GOOGLE_DRIVE_REFRESH_TOKEN in your .env / Supabase Secrets.");

        return new Response("Success! You can close this window and check your terminal.");
    }

    return new Response("Waiting for code...", { status: 200 });
};

// Use Deno.serve (native in newer Deno) or std/http
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
await serve(handler, { port: 8080 });
