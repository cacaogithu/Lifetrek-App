import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// import satori from "npm:satori@0.10.11";
// import { Resvg } from "npm:@resvg/resvg-js@2.6.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- Satori Helper (DISABLED FOR STABILITY - Using Local Sharp Compositing) ---
// async function generateTextSlideWithSatori(slide: any, backgroundUrl: string, profileType: string) {
//   try {
//     console.log("🎨 Satori: Generating Text Overlay...", { headline: slide.headline });

//     // 1. Fetch Fonts & Logos (Parallel for speed)
//     const [fontRegular, fontBold, logoData, isoData] = await Promise.all([
//       fetch("https://unpkg.com/@fontsource/roboto@5.0.8/files/roboto-latin-400-normal.woff").then(res => res.arrayBuffer()),
//       fetch("https://unpkg.com/@fontsource/roboto@5.0.8/files/roboto-latin-700-normal.woff").then(res => res.arrayBuffer()),
//       fetch("https://dlflpvmdzkeouhgqwqba.supabase.co/storage/v1/object/public/assets/logo.png").then(res => res.arrayBuffer()),
//       fetch("https://dlflpvmdzkeouhgqwqba.supabase.co/storage/v1/object/public/assets/iso.jpg").then(res => res.arrayBuffer())
//     ]);

//     // Stack-safe Base64 conversion
//     const toBase64 = (buffer: ArrayBuffer) => {
//       let binary = '';
//       const bytes = new Uint8Array(buffer);
//       const len = bytes.byteLength;
//       for (let i = 0; i < len; i++) {
//         binary += String.fromCharCode(bytes[i]);
//       }
//       return btoa(binary);
//     };

//     const logoB64 = `data:image/png;base64,${toBase64(logoData)}`;
//     const isoB64 = `data:image/jpeg;base64,${toBase64(isoData)}`;

//     // Base Styles
//     const isCompany = profileType === 'company';
//     const primaryColor = isCompany ? "#004F8F" : "#1A7A3E"; // Blue for Company, Green for Salesperson

//     // JSX-Like Markup
//     const markup = {
//       type: "div",
//       props: {
//         style: {
//           display: "flex",
//           flexDirection: "column",
//           width: "100%",
//           height: "100%",
//           backgroundImage: `url('${backgroundUrl}')`,
//           backgroundSize: "cover",
//           color: "white",
//           fontFamily: "Roboto",
//         },
//         children: [
//           // Overlay Tint
//           {
//             type: "div",
//             props: {
//               style: {
//                 position: "absolute",
//                 top: 0,
//                 left: 0,
//                 right: 0,
//                 bottom: 0,
//                 background: `linear-gradient(180deg, ${primaryColor}E6 0%, ${primaryColor}99 100%)`, // Stronger Tint for readability
//               }
//             }
//           },
//           // Content Container
//           {
//             type: "div",
//             props: {
//               style: {
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "space-between",
//                 width: "100%",
//                 height: "100%",
//                 padding: "80px",
//                 position: "relative",
//               },
//               children: [
//                 // Main Text Area
//                 {
//                   type: "div",
//                   props: {
//                     style: {
//                       display: "flex",
//                       flexDirection: "column",
//                       marginTop: "100px",
//                     },
//                     children: [
//                       // Headline
//                       {
//                         type: "h1",
//                         props: {
//                           style: {
//                             fontSize: "72px",
//                             fontWeight: 700,
//                             marginBottom: "40px",
//                             lineHeight: "1.1",
//                             textShadow: "0 2px 10px rgba(0,0,0,0.3)"
//                           },
//                           children: slide.headline
//                         }
//                       },
//                       // Body
//                       {
//                         type: "p",
//                         props: {
//                           style: {
//                             fontSize: "36px",
//                             fontWeight: 400,
//                             lineHeight: "1.4",
//                             opacity: 0.9,
//                             maxWidth: "90%"
//                           },
//                           children: slide.body
//                         }
//                       }
//                     ]
//                   }
//                 },
//                 // Footer with Logos
//                 {
//                   type: "div",
//                   props: {
//                     style: {
//                       display: "flex",
//                       flexDirection: "row",
//                       justifyContent: "space-between",
//                       alignItems: "flex-end",
//                       width: "100%",
//                     },
//                     children: [
//                       // Left: Lifetrek Logo
//                       {
//                         type: "img",
//                         props: {
//                           src: logoB64,
//                           style: {
//                             height: "60px",
//                             objectFit: "contain"
//                           }
//                         }
//                       },
//                       // Right: ISO Badge
//                       {
//                         type: "div",
//                         props: {
//                           style: {
//                             display: "flex",
//                             alignItems: "center",
//                             backgroundColor: "rgba(255,255,255,0.9)",
//                             padding: "10px 20px",
//                             borderRadius: "8px",
//                           },
//                           children: [
//                             {
//                               type: "img",
//                               props: {
//                                 src: isoB64,
//                                 style: {
//                                   height: "50px",
//                                   objectFit: "contain"
//                                 }
//                               }
//                             }
//                           ]
//                         }
//                       }
//                     ]
//                   }
//                 }
//               ]
//             }
//           }
//         ]
//       }
//     };

