import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const RATE_LIMIT_WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20
const OPEN_ROUTER_API = Deno.env.get("OPEN_ROUTER_API");
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
Você ajuda Rafael e Vanessa a planejar o marketing da Lifetrek (manufatura de produtos médicos).

FOCO ATUAL (Janeiro 2026):
- Destaque total para a SALA LIMPA (ISO 7) - montagem, kitting, segurança.
- Público-alvo: PMEs (Pequenas e Médias Empresas) que buscam terceirização (outsourcing).
- Lead Magnets aprovados: Checklist DFM, Auditoria ISO 13485, Guia de Metrologia e Guia de Sala Limpa.

REGRAS DE SEGURANÇA E CUSTO:
1. NÃO dispare jobs ou gere mídias diretamente.
2. Seja conciso e use texto limpo (evite excesso de markdown se possível).
3. Se detectado comportamento de loop, interrompa a resposta.`

        // OpenRouter Request
        const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${OPEN_ROUTER_API}`,
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

        // Differentiate between rate limits, auth errors, and general errors
        let status = 500;
        let message = error.message || 'Erro interno no servidor.';

        if (message.includes("429") || error.code === 'RATE_LIMIT_EXCEEDED') {
            status = 429;
        } else if (message.includes("OpenRouter Error")) {
            status = 400; // Client-side error (likely config or quota)
            message = `Erro na API de IA: ${message}`;
        } else if (message.includes("Unauthorized") || status === 401) {
            status = 401;
        }

        return new Response(JSON.stringify({
            error: message,
            status: status
        }), {
            status: status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
    }
})
