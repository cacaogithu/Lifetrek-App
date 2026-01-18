import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: jobs } = await supabase.from('jobs').select('*').order('created_at', { ascending: false }).limit(20);
    const { data: carousels } = await supabase.from('linkedin_carousels').select('id, topic, status, created_at').order('created_at', { ascending: false }).limit(10);
    const { data: blogs } = await supabase.from('blog_posts').select('id, title, status, created_at').order('created_at', { ascending: false }).limit(10);

    return new Response(JSON.stringify({ jobs, carousels, blogs }), {
        headers: { "Content-Type": "application/json" }
    });
});
