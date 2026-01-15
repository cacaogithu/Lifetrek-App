
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envVars: any = {};
if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) envVars[match[1].trim()] = match[2].trim().replace(/^['"]|['"]$/g, '');
    });
}

const supabase = createClient(envVars.SUPABASE_URL, envVars.SUPABASE_SERVICE_ROLE_KEY);

async function listBuckets() {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
        console.error("❌ Error listing buckets:", error);
    } else {
        console.log("✅ Buckets:", data.map(b => b.name));
    }
}

listBuckets();
