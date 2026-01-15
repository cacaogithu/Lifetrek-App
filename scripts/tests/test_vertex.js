
const TOKEN = "AQ.Ab8RN6LBv-TYhXcyeID_loxvHpzVXkJctXiFbNqqZriJdXqJ8Q";
const PROJECT_ID = "cacao-ai";
const REGION = "us-central1";
const MODEL = "gemini-1.0-pro";
const url = `https://${REGION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${REGION}/publishers/google/models/${MODEL}:generateContent?key=${TOKEN}`;

async function testVertex() {
    console.log("Testing URL:", url);
    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: "Hello" }] }]
        })
    });

    if (!response.ok) {
        console.error("❌ Error:", response.status, await response.text());
    } else {
        console.log("✅ Success:", await response.json());
    }
}

testVertex();
