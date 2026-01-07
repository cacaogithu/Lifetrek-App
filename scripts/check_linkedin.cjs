
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkLinkedIn() {
  const { data, error } = await supabase
    .from('linkedin_carousels')
    .select('id, topic, status, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error(error);
    process.exit(1);
  }
  
  console.log(JSON.stringify(data, null, 2));
}

checkLinkedIn();
