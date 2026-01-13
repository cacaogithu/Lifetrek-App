
const TOKEN = "AQ.Ab8RN6LBv-TYhXcyeID_loxvHpzVXkJctXiFbNqqZriJdXqJ8Q";
const PROJECT_ID = "cacao-ai";
const REGION = "us-central1";
const MODEL = "text-bison@001";
const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL}:predict?key=${TOKEN}`;

async function testPaLM() {
    console.log("Testing URL:", url);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            instances: [{ content: "Write a short LinkedIn post about AI." }],
            parameters: { temperature: 0.2, maxOutputTokens: 256, topP: 0.8, topK: 40 }
        })
    });

    if (!response.ok) {
        console.error("❌ Error:", response.status, await response.text());
    } else {
        const data = await response.json();
        console.log("✅ Success:", JSON.stringify(data, null, 2));
    }
}

testPaLM();
