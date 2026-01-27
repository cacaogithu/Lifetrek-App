
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load Env
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

async function verifyPing() {
    console.log("🚀 Testing Ping...");

    const { data, error } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: { debug_ping: true }
    });

    if (error) {
        console.error("❌ Ping Failed:", error);
        if (error.context) {
            try {
                const text = await error.context.text();
                console.error("Context:", text);
            } catch (e) { }
        }
    } else {
        console.log("✅ Ping Success:", JSON.stringify(data));
    }
}

verifyPing();
