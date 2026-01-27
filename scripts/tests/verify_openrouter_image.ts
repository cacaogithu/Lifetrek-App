
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

async function verifyOpenRouterImage() {
    console.log("🚀 Testing OpenRouter Image Generation...");

    const payload = {
        topic: "OpenRouter Image Test",
        targetAudience: "Developers",
        format: "single-image",
        profileType: "company",
        researchLevel: "none",
        slides: [{
            type: 'content',
            headline: 'OpenRouter / FLUX Test',
            body: 'Testing FLUX generation via OpenRouter.'
        }]
    };

    const { data, error } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: payload
    });

    if (error) {
        console.error("❌ Edge Function Failed:");
        console.error("Status:", error.status);
        console.error("Message:", error.message);
        if (error.context) {
            try {
                const text = await error.context.text();
                console.error("Context:", text);
            } catch (e) {
                console.error("Could not read context:", e);
            }
        }
    } else {
        // Check if it's actually a debug error disguised as success
        if (data?.is_debug_error) {
            console.error("❌ Function returned debug error:");
            console.error("Error:", data.error);
            console.error("Stack:", data.stack);
        } else if (data?.carousel?.imageUrls?.[0]) {
            console.log("✅ OpenRouter Success! Image generated.");
            console.log("Image URL:", data.carousel.imageUrls[0]);
            console.log("Quality Score:", data.metadata?.quality_score);
        } else {
            console.log("❌ No image returned.");
            console.log(JSON.stringify(data, null, 2));
        }
    }
}

verifyOpenRouterImage();
