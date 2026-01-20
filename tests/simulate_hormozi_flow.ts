// @ts-nocheck

// Manual .env loading
const env: Record<string, string> = {};
try {
  const envText = await Deno.readTextFile(".env");
  for (const line of envText.split("\n")) {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2].trim().replace(/^["']|["']$/g, "");
    }
  }
} catch (e) {
  console.error("Could not read .env file");
}

const API_KEY = env["PERPLEXITY_API_KEY"];
if (!API_KEY) {
    console.error("❌ Error: PERPLEXITY_API_KEY not found in .env");
    Deno.exit(1);
}

// --- MOCKED LOGIC (From functions_logic.ts) ---
const COMPANY_CONTEXT = `Lifetrek Medical - Brand Book (Summary)...
Mission: Lead in manufacture of high-performance products.
Tone: Technical, Ethical, Confident.
Key Themes: Risk Reduction, Precision, Compliance.
Machines: Citizen M32, Zeiss Contura.
`;

const KILLER_HOOKS_PLAYBOOK = `Hook Formula: Callout + Payoff.`;

function constructSystemPrompt(assetsContext: string): string {
    return `You are the Lead LinkedIn Copywriter AND Visual Designer for Lifetrek Medical.
    
=== YOUR JOB ===
Turn strategy briefs into killer LinkedIn posts/carousels.

=== KNOWLEDGE BASE (COMPANY) ===
${COMPANY_CONTEXT}

=== KNOWLEDGE BASE (HOOKS PLAYBOOK) ===
${KILLER_HOOKS_PLAYBOOK}

=== INSTRUCTIONS (STRATEGIST MODE - "The Manager") ===
If the user provides a generic THEME (e.g. "Spinal Screws") instead of a specific brief:
1.  **Analyze**: Check the Company Context for relevant capabilities.
2.  **Angle Generation**: Create 3 distinct angles for a weekly calendar:
    *   *Angle 1 (Myth-Busting)*: Challenge a common misconception.
    *   *Angle 2 (Deep Dive)*: Focus on a specific machine/standard.
    *   *Angle 3 (Social Proof/Case)*: Demonstrate results.

=== INSTRUCTIONS (COPYWRITER MODE) ===
1.  **TEXT DISTRIBUTION (THE "BILLBOARD VS LETTER" RULE)**:
    *   **Slide Body (The Billboard)**: MUST be < 15 words. Scannable. Big font energy.
    *   **Post Caption (The Letter)**: Where the storytelling happens. Rich details, nuance.
2.  **HOOKS (Slide 1)**: Must use the "Callout + Payoff" formula.

=== OUTPUT FORMAT ===
You MUST return a valid JSON object with this structure:
{
  "carousels": [
    {
      "topic": "string",
      "targetAudience": "string",
      "slides": [ ... ],
      "caption": "string"
    }
  ]
}
DO NOT return markdown.
`;
}

function constructUserPrompt(topic: string, targetAudience: string, painPoint: string, desiredOutcome: string, proofPoints: string, ctaAction: string, isBatch: boolean, numberOfCarousels: number): string {
    let userPrompt = `Topic: ${topic}
Target Audience: ${targetAudience}
Pain Point: ${painPoint}
Outcome: ${desiredOutcome}
Proof: ${proofPoints}
CTA: ${ctaAction}`;

    if (isBatch) {
        userPrompt += `\nGenerate ${numberOfCarousels} distinct carousels for a content calendar. Each should have a different angle (Myth/Deep Dive/Social Proof).`;
    } else {
        userPrompt += `\nGenerate a single high-impact carousel.`;
    }
    return userPrompt;
}

// --- SIMULATION ---
console.log("🚀 Starting Phase 2 Simulation (Strategist + Batch)...");

const topic = "Spinal Screws Theme";
const targetAudience = "Orthopedic OEMs";
const assetsContext = "No specific assets for this test.";

console.log(`\n📋 INPUT:\nTopic: ${topic}\nAudience: ${targetAudience} (BATCH MODE)\n`);

const systemPrompt = constructSystemPrompt(assetsContext);
const userPrompt = constructUserPrompt(topic, targetAudience, "Compliance Risk", "Safety", "ISO 13485", "DM for Checklist", true, 3);

console.log("Thinking... (Strategist + Copywriter generating 3 posts)");

const res = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
        model: "sonar-pro",
        messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
        ],
        temperature: 0.2
    }),
});

const data = await res.json();
let content = data.choices?.[0]?.message?.content || "{}";
content = content.replace(/```json/g, "").replace(/```/g, "");

try {
    const result = JSON.parse(content);
    // Handle wrapping
    const carousels = result.carousels || (result.carousel ? [result.carousel] : []);
    
    console.log(`\n✅ Generated ${carousels.length} Carousels:\n`);
    carousels.forEach((c, i) => {
        console.log(`[Post ${i+1}] Headline: ${c.slides?.[0]?.headline}`);
        console.log(`         Topic: ${c.topic}`);
        console.log(`         Hook (Slide 1 Body): ${c.slides?.[0]?.body}`);
        console.log(`         Caption Preview: ${c.caption?.substring(0, 50)}...\n`);
    });

} catch (e) {
    console.error("Failed to parse JSON:", content);
    Deno.exit(1);
}

console.log("Simulation Complete.");
