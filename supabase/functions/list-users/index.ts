import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: users } = await supabase.auth.admin.listUsers();
    const { data: admin_permissions } = await supabase.from('admin_permissions').select('*');
    const { data: admin_users } = await supabase.from('admin_users').select('*');

    return new Response(JSON.stringify({ users: users?.users?.map(u => ({ id: u.id, email: u.email })), admin_permissions, admin_users }), {
        headers: { "Content-Type": "application/json" }
    });
});
