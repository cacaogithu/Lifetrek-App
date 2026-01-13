
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

// Assets
const LOGO_PATH = path.resolve(process.cwd(), 'src/assets/logo.png');
const ASSETS_DIR = path.resolve(process.cwd(), 'src/assets/facility');

// Layout Constants
const WIDTH = 1080;
const HEIGHT = 1080;

// Slides Configuration
const SLIDES = [
    {
        id: 'quem-somos',
        asset: 'exterior.jpg',
        headline: 'QUEM SOMOS',
        subhead: 'Nossa trajetória no Brasil iniciou-se com a aquisição de uma empresa com 30+ anos.',
        body: 'Trajetória sólida e compromisso com o Brasil.', // Extra detail if needed
        type: 'intro'
    },
    {
        id: 'missao',
        asset: 'cleanroom.jpg',
        headline: 'MISSÃO',
        subhead: 'Ser líder na manufatura de produtos de alta performance e qualidade.',
        body: 'Tecnologia de ponta, ética e compromisso absoluto com a vida.',
        type: 'content'
    },
    {
        id: 'stats',
        asset: 'reception.jpg',
        headline: 'EXCELÊNCIA',
        subhead: '30+ Anos de Experiência. Certificação ISO 13485.',
        body: 'Padrões de qualidade com o comprometimento de todos.',
        type: 'stats'
    },
    {
        id: 'visao',
        asset: 'factory-exterior-hero.webp',
        headline: 'VISÃO',
        subhead: 'Referência global em inovação, precisão e ética na área médica.',
        body: 'Contribuindo para a evolução contínua da saúde.',
        type: 'outro'
    }
];

// Helper function for smart text wrapping at word boundaries
function wrapText(text: string, maxCharsPerLine: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
}

async function generateSlide(slide: any, index: number) {
    console.log(`🎨 Generating Slide ${index + 1}: ${slide.headline}`);

    const assetPath = path.resolve(ASSETS_DIR, slide.asset);
    if (!fs.existsSync(assetPath)) {
        console.error(`❌ Asset not found: ${slide.asset}`);
        return null;
    }

    // 1. Load and Resize Original Image (Full Cover)
    const baseImage = await sharp(assetPath)
        .resize(WIDTH, HEIGHT, { fit: 'cover', position: 'center' })
        .toBuffer();

    // 2. Load Logo
    let logoBuffer;
    if (fs.existsSync(LOGO_PATH)) {
        logoBuffer = await sharp(LOGO_PATH).resize({ height: 60 }).toBuffer();
    }

    // 3. Create Smart Gradient Overlay
    // Stronger gradient with +10% opacity for better text contrast
    const gradientSvg = `
    <svg width="${WIDTH}" height="${HEIGHT}">
      <defs>
        <linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="25%" style="stop-color:#004F8F;stop-opacity:0" />
          <stop offset="55%" style="stop-color:#004F8F;stop-opacity:0.4" />
          <stop offset="100%" style="stop-color:#004F8F;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#textGrad)" />
    </svg>`;

    // 4. Create Text Overlay - LARGER text with SMART wrapping
    // Alternate text position: even slides at bottom, odd slides at top
    const isBottomText = index % 2 === 0;

    // Wrap text at word boundaries
    const headlineLines = wrapText(slide.headline, 20);
    const subheadLines = wrapText(slide.subhead, 50);

    // Calculate positions based on placement
    const headlineY = isBottomText ? 800 : 200;
    const accentY = isBottomText ? 850 : 250;
    const subheadY = isBottomText ? 930 : 330;
    const logoY = isBottomText ? 40 : 950;

    // Build headline tspans
    const headlineTspans = headlineLines.map((line, i) =>
        i === 0
            ? `<tspan x="540" dy="0">${line}</tspan>`
            : `<tspan x="540" dy="1.1em">${line}</tspan>`
    ).join('\n        ');

    // Build subhead tspans
    const subheadTspans = subheadLines.slice(0, 2).map((line, i) =>
        i === 0
            ? `<tspan x="540" dy="0">${line}</tspan>`
            : `<tspan x="540" dy="1.4em">${line}</tspan>`
    ).join('\n        ');

    const overlaySvg = `
    <svg width="${WIDTH}" height="${HEIGHT}">
      <style>
        .headline { 
          fill: white; 
          font-family: Arial, sans-serif; 
          font-weight: 900; 
          font-size: 95px; 
          text-anchor: middle; 
          text-transform: uppercase; 
          filter: drop-shadow(0px 4px 12px rgba(0,0,0,0.7)); 
        }
        .subhead { 
          fill: #ffffff; 
          font-family: Arial, sans-serif; 
          font-weight: 500; 
          font-size: 38px; 
          text-anchor: middle; 
          filter: drop-shadow(0px 3px 6px rgba(0,0,0,0.5));
        }
        .accent { fill: #1A7A3E; }
      </style>
      
      <!-- Headline -->
      <text x="540" y="${headlineY}" class="headline">
        ${headlineTspans}
      </text>
      
      <!-- Green Accent Line -->
      <rect x="300" y="${accentY}" width="480" height="5" class="accent" />
      
      <!-- Subheadline -->
      <text x="540" y="${subheadY}" class="subhead">
        ${subheadTspans}
      </text>
    </svg>
    `;

    // 5. Composite All Layers
    const composites: any[] = [
        { input: Buffer.from(gradientSvg), top: 0, left: 0 },
        { input: Buffer.from(overlaySvg), top: 0, left: 0 }
    ];

    // Logo positioned dynamically based on text placement
    if (logoBuffer) {
        const logoMetadata = await sharp(logoBuffer).metadata();
        const logoLeft = WIDTH - (logoMetadata.width || 0) - 40;
        const logoTop = logoY;
        composites.push({ input: logoBuffer, top: logoTop, left: logoLeft });
    }

    const outputBuffer = await sharp(baseImage)
        .composite(composites)
        .toBuffer();

    const outPath = path.resolve(process.cwd(), `slide_${index + 1}.png`);
    fs.writeFileSync(outPath, outputBuffer);
    console.log(`✅ Saved ${outPath}`);

    return `data:image/png;base64,${outputBuffer.toString('base64')}`;
}

async function run() {
    console.log("🚀 Starting Multi-Slide Generation...");
    const imageUrls = [];

    for (let i = 0; i < SLIDES.length; i++) {
        const b64 = await generateSlide(SLIDES[i], i);
        if (b64) imageUrls.push(b64);
    }

    if (imageUrls.length === 0) {
        console.error("❌ No images generated.");
        return;
    }

    // Save to DB
    const { data: userData } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    const userId = userData?.users[0]?.id;

    const dbPayload = {
        admin_user_id: userId,
        topic: "Quem Somos - Lifetrek Medical",
        target_audience: "Public",
        format: "carousel",
        slides: SLIDES,
        image_urls: imageUrls,
        caption: "Quem Somos: Uma trajetória de excelência e compromisso com a vida.\n\nNossa missão é ser líder na manufatura de produtos de alta performance, aliando tecnologia de ponta, inovação e ética.\n\n#LifetrekMedical #QuemSomos #Missão #Visão #MedTech #ISO13485",
        // status: 'draft', // Removed cause missing in DB
        generation_settings: { model: 'local-composited-multi', note: 'Smart Resize + PT Text' }
    };

    const { data, error } = await supabase.from('linkedin_carousels').insert(dbPayload).select();

    if (error) {
        console.error("❌ DB Insert Failed:", error);
    } else {
        console.log(`✅ Carousel Saved! ID: ${data[0].id}`);
    }
}

run();
