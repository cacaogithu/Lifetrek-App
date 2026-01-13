
const TOKEN = "AQ.Ab8RN6LBv-TYhXcyeID_loxvHpzVXkJctXiFbNqqZriJdXqJ8Q";
const PROJECT_ID = "cacao-ai";
const REGION = "us-central1";
const MODEL = "imagen-3.0-generate-001";
const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL}:predict?key=${TOKEN}`;

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
