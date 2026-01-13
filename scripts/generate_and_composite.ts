
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Load Env Vars
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
const OUT_PATH = path.resolve(process.cwd(), 'composited_post.png');

// Text Constants (Brand Book)
// Text Constants (Brand Book)
const TEXT_COLOR = '#FFFFFF';
const ACCENT_COLOR = '#004F8F'; // Corporate Blue

// Override with REAL Asset Path
const REAL_ASSET_PATH = path.resolve(process.cwd(), 'src/assets/facility/exterior.jpg');

async function generateAndComposite() {
    console.log("🚀 Starting Composited Generation (Real Asset + PT-BR)...");

    let base64Bg = "";

    // CHECK FOR REAL ASSET FIRST
    if (fs.existsSync(REAL_ASSET_PATH)) {
        console.log(`✅ Using Real Asset: ${REAL_ASSET_PATH}`);
        const assetBuffer = fs.readFileSync(REAL_ASSET_PATH);
        base64Bg = `data:image/jpeg;base64,${assetBuffer.toString('base64')}`;
    } else {
        console.warn("⚠️ Real asset not found. Falling back to Vertex AI (Simulated)...");
    }

    if (!base64Bg) {
        // Fallback logic could go here, but for this task we expect the asset to exist.
        // If not, we failed.
        console.error("❌ No image source available.");
        return;
    }

    const bgBuffer = Buffer.from(base64Bg.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    console.log("✅ Background Ready. Compositing...");

    // 4. Composite using Sharp
    let logoBuffer;
    if (fs.existsSync(LOGO_PATH)) {
        logoBuffer = await sharp(LOGO_PATH).resize({ height: 60 }).toBuffer();
    }

    const WIDTH = 1080;
    const HEIGHT = 1080;

    const gradientSvg = `
  <svg width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="40%" style="stop-color:#004F8F;stop-opacity:0" />
        <stop offset="100%" style="stop-color:#002b4d;stop-opacity:0.95" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#grad1)" />
  </svg>`;

    // Portuguese Text Overlay
    const overlaySvg = `
  <svg width="${WIDTH}" height="${HEIGHT}">
    <style>
      .headline { fill: white; font-family: Arial, sans-serif; font-weight: 800; font-size: 90px; text-anchor: middle; text-transform: uppercase; filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.5)); }
      .subhead { fill: #e0e0e0; font-family: Arial, sans-serif; font-weight: 500; font-size: 32px; text-anchor: middle; }
      .accent { fill: #1A7A3E; }
    </style>
    
    <text x="540" y="750" class="headline">CHEGAMOS</text>
    <rect x="340" y="790" width="400" height="6" class="accent" />
    <text x="540" y="850" class="subhead">A Lifetrek Medical expande com nova fábrica de 5.000m².</text>
    <rect x="750" y="920" width="300" height="120" rx="15" fill="white" />
  </svg>
  `;

    const composites: any[] = [
        { input: Buffer.from(gradientSvg), top: 0, left: 0 },
        { input: Buffer.from(overlaySvg), top: 0, left: 0 }
    ];

    if (logoBuffer) {
        const logoMetadata = await sharp(logoBuffer).metadata();
        const logoWidth = logoMetadata.width || 0;
        const logoHeight = logoMetadata.height || 0;
        const logoLeft = Math.floor(900 - (logoWidth / 2));
        const logoTop = Math.floor(980 - (logoHeight / 2));
        composites.push({ input: logoBuffer, top: logoTop, left: logoLeft });
    }

    // Resize BG to Cover 1080x1080
    let compositor = sharp(bgBuffer).resize(WIDTH, HEIGHT, { fit: 'cover' });

    await compositor.composite(composites).toFile(OUT_PATH);
    console.log(`✅ Final Image Saved to: ${OUT_PATH}`);

    const finalBuffer = await sharp(OUT_PATH).toBuffer();
    const finalBase64 = `data:image/png;base64,${finalBuffer.toString('base64')}`;

    const { data: userData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    const userId = userData?.users[0]?.id;

    // Use dummy payload for slides if needed, just to satisfy JSON structure
    const slidesPayload = [{ type: 'content', headline: 'CHEGAMOS', body: 'Fábrica de 5.000m²' }];

    const dbPayload = {
        admin_user_id: userId,
        topic: "Lifetrek Medical Launch (Real Asset + PT)",
        target_audience: "OEMs",
        format: "single-image",
        slides: slidesPayload,
        image_urls: [finalBase64],
        caption: "Chegamos. A Lifetrek Medical tem o prazer de anunciar nossa nova fábrica de 5.000m². Mais capacidade, mais precisão, mesma qualidade.\n\n#LifetrekMedical #Manufatura #Expansão #DispositivosMedicos", // Portuguese Caption
        status: 'draft',
        generation_settings: { model: 'real-asset-composited', note: 'Local Asset: exterior.jpg' }
    };

    // Remove missing columns if needed (status is draft) - wait, user might not have run migration.
    // We'll try to insert. If it fails on 'status', we'll remove it.

    // Delete status from payload just in case
    delete (dbPayload as any).status;

    const { data: savedData, error: dbError } = await supabase
        .from('linkedin_carousels')
        .insert(dbPayload)
        .select();

    if (dbError) {
        console.error("❌ DB Save Failed:", dbError);
    } else {
        console.log(`✅ Saved to DB! ID: ${savedData[0].id}`);
    }
}

generateAndComposite();
