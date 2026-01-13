
const TOKEN = "AQ.Ab8RN6LF4u4GcujlX9HYSHVhrQJggRNVo-BCw1tFqwPFU4X55Q";
const PROJECT_ID = "cacao-ai";
const REGION = "us-central1";
const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models?key=${TOKEN}`;

async function listVertexModels() {
    console.log("Listing models from:", url);
    const response = await fetch(url);

    if (!response.ok) {
        console.error("❌ Error:", response.status, await response.text());
    } else {
        const data = await response.json();
        // Filter for Gemini models to keep output clean
        const models = data.publisherModels || [];
        const geminiModels = models.filter(m => m.name.includes("gemini") || m.name.includes("pro") || m.name.includes("flash"));

        console.log(`✅ Found ${models.length} models. Showing ${geminiModels.length} relevant ones:`);
        geminiModels.forEach(m => console.log(`- ${m.name.split('/').pop()} (${m.versionId})`));
    }
}

listVertexModels();
