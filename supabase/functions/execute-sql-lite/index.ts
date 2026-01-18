import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Set all processing or pending jobs to 'failed' or 'stopped' to stop workers
    const { error } = await supabase
        .from('jobs')
        .update({ status: 'failed', error: 'Stopped by user request' })
        .in('status', ['pending', 'processing']);

    return new Response(JSON.stringify({
        success: !error,
        error
    }), {
        headers: { "Content-Type": "application/json" }
    });
});
