
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const OPEN_ROUTER_API = Deno.env.get("OPEN_ROUTER_API");

serve(async (req) => {
    try {
        if (!OPEN_ROUTER_API) {
            return new Response("Missing OPEN_ROUTER_API", { status: 500 });
        }

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPEN_ROUTER_API}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "google/gemini-2.0-flash-001",
                messages: [{ role: "user", content: "Hello" }]
            })
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });

    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
});
