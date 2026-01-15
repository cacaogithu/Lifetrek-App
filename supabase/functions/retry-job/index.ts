
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { job_id } = await req.json()

        if (!job_id) {
            return new Response(JSON.stringify({ error: 'job_id is required' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Create client with the user's Auth context
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Get original job
        const { data: original, error: fetchError } = await supabaseClient
            .from('jobs')
            .select('*')
            .eq('id', job_id)
            .single()

        if (fetchError || !original) {
            return new Response(JSON.stringify({ error: 'Job not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }

        if (original.status !== 'failed') {
            return new Response(JSON.stringify({ error: 'Only failed jobs can be retried' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            })
        }

        // Clone it
        const { data: newJob, error: insertError } = await supabaseClient
            .from('jobs')
            .insert({
                job_type: original.job_type,
                payload: original.payload,
                status: 'queued', // Use 'queued' to match default
                user_id: original.user_id, // Ensure ownership is maintained or set to current user if RLS handles it
                // Note: RLS might force user_id to be auth.uid(), so if original.user_id != auth.uid() this might fail or be overwritten. 
                // We rely on service sending auth header. 
            })
            .select()
            .single()

        if (insertError) throw insertError

        return new Response(JSON.stringify({ job_id: newJob.id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unexpected error';
        return new Response(JSON.stringify({ error: message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }
})
