
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPosts() {
  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, status')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (error) {
    console.error(error);
    process.exit(1);
  }
  
  console.log(JSON.stringify(data, null, 2));
}

checkPosts();
