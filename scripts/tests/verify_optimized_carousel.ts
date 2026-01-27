
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

async function verifyOptimizedCarousel() {
    console.log("🚀 Testing Optimized Carousel Generation (Selective Visualization)...");

    const payload = {
        topic: "The Future of Precision CNC in Medical Device Manufacturing",
        targetAudience: "Engineering Managers",
        format: "carousel",
        profileType: "company",
        researchLevel: "none", // Skip research to save time/cost
    };

    console.log("Invoking generate-linkedin-carousel...");
    const { data, error } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: payload
    });

    if (error) {
        console.error("❌ Edge Function Failed:", error);
        return;
    }

    console.log("✅ Function returned result.");
    const carousel = data.carousel;
    const assets = data.assets || [];

    console.log(`Carousel for topic: ${carousel.topic}`);
    console.log(`Slide count: ${carousel.slides?.length}`);

    if (carousel.slides) {
        carousel.slides.forEach((slide: any, i: number) => {
            const assetForSlide = assets.find((a: any) => a.slide_index === i);
            const source = assetForSlide?.asset_source || 'unknown';
            const hasUrl = !!assetForSlide?.image_url;
            console.log(`Slide ${i + 1} (${slide.type}): Visual Source = ${source} (URL present: ${hasUrl})`);
        });

        // Verification logic
        const aiGeneratedCount = assets.filter((a: any) => a.asset_source === 'ai-generated').length;
        const textOnlyCount = assets.filter((a: any) => a.asset_source === 'text-only').length;

        console.log(`\nSummary:`);
        console.log(`- AI Generated Visuals: ${aiGeneratedCount}`);
        console.log(`- Text-only Visuals: ${textOnlyCount}`);

        if (textOnlyCount > 0) {
            console.log("✅ Success! Selective visualization is working (some slides are text-only).");
        } else {
            console.warn("⚠️ Warning: No text-only slides found. Check if logic is working as expected.");
        }
    }
}

verifyOptimizedCarousel();
