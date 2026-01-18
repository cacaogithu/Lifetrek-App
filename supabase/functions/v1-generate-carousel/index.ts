// V1 Carousel Generator - Template-based compositing with local assets
// This is the "classic" approach using predefined templates and real company photos

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Image, decode } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Brand Constants
const BRAND = {
  primaryBlue: '#004F8F',
  primaryBlueRgb: { r: 0, g: 79, b: 143 },
  accentGreen: '#1A7A3E',
  accentGreenRgb: { r: 26, g: 122, b: 62 },
  accentOrange: '#F07818',
  white: '#FFFFFF',
};

const WIDTH = 1080;
const HEIGHT = 1080;

// Predefined Templates
const TEMPLATES = {
  'quem-somos': {
    name: 'Quem Somos',
    description: 'Company introduction carousel',
    slides: [
      {
        id: 'quem-somos',
        asset: 'exterior.jpg',
        headline: 'QUEM SOMOS',
        subhead: 'Nossa trajetória no Brasil iniciou-se com a aquisição de uma empresa com 30+ anos.',
        type: 'intro'
      },
      {
        id: 'missao',
        asset: 'cleanroom.jpg',
        headline: 'MISSÃO',
        subhead: 'Ser líder na manufatura de produtos de alta performance e qualidade.',
        type: 'content'
      },
      {
        id: 'stats',
        asset: 'reception.jpg',
        headline: 'EXCELÊNCIA',
        subhead: '30+ Anos de Experiência. Certificação ISO 13485.',
        type: 'stats'
      },
      {
        id: 'visao',
        asset: 'cleanroom-hero.webp',
        headline: 'VISÃO',
        subhead: 'Referência global em inovação, precisão e ética na área médica.',
        type: 'outro'
      },
      {
        id: 'cta-final',
        asset: 'SOLID_BLUE',
        headline: 'ACELERE SEU PRODUTO',
        subhead: 'Componentes médicos de precisão com fabricação certificada ISO 13485.',
        type: 'cta'
      }
    ],
    caption: 'Quem Somos: Uma trajetória de excelência e compromisso com a vida.\n\nNossa missão é ser líder na manufatura de produtos de alta performance.\n\n#LifetrekMedical #QuemSomos #MedTech #ISO13485'
  },
  'capacidades': {
    name: 'Capacidades',
    description: 'Manufacturing capabilities showcase',
    slides: [
      {
        id: 'intro',
        asset: 'cnc-machine.jpg',
        headline: 'CAPACIDADES',
        subhead: 'Tecnologia de ponta para manufatura de precisão médica.',
        type: 'intro'
      },
      {
        id: 'cnc',
        asset: 'cnc-detail.jpg',
        headline: 'CNC 5 EIXOS',
        subhead: 'Equipamentos Mazak e DMG Mori de última geração.',
        type: 'content'
      },
      {
        id: 'cleanroom',
        asset: 'cleanroom.jpg',
        headline: 'SALA LIMPA',
        subhead: '5.000m² de área controlada ISO Classe 7.',
        type: 'content'
      },
      {
        id: 'quality',
        asset: 'quality-control.jpg',
        headline: 'QUALIDADE',
        subhead: 'CMM Zeiss e controle dimensional 100% rastreável.',
        type: 'content'
      },
      {
        id: 'cta',
        asset: 'SOLID_BLUE',
        headline: 'FALE CONOSCO',
        subhead: 'Descubra como podemos acelerar seu desenvolvimento.',
        type: 'cta'
      }
    ],
    caption: 'Nossas capacidades de manufatura de classe mundial.\n\nCNC 5 eixos, Sala Limpa ISO 7, e Controle de Qualidade rigoroso.\n\n#Manufacturing #MedicalDevices #PrecisionEngineering'
  },
  'custom': {
    name: 'Custom',
    description: 'Custom slides from user input',
    slides: [],
    caption: ''
  }
};

