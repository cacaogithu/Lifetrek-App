
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testContactForm() {
  console.log('🚀 Starting Contact Form Test...');

  const testPayload = {
    name: "Test User Automated",
    email: "test_automation@lifetrek-medical.com",
    phone: "+5511999999999",
    projectTypes: ["medical_devices"],
    technicalRequirements: "This is a specialized test to verify database insertion and email trigger.",
    message: "Automated verification test."
  };

  console.log('1️⃣  Invoking send-contact-email function...');
  
  const { data: funcData, error: funcError } = await supabase.functions.invoke('send-contact-email', {
    body: testPayload
  });

  if (funcError) {
    console.error('❌ Function Invocation Failed:', funcError);
    if (funcError && funcError instanceof Error && 'context' in funcError) {
        // @ts-ignore
        const context = funcError.context;
        if (context && typeof context.text === 'function') {
            try {
                const text = await context.text();
                console.error('📜 Error Body:', text);
            } catch (e) {
                console.error('Could not read error body');
            }
        }
    }
  } else {
    console.log('✅ Function returned success:', funcData);
  }

  console.log('2️⃣  Checking contact_leads table for the new record...');
  
  // Checking database
  const { data: leads, error: dbError } = await supabase
    .from('contact_leads')
    .select('*')
    .eq('email', testPayload.email)
    .order('created_at', { ascending: false })
    .limit(1);

  if (dbError) {
    console.error('❌ Database Query Failed:', dbError);
    return;
  }

  if (leads && leads.length > 0) {
    const lead = leads[0];
    console.log('🎉 SUCCESS! Record found in database:');
    console.log(`   - ID: ${lead.id}`);
    console.log(`   - Name: ${lead.name}`);
    console.log(`   - Created At: ${lead.created_at}`);
    console.log('   - Status: Verified ✅');
  } else {
    console.error('❌ FAILURE: Function ran but no record found in "contact_leads" table.');
  }
}

testContactForm();
