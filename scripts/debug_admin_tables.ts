
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
    console.log("--- Checking Admin Tables ---");

    const { data: adminUsers, error: err1 } = await supabase.from('admin_users').select('*');
    if (err1) console.error("Error fetching admin_users:", err1);
    else console.log(`admin_users count: ${adminUsers?.length}`, adminUsers);

    const { data: adminPerms, error: err2 } = await supabase.from('admin_permissions').select('*');
    if (err2) console.error("Error fetching admin_permissions:", err2);
    else console.log(`admin_permissions count: ${adminPerms?.length}`, adminPerms);

    console.log("\n--- Checking Auth Users ---");
    const { data: { users }, error: err3 } = await supabase.auth.admin.listUsers();
    if (err3) console.error("Error listing users:", err3);
    else {
        console.log(`Auth users found: ${users.length}`);
        users.forEach(u => {
            console.log(`ID: ${u.id}, Email: ${u.email}`);

            // Check cross-reference
            const inAdminUsers = adminUsers?.find(au => au.user_id === u.id);
            const inAdminPerms = adminPerms?.find(ap => ap.email === u.email);

            console.log(`  -> In admin_users? ${!!inAdminUsers}`);
            console.log(`  -> In admin_permissions? ${!!inAdminPerms}`);
        });
    }
}

check();
