
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

async function verifyTest() {
    console.log("🚀 Testing Minimal OpenRouter Function...");

    const { data, error } = await supabase.functions.invoke('test-openrouter');

    if (error) {
        console.error("❌ Test Failed:", error);
        if (error.context) {
            try {
                const text = await error.context.text();
                console.error("Context:", text);
            } catch (e) { }
        }
    } else {
        console.log("✅ Test Success:", JSON.stringify(data, null, 2));
    }
}

verifyTest();
