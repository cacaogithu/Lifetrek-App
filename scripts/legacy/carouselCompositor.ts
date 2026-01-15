import { createClient } from '@supabase/supabase-js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Load env
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
const LOGO_PATH = path.resolve(process.cwd(), 'src/assets/logo.png');

interface CompositeParams {
    imageSource: 'upload' | 'ai-generated';
    imageUrl?: string;
    aiPrompt?: string;
    text: {
        headline: string;
        subhead: string;
        position: 'top' | 'bottom' | 'auto';
    };
    style?: {
        primaryColor: string;
        accentColor: string;
    };
}

/**
 * Client-side carousel compositing utility
 * Calls Edge Function for overlay generation, then composites locally with sharp
 */
export async function compositeCarouselImage(params: CompositeParams): Promise<Buffer> {
    // 1. Call Edge Function to get overlays
    const { data, error } = await supabase.functions.invoke('composite-carousel-image', {
        body: params
    });

    if (error || !data) {
        throw new Error(`Edge Function failed: ${error?.message || 'No data returned'}`);
    }

    const { baseImage, overlays, logoPosition } = data;

    // 2. Load base image
    const baseBuffer = Buffer.from(baseImage.replace(/^data:image\/\w+;base64,/, ''), 'base64');

    // 3. Load overlays
    const gradientBuffer = Buffer.from(overlays.gradient.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64');
    const textBuffer = Buffer.from(overlays.text.replace(/^data:image\/svg\+xml;base64,/, ''), 'base64');

    // 4. Load logo
    const logoBuffer = await sharp(LOGO_PATH).resize({ height: 60 }).toBuffer();

    // 5. Composite all layers
    const composites = [
        { input: gradientBuffer, top: 0, left: 0 },
        { input: textBuffer, top: 0, left: 0 },
        { input: logoBuffer, top: logoPosition.y, left: logoPosition.x }
    ];

    return await sharp(baseBuffer)
        .resize(1080, 1080, { fit: 'cover' })
        .composite(composites)
        .png()
        .toBuffer();
}

/**
 * Test function - generate a sample carousel image
 */
export async function testComposite() {
    console.log('🚀 Testing carousel compositing...');

    // Test with AI generation
    const result = await compositeCarouselImage({
        imageSource: 'ai-generated',
        aiPrompt: 'Modern medical manufacturing cleanroom with precision equipment',
        text: {
            headline: 'INOVAÇÃO MÉDICA',
            subhead: 'Tecnologia de ponta para a saúde do futuro',
            position: 'bottom'
        }
    });

    const outputPath = path.resolve(process.cwd(), 'test_composite_output.png');
    fs.writeFileSync(outputPath, result);
    console.log(`✅ Test image saved to: ${outputPath}`);
}

// Run test if executed directly
if (import.meta.main) {
    testComposite().catch(console.error);
}
