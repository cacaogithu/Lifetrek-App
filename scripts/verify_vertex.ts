
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

async function verifyVertex() {
    console.log("🚀 Testing Vertex AI Integration...");

    const payload = {
        topic: "Vertex AI Test",
        targetAudience: "Developers",
        format: "single-image",
        profileType: "company",
        slides: [{
            type: 'content',
            headline: 'Vertex AI Test',
            body: 'Testing Imagen 3.0 generation capability.'
        }]
    };

    const { data, error } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: payload
    });

    if (error) {
        console.error("❌ Edge Function Failed:", error);
        return;
    }

    const imgUrl = data?.carousel?.imageUrls?.[0];
    if (imgUrl && imgUrl.startsWith('data:image')) {
        console.log("✅ Vertex AI Success! Image generated.");
        console.log(`Image URL Length: ${imgUrl.length} chars`);

        // Save to verify visually
        const buffer = Buffer.from(imgUrl.split(',')[1], 'base64');
        fs.writeFileSync('test_vertex_image.png', buffer);
        console.log("✅ Saved to test_vertex_image.png");
    } else {
        console.error("❌ No image returned (Vertex failed inside function?).", data);
    }
}

verifyVertex();
