import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: policies, error } = await supabase.rpc('get_policies', { table_name: 'jobs' });

    // If RPC fails (likely), try another way or just query pg_policies
    const { data: pgPolicies } = await supabase.from('pg_policies').select('*').eq('tablename', 'jobs');

    // Also check current user
    const authHeader = req.headers.get("Authorization");
    let currentUser = "none";
    if (authHeader) {
        const { data: { user } } = await supabase.auth.getUser(authHeader.replace("Bearer ", ""));
        currentUser = user?.id || "not found";
    }

    return new Response(JSON.stringify({ pgPolicies, currentUser }), {
        headers: { "Content-Type": "application/json" }
    });
});
