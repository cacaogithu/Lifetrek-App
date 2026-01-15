
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
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes
            if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
            if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
            envVars[key] = value;
        }
    });
}

const SUPABASE_URL = envVars.SUPABASE_URL;
const SUPABASE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.log("❌ Missing Supabase Credentials in .env");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function checkSchema() {
    console.log("Probing DB for 'status' column...");

    // Try to select the 'status' column.
    const { data, error } = await supabase
        .from("linkedin_carousels")
        .select("status")
        .limit(1);

    if (error) {
        console.error("❌ DB Check Failed:", JSON.stringify(error, null, 2));
        if (error.message.includes("does not exist")) {
            console.log("👉 CONCLUSION: The 'status' column is MISSING.");
        }
    } else {
        console.log("✅ DB Check Passed: 'status' column exists.");
    }
}

checkSchema();
