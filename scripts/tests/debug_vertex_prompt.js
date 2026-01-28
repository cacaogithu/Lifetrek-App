
const TOKEN = process.env.VERTEX_API_KEY || "YOUR_TOKEN_HERE";
const PROJECT_ID = process.env.GCP_PROJECT_ID || "lifetrek-app";
const REGION = process.env.GCP_REGION || "us-central1";
const MODEL = "imagen-3.0-generate-001";
const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL}:predict`;

const imageSystemPrompt = `You are a professional graphic designer for Lifetrek Medical, a precision medical device manufacturer.

BRAND COLORS:
- Corporate Blue: #004F8F (primary - trust, precision)
- Innovation Green: #1A7A3E (accents - innovation)
- Energy Orange: #F07818 (highlights - use sparingly)

DESIGN PRINCIPLES:
- Clean, modern, minimalist
- Professional medical device aesthetic
- High contrast for readability
- Inter font for text overlays
- Technical excellence without overwhelming
- STYLE VARIATION: This is for a COMPANY profile. 

VISUAL STYLE:
- Professional medical device imagery
- Technical precision (CNC machines, implants, quality)
- Clean backgrounds with subtle blue tinting
- B2B professional, not consumer-facing

TARGET: Medical device OEMs, orthopedic/dental manufacturers, quality engineers

Generate LinkedIn-ready images (1080x1080px) that command attention while maintaining technical credibility.`;

const imagePrompt = `Create a professional LinkedIn single-image post for Lifetrek Medical (company profile).

CONTENT:
Topic: Lifetrek Medical Launch & Vision
Headline: We Have Arrived.
Key Points: Lifetrek Medical expands with a new 50,000 sqft facility.

LAYOUT:
- Bold headline at top using Corporate Blue (#004F8F)
- Clean background with subtle medical device imagery
- Key text overlays in white/high contrast
- Lifetrek Medical branding prominent
- 1080x1080px square format
- Modern, professional, attention-grabbing
- Include relevant icons or visual elements that represent precision manufacturing

Style: Professional B2B LinkedIn post, medical device industry`;

async function testVertexImage() {
    console.log("Testing URL:", url);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            instances: [{
                prompt: `SYSTEM: ${imageSystemPrompt}
                 USER REQUEST: ${imagePrompt}`
            }],
            parameters: { sampleCount: 1, aspectRatio: "1:1" }
        })
    });

    if (!response.ok) {
        console.error("❌ Error:", response.status, await response.text());
    } else {
        const data = await response.json();
        if (data.predictions && data.predictions[0].bytesBase64Encoded) {
            console.log("✅ Success. Base64 Image received (Length: " + data.predictions[0].bytesBase64Encoded.length + ")");
        } else {
            console.error("❌ Response received but NO predictions/image:", JSON.stringify(data, null, 2));
        }
    }
}

testVertexImage();
