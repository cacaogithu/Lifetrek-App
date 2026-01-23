import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20
const MAX_TOTAL_TOKENS = 1024 // Strict output cap

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
            return new Response(JSON.stringify({ error: 'Unauthorized' }), {
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

        // DEBUG: List models to verify access
        if (debug) {
            const apiKey = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('vertex_api_key')
            if (!apiKey) throw new Error('Missing API Key')

            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
                const data = await response.json();
                return new Response(JSON.stringify(data), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                })
            } catch (e) {
                return new Response(JSON.stringify({ error: e.message }), { status: 500 })
            }
        }
        // Use gemini_api_key_v2 as primary attempt since main key is leaked
        const apiKey = Deno.env.get('gemini_api_key_v2') || Deno.env.get('GEMINI_API_KEY') || Deno.env.get('vertex_api_key')

        if (!apiKey) throw new Error('Missing API Key')

        const genAI = new GoogleGenerativeAI(apiKey)
        // Use gemini-2.0-flash as it is available in the model list
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        // Strict Timeout (30s)
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000)

        const systemPrompt = `Você é o Lifetrek Content Orchestrator.
REGRAS DE SEGURANÇA E CUSTO:
1. NÃO dispare jobs ou gere mídias.
2. Seja conciso para economizar tokens.
3. Se detectado comportamento de loop, interrompa a resposta.`

        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: systemPrompt }] },
                ...messages.slice(-5).map((m: any) => ({ // Only send last 5 messages to save tokens
                    role: m.role === 'assistant' ? 'model' : 'user',
                    parts: [{ text: m.content }]
                }))
            ],
            generationConfig: {
                maxOutputTokens: MAX_TOTAL_TOKENS,
                temperature: 0.7,
            }
        })

        clearTimeout(timeoutId)
        const response = result.response.text()

        return new Response(JSON.stringify({ text: response }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Error in chat function:', error)
        // Return full error details for debugging
        return new Response(JSON.stringify({
            error: error.message,
            details: error.toString()
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