//     const svg = await satori(
//       markup,
//       {
//         width: 1080,
//         height: 1080,
//         fonts: [
//           { name: "Roboto", data: fontRegular, weight: 400, style: "normal" },
//           { name: "Roboto", data: fontBold, weight: 700, style: "normal" },
//         ],
//       }
//     );

//     const resvg = new Resvg(svg, { fitTo: { mode: "width", value: 1080 } });
//     const pngBuffer = resvg.render().asPng();
//     return `data:image/png;base64,${toBase64(pngBuffer.buffer)}`;

//   } catch (e) {
//     console.error("❌ Satori Error:", e);
//     return backgroundUrl; // Fallback to clean background if Satori fails
//   }
// }
async function generateTextSlideWithSatori(slide: any, backgroundUrl: string, profileType: string) {
  return backgroundUrl;
}


serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Setup Supabase Client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);

  let jobId: string | null = null;

  try {
    const requestBody = await req.json();
    let { topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, format = "carousel", profileType = "company", style = "visual", action, existingSlides } = requestBody;

    // ASYNC JOB MODE CHECK
    if (requestBody.job_id) {
      jobId = requestBody.job_id;
      console.log(`Processing Async Job: ${jobId}`);

      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobError || !job) {
        throw new Error(`Job ${jobId} not found: ${jobError?.message}`);
      }

      await supabase.from('jobs').update({
        status: 'processing',
        started_at: new Date().toISOString()
      }).eq('id', jobId);

      const payload = job.payload;
      topic = payload.topic;
      targetAudience = payload.targetAudience;
      painPoint = payload.painPoint;
      desiredOutcome = payload.desiredOutcome;
      proofPoints = payload.proofPoints;
      ctaAction = payload.ctaAction;
      format = payload.format || "carousel";
      profileType = payload.profileType || "company";
      style = payload.style || "visual"; // Default to old style
      action = payload.action;
      existingSlides = payload.existingSlides;
    }

    console.log("Processing LinkedIn content request:", { topic, action, profileType, style, mode: jobId ? 'ASYNC' : 'SYNC' });

    // const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    // if (!GEMINI_API_KEY) {
    //   throw new Error("GEMINI_API_KEY not configured");
    // }

    const GCP_PROJECT_ID = Deno.env.get("GCP_PROJECT_ID");
    const GCP_REGION = Deno.env.get("GCP_REGION");
    const VERTEX_API_KEY = Deno.env.get("VERTEX_API_KEY");

    if (!GCP_PROJECT_ID || !GCP_REGION || !VERTEX_API_KEY) {
      console.error("Missing GCP/Vertex configuration", { GCP_PROJECT_ID, GCP_REGION, hasVertexKey: !!VERTEX_API_KEY });
    }

    // Context definitions based on profile type
    const contexts = {
      company: {
        role: "authoritative industry leader",
        tone: "professional, innovative, and reliable",
        pronoun: "we",
        perspective: "As a leader in medical manufacturing...",
        imageStyle: "Corporate, clean, highly engineered, official branding elements."
      },
      salesperson: {
        role: "growth-focused medical device sales expert",
        tone: "persuasive, direct, high-energy, and sales-driven",
        pronoun: "I",
        perspective: "I help manufacturers cut costs and scale faster. Here is the deal...",
        imageStyle: "Dynamic, business-focused, less abstract, more 'results-oriented' visuals (charts, handshakes, clear value prop overlays)."
      }
    };

    const ctx = contexts[profileType as keyof typeof contexts] || contexts.company;

    let carousel: any = {};

    if (action === "regenerate_images" && existingSlides) {
      console.log("Regenerating images for existing slides...");
      carousel = {
        topic,
        slides: existingSlides
      };
    } else {
      // Build the system prompt
      const systemPrompt = `You are an expert LinkedIn content strategist acting as a ${ctx.role}. You follow Alex Hormozi's $100M framework.
CORE PRINCIPLES:
1. ONE core problem/question per carousel
2. Hook = Callout + Implied Value
3. Use proof early
4. Always include low-friction CTA
5. Favor reusable winners
6. VOICE & TONE: Use "${ctx.pronoun}" language. Be ${ctx.tone}.

CONTENT RULES:
- Headline: 5-8 words, punchy
- Body: 20-30 words max
- Use "${ctx.pronoun}" language
- 1-2 professional emojis per slide
`;

      const userPrompt = `Generate a LinkedIn carousel for my ${profileType} profile:
Topic: ${topic}
Target Audience: ${targetAudience}
Core Pain Point: ${painPoint}
${desiredOutcome ? `Desired Outcome: ${desiredOutcome}` : ""}

Create 5-7 slides:
1. Hook
2. 3-5 Content
3. CTA

Also create a caption.`;

      // MOCK TEXT GENERATION
      console.log("⚠️ Using MOCK Text Generation (API Key logic simplified for brevity).");
      carousel = {
        topic,
        caption: "Generated Caption...",
        slides: [
          { type: "hook", headline: "The Secret to Efficiency", body: "It's not what you think." },
          { type: "content", headline: "Step 1: Automate", body: "Stop doing manual tasks." },
          { type: "content", headline: "Step 2: Delegate", body: "Trust your team." },
          { type: "cta", headline: "Ready to Scale?", body: "DM me 'SCALE'." }
        ]
      };
    }

    // --- Image Generation Logic ---
    const imageUrls: string[] = [];
    const slidesToGenerate = format === "single-image" ? [carousel.slides[0]] : carousel.slides;

    // Brand-specific image prompt
    const imageSystemPrompt = `You are a professional 3D artist for Lifetrek Medical.
CRITICAL RULE: DO NOT GENERATE ANY TEXT OR LOGOS.
Your job is to generate purely visual ${style === 'text-heavy' ? 'ABSTRACT BACKGROUNDS' : 'SCENES'}.

BRAND COLORS:
- Backgrounds: White, Light Grey, Corporate Blue (#004F8F) tinting.
- Accents: Innovation Green (#1A7A3E)

VISUAL STYLE:
- Photorealistic or High-End 3D
- Clean, sterile, precision medical environment
- NO HUMANS necessary
- ${style === 'text-heavy' ? 'Create plenty of NEGATIVE SPACE. Minimal details. Soft focus.' : 'Detailed machinery.'}`;

    for (const slide of slidesToGenerate) {
      const imagePrompt = `Create a background for a ${slide.type} slide.
VISUAL: ${slide.type === 'hook' ? 'Dramatic lighting' : 'Clean facility background'}
STYLE: Minimalist, professional.
REMINDER: NO TEXT.`;

      try {
        const vertexUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/imagen-3.0-generate-001:predict?key=${VERTEX_API_KEY}`;
        console.log(`Calling Vertex AI Image: ${vertexUrl}`);

        const imageResponse = await fetch(vertexUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            instances: [{ prompt: `SYSTEM: ${imageSystemPrompt}\nUSER REQUEST: ${imagePrompt}` }],
            parameters: { sampleCount: 1, aspectRatio: "1:1" }
          }),
        });

        if (!imageResponse.ok) {
          imageUrls.push("");
          continue;
        }

        const imageData = await imageResponse.json();
        const b64Image = imageData.predictions?.[0]?.bytesBase64Encoded;

        let imageUrl = "";
        if (b64Image) {
          imageUrl = `data:image/png;base64,${b64Image}`;

          // HYBRID RENDERING CHECK
          if (style === 'text-heavy') {
            // Overlay Text using Satori
            // imageUrl = await generateTextSlideWithSatori(slide, imageUrl, profileType);
            console.log("Satori disabled. Returning raw background.");
          }
        }

        if (imageUrl) imageUrls.push(imageUrl);
        else imageUrls.push("");

      } catch (imageError) {
        console.error("Error generating image:", imageError);
        imageUrls.push("");
      }
    }

    console.log(`Content generation complete: ${imageUrls.length} images generated`);

    const result = {
      carousel: { ...carousel, format, imageUrls },
      debug: { imageCount: imageUrls.length }
    };

    if (jobId) {
      await supabase.from('jobs').update({
        status: 'completed',
        result: result,
        completed_at: new Date().toISOString()
      }).eq('id', jobId);
      return new Response("Job Completed", { status: 200 });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

  } catch (error) {
    console.error("Error in generate-linkedin-carousel:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    if (jobId) {
      await supabase.from('jobs').update({
        status: 'failed',
        error: errorMsg,
        completed_at: new Date().toISOString()
      }).eq('id', jobId);
      return new Response(`Job Failed: ${errorMsg}`, { status: 500 });
    }

    return new Response(JSON.stringify({ error: errorMsg }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});


