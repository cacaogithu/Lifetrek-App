import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { table } = await req.json();

    // Query information_schema
    const { data: columns, error } = await supabase
        .from('pg_attribute')
        .select('attname, atttypid:pg_type(typname)')
        .eq('attrelid', `public.${table}`.replace('public.', '')) // This might be tricky via standard client

    // Better: use raw SQL via a known RPC or just try to guess?
    // Actually, I'll use the 'inspect_table' RPC if its available, or try to run it via execute-sql-lite

    // Latest attempt: use the REST API with a specific query that might work
    const { data: infoSchema } = await supabase.from('_columns').select('*').eq('table_name', table); // Supabase specific hidden table? No.

    // Let's try to just select 1 row and check keys again, but I'll insert a dummy row and delete it?
    // No, that's risky.

    // I'll try to query the REST API's /rest/v1/?apikey=... to see definitions

    return new Response(JSON.stringify({
        error,
        columns
    }), {
        headers: { "Content-Type": "application/json" }
    });
});
