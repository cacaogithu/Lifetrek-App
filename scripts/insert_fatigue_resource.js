// scripts/insert_fatigue_resource.js
// Run this script with `node scripts/insert_fatigue_resource.js`
// It inserts the Fatigue Validation Guide entry into the `resources` table.

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Supabase URL or ANON key not set in environment variables.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

(async () => {
    // Get a user to associate with the resource (use first admin user if exists)
    const { data: users, error: usersError } = await supabase.from('auth.users').select('id').limit(1);
    if (usersError) {
        console.error('Error fetching users:', usersError);
        process.exit(1);
    }
    const userId = users?.[0]?.id;
    if (!userId) {
        console.error('No user found to associate with the resource.');
        process.exit(1);
    }

    const { data, error } = await supabase.from('resources').insert([
        {
            title: 'Guia de Validação de Fadiga',
            description: 'Fluxograma e checklist para validar a fadiga de implantes médicos.',
            content: '', // content can be empty; the page is rendered separately
            type: 'guide',
            persona: 'engineer',
            thumbnail_url: 'https://example.com/thumbnail-fadiga.png',
            status: 'published',
            slug: 'fatigue-validation-guide',
            metadata: {},
            user_id: userId,
        },
    ]).select();

    if (error) {
        console.error('Error inserting resource:', error);
        process.exit(1);
    }
    console.log('Inserted resource:', data);
})();
