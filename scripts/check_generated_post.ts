
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Manual .env parser
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

async function checkPost() {
    const { data, error } = await supabase
        .from('linkedin_carousels')
        .select('*')
        .eq('id', '62b7ef53-8198-47d1-96b8-49e538ab7e78')
        .single();

    if (error) {
        console.error("❌ Error fetching post:", error);
    } else {
        console.log("✅ Post Found!");
        console.log("- ID:", data.id);
        console.log("- Topic:", data.topic);
        console.log("- Images:", data.image_urls?.length || 0);
        console.log("- First Image:", data.image_urls?.[0]);
    }
}

checkPost();
