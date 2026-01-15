
const GEMINI_API_KEY = "AQ.Ab8RN6LF4u4GcujlX9HYSHVhrQJggRNVo-BCw1tFqwPFU4X55Q";
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

async function testGemini() {
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            contents: [{ parts: [{ text: "Hello" }] }]
        })
    });

    if (!response.ok) {
        console.error("❌ Error:", response.status, await response.text());
    } else {
        console.log("✅ Success:", await response.json());
    }
}

testGemini();
