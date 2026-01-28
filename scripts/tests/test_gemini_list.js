
const GEMINI_API_KEY = "AIzaSyBQRnu-3tb2hIr0haDOf1CuT6d0QlHppHM";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${GEMINI_API_KEY}`;

async function listModels() {
    const response = await fetch(url);
    if (!response.ok) {
        console.error("❌ Error:", response.status, await response.text());
    } else {
        const data = await response.json();
        console.log("✅ Models:", JSON.stringify(data, null, 2));
    }
}

listModels();
