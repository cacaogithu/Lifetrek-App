
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
    const env = Deno.env.toObject();
    const keys = Object.keys(env);

    // Check specific keys presence (mask value)
    const gemini = env['GEMINI_API_KEY'] ? 'PRESENT' : 'MISSING';
    const google = env['GOOGLE_API_KEY'] ? 'PRESENT' : 'MISSING';

    return new Response(JSON.stringify({
        keys,
        gemini_status: gemini,
        google_status: google
    }), { headers: { 'Content-Type': 'application/json' } });
});
