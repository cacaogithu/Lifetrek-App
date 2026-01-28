
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import "jsr:@std/dotenv/load";

const SUPABASE_URL = Deno.env.get("VITE_SUPABASE_URL");
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error("Missing credentials");
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function check() {
    console.log("--- Checking has_role RPC ---");

    // 1. Get a user ID (any admin user ID)
    const { data: users, error: err1 } = await supabase.auth.admin.listUsers();
    if (err1) {
        console.error("Error listing users:", err1);
        return;
    }

    const testUser = users.users[0];
    if (!testUser) {
        console.error("No users found to test with.");
        return;
    }

    console.log(`Testing with user: ${testUser.email} (${testUser.id})`);

    // 2. Call RPC as super admin (service role)
    // Note: RPC usually uses auth.uid(), so calling it via service role might not work as expected
    // UNLESS we impersonate or if the function takes p_uid argument (which my has_role does!)

    const { data: hasRole, error: rpcError } = await supabase
        .rpc('has_role', {
            p_uid: testUser.id,
            p_role: 'admin'
        });

    if (rpcError) {
        console.error("RPC Error:", rpcError);
    } else {
        console.log(`has_role result for ${testUser.email}:`, hasRole);
    }

    // 3. Verify underlying data manually
    const { data: adminEntry } = await supabase.from('admin_users').select('*').eq('user_id', testUser.id).maybeSingle();
    const { data: permEntry } = await supabase.from('admin_permissions').select('*').eq('email', testUser.email).maybeSingle();

    console.log("Manual check:");
    console.log("- admin_users:", adminEntry);
    console.log("- admin_permissions:", permEntry);
}

check();
