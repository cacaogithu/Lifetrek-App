
const TOKEN = process.env.VERTEX_API_KEY || "YOUR_TOKEN_HERE";
const PROJECT_ID = process.env.GCP_PROJECT_ID || "lifetrek-app";
const REGION = process.env.GCP_REGION || "us-central1";
const MODEL = "imagen-3.0-generate-001";
const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL}:predict`;

async function testVertexImage() {
    console.log("Testing URL:", url);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            instances: [{ prompt: "A futuristic bicycle" }],
            parameters: { sampleCount: 1, aspectRatio: "1:1" }
        })
    });

    if (!response.ok) {
        console.error("❌ Error:", response.status, await response.text());
    } else {
        const data = await response.json();
        console.log("✅ Success. Prediction received.");
    }
}

testVertexImage();
