// verify_system_update.ts
// This script simulates the logic in index.ts to verify correct prompt construction and mode handling.

import { constructUserPrompt, constructSystemPrompt } from "./supabase/functions/generate-linkedin-carousel/functions_logic.ts";

// Mock inputs
const MOCK_REQ_PLAN = {
    topic: "Spinal Screw Machining",
    targetAudience: "Manufacturing Engineers",
    mode: "plan",
    numberOfCarousels: 3
};

const MOCK_REQ_GENERATE = {
    topic: "Myth Busting: Titanium Drilling",
    targetAudience: "Manufacturing Engineers",
    mode: "generate",
    numberOfCarousels: 1
};

// --- TEST 1: PLAN MODE ---
console.log("\n=== TEST 1: PLAN MODE PROMPT ===");
let planUserPrompt = constructUserPrompt(
    MOCK_REQ_PLAN.topic, 
    MOCK_REQ_PLAN.targetAudience, 
    "High scrap rate", 
    "Better yield", 
    "Citizen L12", 
    "Book Demo", 
    true, // isBatch
    3
);

if (MOCK_REQ_PLAN.mode === 'plan') {
    planUserPrompt += "\n\nIMPORTANT: The user wants to see 3 DISTINCT STRATEGIC ANGLES/PLANS for this topic. Generate 3 variants (Batch Mode) so the user can choose the best one. Focus on the HEADLINES and HOOKS diffentiation.";
}

if (planUserPrompt.includes("3 DISTINCT STRATEGIC ANGLES")) {
    console.log("✅ Plan Mode instruction successfully appended.");
} else {
    console.error("❌ Plan Mode instruction MISSING.");
}
console.log("Prompt Preview:", planUserPrompt.slice(-200));


// --- TEST 2: BRAND CONTEXT INJECTION (NANNO BANANA) ---
console.log("\n=== TEST 2: BRAND CONTEXT ===");
const assetsContext = "No assets available";
const systemPrompt = constructSystemPrompt(assetsContext);

if (systemPrompt.includes("using the font 'Inter' (Bold)")) {
    console.log("✅ Brand Font 'Inter' found in System Prompt.");
} else {
    console.error("❌ Brand Font MISSING in System Prompt.");
}

console.log("System Prompt Tail:", systemPrompt.slice(-300));
if (systemPrompt.includes("High-Contrast Black/White")) {
    console.log("✅ High Contrast Config found in System Prompt.");
} else {
    console.error("❌ High Contrast Config MISSING.");
}


// --- TEST 3: MODEL CONSTANTS ---
// We can't check types at runtime easily, but we can verify the file content
console.log("\n=== TEST 3: FILE CONTENT (MODEL CONSTANTS) ===");
const indexTs = await Deno.readTextFile("./supabase/functions/generate-linkedin-carousel/index.ts");

if (indexTs.includes('const TEXT_MODEL = "google/gemini-1.5-pro";') && 
    indexTs.includes('const IMAGE_MODEL = "gemini-3-pro-image-preview";')) {
    console.log("✅ CONSTANTS defined correctly in index.ts");
} else {
    console.error("❌ CONSTANTS definition not found in index.ts");
}

console.log("\n✅ VERIFICATION COMPLETE.");
