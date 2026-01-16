import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import * as dotenv from 'https://deno.land/x/dotenv/mod.ts';

// Load environment variables
dotenv.config({ path: './supabase/functions/.env', export: true });

const SUPABASE_URL = "https://dlflpvmdzkeouhgqwqba.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase environment variables');
    Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function main() {
    const { data: jobs, error } = await supabase
        .from('jobs')
        .select('id, job_type, status, error, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

    if (error) {
        console.error('Error fetching jobs:', error.message);
    } else {
        console.table(jobs);
    }
}

main();
