import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const VERTEX_API_KEY = Deno.env.get("VERTEX_API_KEY");
const GCP_PROJECT_ID = Deno.env.get("GCP_PROJECT_ID") || "lifetrek-app";
const GCP_REGION = "us-central1";

if (!VERTEX_API_KEY) {
    console.error("Missing VERTEX_API_KEY");
    Deno.exit(1);
}

// 1. OLD PROMPT (From Git History)
const OLD_SYSTEM_PROMPT = `You are a professional graphic designer for Lifetrek Medical, a precision medical device manufacturer.
REQUIREMENTS:
- Professional medical device aesthetic
- Clean, modern design
- Readable from thumbnail size
Style: Professional B2B carousel slide, technical precision focus`;

const OLD_USER_PROMPT = `Create a professional LinkedIn single-image post for Lifetrek Medical.
Topic: Precision Manufacturing Expansion
Style: Professional B2B LinkedIn post, medical device industry`;

// 2. NEW PROMPT (From Current Code)
const NEW_SYSTEM_PROMPT = `You are a professional 3D artist and photographer for Lifetrek Medical.
CRITICAL RULE: DO NOT GENERATE ANY TEXT, LETTERS, WORDS, LOGOS, OR WATERMARKS.
Your job is to generate purely visual BACKGROUNDS and SCENES.

BRAND COLORS TO FEATURE:
- Backgrounds should use: White, Light Grey, and Corporate Blue (#004F8F) tinting.
- Accents: Innovation Green (#1A7A3E)

VISUAL STYLE:
- Photorealistic or High-End 3D Render
- Clean, sterile, precision medical environment
- Depth of field (bokeh) to create focus
- Abstract machinery or macro shots of precision metal components
- NO HUMANS necessary (focus on the tech)
- NO HALLUCINATED TEXT OR INTERFACES`;

const NEW_USER_PROMPT = `Create a high-quality background image for a medical device company.
SUBJECT: A close-up, photorealistic shot of a precision CNC milled medical component (titanium or stainless steel) resting on a clean surface.
LIGHTING: Professional studio lighting, cool tones, blue rim light.
COMPOSITION: Leave negative space in the CENTER and TOP for text overlay (do not put objects there).
STYLE: Macro photography, high detail, engineering excellence.
REMINDER: NO TEXT. NO LOGOS.`;


async function generateImage(systemPrompt: string, userPrompt: string, filename: string) {
    console.log(`🎨 Generating ${filename}...`);
    const vertexUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/imagen-3.0-generate-001:predict?key=${VERTEX_API_KEY}`;

    try {
        const response = await fetch(vertexUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                instances: [{
                    prompt: `SYSTEM: ${systemPrompt}\nUSER REQUEST: ${userPrompt}`
                }],
                parameters: {
                    sampleCount: 1,
                    aspectRatio: "1:1"
                }
            })
        });

        if (!response.ok) {
            console.error(`❌ Error generating ${filename}:`, await response.text());
            return;
        }

        const data = await response.json();
        const b64 = data.predictions?.[0]?.bytesBase64Encoded;

        if (b64) {
            // Save to file
            const bin = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
            await Deno.writeFile(filename, bin);
            console.log(`✅ Saved: ${filename}`);
        } else {
            console.error("❌ No image data in response");
        }

    } catch (e) {
        console.error(`❌ Exception for ${filename}:`, e);
    }
}

async function run() {
    await generateImage(OLD_SYSTEM_PROMPT, OLD_USER_PROMPT, "test_image_A_old.png");
    await generateImage(NEW_SYSTEM_PROMPT, NEW_USER_PROMPT, "test_image_B_new.png");
    console.log("\nDone! Please check the generated files.");
}

run();