// Helper: Smart text wrapping
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

// Generate SVG for text overlay
function generateTextSvg(
  slide: any,
  index: number,
  isCta: boolean
): string {
  const isBottomText = index % 2 !== 0;

  const headlineLines = wrapText(slide.headline, isCta ? 15 : 20);
  const subheadLines = wrapText(slide.subhead, 50);

  let headlineY = isBottomText ? 800 : 200;
  let accentY = isBottomText ? 850 : 250;
  let subheadY = isBottomText ? 930 : 330;

  if (isCta) {
    headlineY = 300;
    const headlineHeightApprox = headlineLines.length * 95;
    accentY = headlineY + headlineHeightApprox - 20;
    subheadY = accentY + 80;
  }

  const headlineTspans = headlineLines.map((line, i) =>
    i === 0
      ? `<tspan x="540" dy="0">${escapeXml(line)}</tspan>`
      : `<tspan x="540" dy="1.1em">${escapeXml(line)}</tspan>`
  ).join('\n        ');

  const subheadTspans = subheadLines.slice(0, isCta ? 4 : 2).map((line, i) =>
    i === 0
      ? `<tspan x="540" dy="0">${escapeXml(line)}</tspan>`
      : `<tspan x="540" dy="1.4em">${escapeXml(line)}</tspan>`
  ).join('\n        ');

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <style>
      .headline {
        fill: white;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 900;
        font-size: ${isCta ? '80px' : '95px'};
        text-anchor: middle;
        text-transform: uppercase;
      }
      .subhead {
        fill: #ffffff;
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 500;
        font-size: ${isCta ? '42px' : '38px'};
        text-anchor: middle;
      }
      .accent { fill: ${BRAND.accentGreen}; }
    </style>

    <text x="540" y="${headlineY}" class="headline">
      ${headlineTspans}
    </text>

    <rect x="300" y="${accentY}" width="480" height="5" class="accent" />

    <text x="540" y="${subheadY}" class="subhead">
      ${subheadTspans}
    </text>
  </svg>`;
}

// Generate gradient SVG
function generateGradientSvg(index: number): string {
  const isBottomText = index % 2 !== 0;

  const gradientDefs = isBottomText
    ? `<linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="25%" style="stop-color:${BRAND.primaryBlue};stop-opacity:0" />
        <stop offset="55%" style="stop-color:${BRAND.primaryBlue};stop-opacity:0.4" />
        <stop offset="100%" style="stop-color:${BRAND.primaryBlue};stop-opacity:1" />
      </linearGradient>`
    : `<linearGradient id="textGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style="stop-color:${BRAND.primaryBlue};stop-opacity:1" />
        <stop offset="45%" style="stop-color:${BRAND.primaryBlue};stop-opacity:0.4" />
        <stop offset="75%" style="stop-color:${BRAND.primaryBlue};stop-opacity:0" />
      </linearGradient>`;

  return `<svg width="${WIDTH}" height="${HEIGHT}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      ${gradientDefs}
    </defs>
    <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#textGrad)" />
  </svg>`;
}

// Escape XML special characters
function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Generate a single slide image
async function generateSlide(
  supabase: any,
  slide: any,
  index: number,
  logoBuffer: Uint8Array | null
): Promise<string> {
  console.log(`🎨 V1 Generator: Creating Slide ${index + 1}: ${slide.headline}`);

  const isCta = slide.asset === 'SOLID_BLUE';

  // 1. Create or load base image
  let baseImage: Image;

  if (isCta) {
    // Create solid blue background
    baseImage = new Image(WIDTH, HEIGHT);
    baseImage.fill(Image.rgbToColor(
      BRAND.primaryBlueRgb.r,
      BRAND.primaryBlueRgb.g,
      BRAND.primaryBlueRgb.b
    ));
  } else {
    // Try to load asset from storage
    try {
      const { data: assetData, error: assetError } = await supabase.storage
        .from('assets')
        .download(`facility/${slide.asset}`);

      if (assetError || !assetData) {
        console.warn(`⚠️ Asset not found: ${slide.asset}, using fallback`);
        // Create a gradient fallback
        baseImage = new Image(WIDTH, HEIGHT);
        baseImage.fill(Image.rgbToColor(
          BRAND.primaryBlueRgb.r,
          BRAND.primaryBlueRgb.g,
          BRAND.primaryBlueRgb.b
        ));
      } else {
        const arrayBuffer = await assetData.arrayBuffer();
        const imageBytes = new Uint8Array(arrayBuffer);
        baseImage = await decode(imageBytes);
        baseImage = baseImage.resize(WIDTH, HEIGHT);
      }
    } catch (error) {
      console.error(`❌ Error loading asset: ${error}`);
      baseImage = new Image(WIDTH, HEIGHT);
      baseImage.fill(Image.rgbToColor(100, 100, 100));
    }
  }

  // 2. Apply gradient overlay (simple darkening for now since imagescript doesn't support SVG)
  // We'll create a gradient effect by modifying pixels
  if (!isCta) {
    const isBottomText = index % 2 !== 0;

    for (let y = 0; y < HEIGHT; y++) {
      let opacity: number;

      if (isBottomText) {
        // Dark at bottom
        if (y < HEIGHT * 0.25) opacity = 0;
        else if (y < HEIGHT * 0.55) opacity = ((y - HEIGHT * 0.25) / (HEIGHT * 0.3)) * 0.4;
        else opacity = 0.4 + ((y - HEIGHT * 0.55) / (HEIGHT * 0.45)) * 0.6;
      } else {
        // Dark at top
        if (y > HEIGHT * 0.75) opacity = 0;
        else if (y > HEIGHT * 0.45) opacity = ((HEIGHT * 0.75 - y) / (HEIGHT * 0.3)) * 0.4;
        else opacity = 0.4 + ((HEIGHT * 0.45 - y) / (HEIGHT * 0.45)) * 0.6;
      }

      for (let x = 0; x < WIDTH; x++) {
        const pixel = baseImage.getPixelAt(x + 1, y + 1);
        const r = (pixel >> 24) & 0xff;
        const g = (pixel >> 16) & 0xff;
        const b = (pixel >> 8) & 0xff;
        const a = pixel & 0xff;

        // Blend with brand blue
        const newR = Math.round(r * (1 - opacity) + BRAND.primaryBlueRgb.r * opacity);
        const newG = Math.round(g * (1 - opacity) + BRAND.primaryBlueRgb.g * opacity);
        const newB = Math.round(b * (1 - opacity) + BRAND.primaryBlueRgb.b * opacity);

        baseImage.setPixelAt(x + 1, y + 1, Image.rgbaToColor(newR, newG, newB, a));
      }
    }
  }

  // 3. Add logo if available
  if (logoBuffer) {
    try {
      const logo = await decode(logoBuffer);
      const logoHeight = 60;
      const logoWidth = Math.round(logo.width * (logoHeight / logo.height));
      const resizedLogo = logo.resize(logoWidth, logoHeight);

      const isBottomText = index % 2 !== 0;
      const logoY = isBottomText ? 40 : HEIGHT - logoHeight - 40;
      const logoX = WIDTH - logoWidth - 40;

      baseImage.composite(resizedLogo, logoX, logoY);
    } catch (error) {
      console.warn(`⚠️ Could not add logo: ${error}`);
    }
  }

  // 4. Note: Text rendering in imagescript is limited
  // For proper text, we'd need to use a different approach or return SVG for client compositing
  // For now, we'll encode the image and include text metadata for frontend overlay

  // Encode to PNG
  const pngBuffer = await baseImage.encode(1); // PNG format

  // Convert to base64
  const base64 = btoa(String.fromCharCode(...pngBuffer));

  console.log(`✅ V1 Generator: Slide ${index + 1} created (${Math.round(pngBuffer.length / 1024)}KB)`);

  return `data:image/png;base64,${base64}`;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const requestBody = await req.json();
    const {
      template = 'quem-somos',
      customSlides,
      customCaption,
      profileType = 'company',
      job_id: jobId
    } = requestBody;

    let job: any = null;

    // Handle async job mode
    if (jobId) {
      console.log(`🚀 V1 Generator: Processing Job ${jobId}`);

      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !jobData) {
        throw new Error(`Job ${jobId} not found`);
      }

      job = jobData;

      await supabase.from('jobs').update({
        status: 'processing',
        started_at: new Date().toISOString()
      }).eq('id', jobId);
    }

    // Get template or custom slides
    const templateConfig = TEMPLATES[template as keyof typeof TEMPLATES] || TEMPLATES['quem-somos'];
    const slides = customSlides || templateConfig.slides;
    const caption = customCaption || templateConfig.caption;

    if (!slides || slides.length === 0) {
      throw new Error("No slides provided");
    }

    console.log(`🎨 V1 Generator: Generating ${slides.length} slides using template "${template}"`);

    // Try to load logo
    let logoBuffer: Uint8Array | null = null;
    try {
      const { data: logoData } = await supabase.storage
        .from('assets')
        .download('branding/logo.png');

      if (logoData) {
        logoBuffer = new Uint8Array(await logoData.arrayBuffer());
      }
    } catch (error) {
      console.warn("⚠️ Could not load logo");
    }

    // Generate all slides
    const imageUrls: string[] = [];
    const textOverlays: any[] = [];

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const imageUrl = await generateSlide(supabase, slide, i, logoBuffer);
      imageUrls.push(imageUrl);

      // Include text overlay data for frontend rendering if needed
      textOverlays.push({
        headline: slide.headline,
        subhead: slide.subhead,
        type: slide.type,
        svg: generateTextSvg(slide, i, slide.asset === 'SOLID_BLUE')
      });
    }

    // Format slides for database
    const dbSlides = slides.map((s: any) => ({
      type: s.type === 'intro' ? 'hook' : s.type === 'outro' ? 'cta' : s.type,
      headline: s.headline,
      body: s.subhead
    }));

    const result = {
      carousel: {
        topic: templateConfig.name || template,
        slides: dbSlides,
        caption,
        format: 'carousel',
        imageUrls
      },
      metadata: {
        generation_method: 'v1-template',
        template_used: template,
        total_slides: slides.length,
        text_overlays: textOverlays
      }
    };

    // Save to database if job mode
    if (jobId && job) {
      try {
        const userId = job.user_id;

        const { data: carouselRecord, error: insertError } = await supabase
          .from('linkedin_carousels')
          .insert({
            admin_user_id: userId,
            user_id: userId,
            profile_type: profileType,
            topic: templateConfig.name || template,
            slides: dbSlides,
            caption,
            format: 'carousel',
            image_urls: imageUrls,
            status: 'pending_approval',
            generation_method: 'v1-template',
            generation_settings: {
              model: 'v1-local-compositing',
              template: template,
              timestamp: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (insertError) {
          console.error("❌ Error saving carousel:", insertError);
        } else {
          console.log(`✅ Saved carousel ${carouselRecord.id}`);
        }
      } catch (saveError) {
        console.error("❌ Save error:", saveError);
      }

      await supabase.from('jobs').update({
        status: 'completed',
        result,
        completed_at: new Date().toISOString()
      }).eq('id', jobId);

      return new Response("Job Completed", { status: 200 });
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("❌ V1 Generator Error:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    if (requestBody?.job_id) {
      await supabase.from('jobs').update({
        status: 'failed',
        error: errorMsg,
        completed_at: new Date().toISOString()
      }).eq('id', requestBody.job_id);
    }

    return new Response(
      JSON.stringify({ error: errorMsg }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
