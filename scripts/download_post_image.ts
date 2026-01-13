
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
const POST_ID = '62b7ef53-8198-47d1-96b8-49e538ab7e78';

async function downloadImage() {
    console.log(`Fetching post ${POST_ID}...`);
    const { data, error } = await supabase
        .from('linkedin_carousels')
        .select('*')
        .eq('id', POST_ID)
        .single();

    if (error) {
        console.error("❌ Error fetching post:", error);
        return;
    }

    const imageUrl = data.image_urls?.[0];
    if (!imageUrl || !imageUrl.startsWith('data:image')) {
        console.error("❌ No valid Base64 image found in this post.");
        return;
    }

    // Extract Base64 part
    const base64Data = imageUrl.split(';base64,').pop();

    if (base64Data) {
        const filePath = path.resolve(process.cwd(), 'generated_post_image.png');
        fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });
        console.log(`✅ Image saved to: ${filePath}`);
    }
}

downloadImage();
