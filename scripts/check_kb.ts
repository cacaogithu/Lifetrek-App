// scripts/check_kb.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from supabase/functions/.env
dotenv.config({ path: path.resolve(process.cwd(), 'supabase', 'functions', '.env') });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Supabase URL or Service Role Key is not set in supabase/functions/.env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
        persistSession: false // Do not persist session for service role
    }
});

async function checkKnowledgeBaseSchemaAndCount() {
    console.log("Attempting to connect to Supabase and inspect 'knowledge_base' table...");

    try {
        // 1. Check if 'knowledge_base' table exists
        const { data: tableExists, error: tableError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'knowledge_base');

        if (tableError) {
            console.error("Error checking for table existence:", tableError);
            return;
        }

        if (!tableExists || tableExists.length === 0) {
            console.warn("Table 'knowledge_base' does not exist in the public schema.");
            return;
        }

        console.log("Table 'knowledge_base' exists. Fetching schema...");

        // 2. Fetch schema of 'knowledge_base' table
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, udt_name')
            .eq('table_schema', 'public')
            .eq('table_name', 'knowledge_base')
            .order('ordinal_position', { ascending: true });

        if (columnsError) {
            console.error("Error fetching table schema:", columnsError);
            return;
        }

        if (columns && columns.length > 0) {
            console.log("\nSchema for 'knowledge_base' table:");
            columns.forEach(col => {
                console.log(`- ${col.column_name}: ${col.data_type} (${col.udt_name})`);
            });
        } else {
            console.log("Could not retrieve schema for 'knowledge_base' (table might be empty or permissions issues).");
        }

        // 3. Get row count and first row of 'knowledge_base'
        console.log("\nAttempting to fetch row count and a sample record from 'knowledge_base'...");
        const { data, error, count } = await supabase
            .from("knowledge_base")
            .select("*", { count: 'exact' })
            .limit(1); // Fetch only one record for a sample

        if (error) {
            console.error("Error fetching data from 'knowledge_base':", error);
        } else {
            console.log(`Found ${count} items in 'knowledge_base'.`);
            if (data && data.length > 0) {
                console.log("First item:", data[0]);
            } else {
                console.log("Table 'knowledge_base' is empty.");
            }
        }

    } catch (error) {
        console.error("An unexpected error occurred:", error);
    }
}

checkKnowledgeBaseSchemaAndCount();