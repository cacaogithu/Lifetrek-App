import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const DEFAULT_MODEL = "google/gemini-2.0-flash-001" // Cheap and fast

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Auth check
        const authHeader = req.headers.get('Authorization')
        const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))

        if (authError || !user) {
            return new Response(JSON.stringify({ error: 'Unauthorized', status: 401 }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 1. GUARDRAIL: Rate Limiting
        const { count, error: countError } = await supabase
            .from('api_usage_logs')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .gt('created_at', new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString())

        if (countError) throw countError

        if (count !== null && count >= MAX_REQUESTS_PER_WINDOW) {
            console.warn(`Rate limit exceeded for user ${user.id}`)
            return new Response(JSON.stringify({
                error: 'Muitas solicitações em pouco tempo. Por favor, aguarde um minuto.',
                code: 'RATE_LIMIT_EXCEEDED'
            }), {
                status: 429,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            })
        }

        // 2. Log usage immediately (pre-check)
        await supabase.from('api_usage_logs').insert({
            user_id: user.id,
            endpoint: 'chat'
        })

        const { messages, debug } = await req.json()

        const systemPrompt = `Você é o Lifetrek Content Orchestrator.
REGRAS DE SEGURANÇA E CUSTO:
1. NÃO dispare jobs ou gere mídias.
2. Seja conciso para economizar tokens.
3. Se detectado comportamento de loop, interrompa a resposta.`

        // OpenRouter Request
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                "HTTP-Referer": "https://lifetrek.app", // Optional
                "X-Title": "Lifetrek App", // Optional
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: DEFAULT_MODEL,
                messages: [
                    { role: "system", content: systemPrompt },
                    ...messages.map((m: any) => ({
                        role: m.role === 'assistant' ? 'assistant' : 'user',
                        content: m.content
                    }))
                ],
                temperature: 0.7,
                max_tokens: 1024,
            })
        });

        if (!openRouterResponse.ok) {
            const errorText = await openRouterResponse.text()
            console.error("OpenRouter API Error:", errorText)
            throw new Error(`OpenRouter Error: ${openRouterResponse.status} - ${errorText}`)
        }

        const data = await openRouterResponse.json()
        const responseText = data.choices?.[0]?.message?.content || "Sem resposta do modelo."

        return new Response(JSON.stringify({ text: responseText }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error: any) {
        console.error('Error in chat function:', error)
        // Check specifically for rate limits or auth errors from upstream to pass correct status
        const status = error.message?.includes("429") ? 429 : 500;

        return new Response(JSON.stringify({
            error: error.message,
            details: error.toString()
        }), {
            status: status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
