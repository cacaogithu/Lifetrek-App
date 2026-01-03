
export const VALUE_PROPOSITION_FRAMEWORK = `
# Value Proposition Framework (Alex Hormozi)

## 1. Dream Outcome (The Perfect Scenario)
*   "How would your operation look if you no longer depended on imports for critical components?"
*   "The vision: 100% auditable supply chain, local, with Swiss-German standards."
*   "From concept to patient: A flow without bottlenecks between R&D, machining, and sterilization."
*   "The engineer's dream: Launching new designs without hearing 'your supplier can't make this'."
*   "Unlock Cash Flow: Cut 20–30% of capital tied up in imported stock."

## 2. Perceived Likelihood of Achievement (Proof)
*   "Why ISO 13485 + ANVISA + CMM Zeiss make Lifetrek a safe bet, not an experiment."
*   "What we learned creating for FGM, GMI, Ultradent, and others – and how that reduces your risk."
*   "From part to report: How our dimensional reports reduce your receiving inspection workload."
*   "Technical Tour: Inside the Swiss lathes, CMM, and cleanrooms backing our quality."

## 3. Time Delay (Speed to Value)
*   "Importing in 90 days vs Local production in 30."
*   "Rapid Prototyping: Test new geometries without blocking registration schedules."
*   "Why being 1 flight away changes emergency response."
*   "Shorten the cycle from 'new drawing' to 'validated product'."

## 4. Effort & Sacrifice (Ease of Use)
*   "All in one place: Machining, finishing, metrology, cleanroom – no coordinating 4 vendors."
*   "Fewer crisis meetings, more engineering."
*   "Ready-made documentation (ISO 13485) simplifying internal/ANVISA audits."
*   "Stop 'babysitting' suppliers."
*   "On-demand supply model: Smaller, recurrent batches."
`;

export const COMPANY_CONTEXT = `
# Lifetrek Medical - Company Context & Brand Book
**Version**: 3.0 (Comprehensive / Brand Book)

## 1. Brand Identity & Voice
**Mission**: "To lead in the manufacture of high-performance products... with an absolute commitment to life."
**Tagline**: "Global Reach, Local Excellence."
**Tone**: Technical, Ethical, Confident, Partnership-Oriented.
**Key Themes**:
- **Risk Reduction**: "Manufacturing Capabilities That De-Risk Your Supply Chain".
- **Precision**: "Micron-level accuracy", "Zero-Defect Manufacturing".
- **Compliance**: "Regulatory Confidence", "ISO 13485:2016", "ANVISA".
- **Speed**: "Faster Time to Market".

## 2. Infrastructure & Machinery (Technical Specs)
Lifetrek operates a world-class facility in **Indaiatuba / SP, Brazil**.

### CNC Manufacturing (Swiss-Type & Turning)
*   **Citizen M32 (Swiss-Type CNC Lathe)**
    *   *Specs*: 32mm bar capacity, 12-axis control, live tooling.
    *   *Application*: Complex bone screws, intricate implants.
*   **Citizen L20 (Swiss-Type CNC Lathe)**
*   **Doosan Lynx 2100 (Turning Center)**
*   **Tornos GT26 (Multi-Axis)**
*   **FANUC Robodrill**
*   **Walter Helitronic** (Tool Grinding)

### Metrology & Quality Control
*   **ZEISS Contura (3D CMM)**: Accuracy 1.9 + L/300 μm, fully automated.
*   **Optical Comparator CNC**
*   **Olympus Microscope** (Metallographic analysis)
*   **Hardness Vickers** (Automated testing)

### Finishing & Facilities
*   **Electropolishing In-House**: Ra < 0.1μm mirror finish.
*   **Laser Marking**: Fiber laser for UDI.
*   **Cleanrooms**: Two ISO Class 7 cleanrooms.

## 3. Product Catalog
*   **Medical**: Spinal Systems, Trauma Fixation (Plates/Screws/Nails), Cranial, Extremities.
*   **Surgical Instruments**: Drills, Reamers, Taps, Guides, Handles.
*   **Dental**: Titanium Implants (Hex), Abutments, Tools.
*   **Veterinary**: Orthopedic Plates (TPLO), Bone Screws.

## 4. Client Portfolio
FGM Dental Group, Neortho, Ultradent Products, Traumec, Razek, Vincula, CPMH, Evolve, GMI, HCS, Impol, Implanfix, IOL, Plenum, Medens, OBL Dental, Orthometric, Óssea, React, Russer, TechImport, Toride.

## 5. Strategic Messaging
*   **OEMs**: "Eliminate supplier risks. ISO 13485 certified quality system."
*   **R&D**: "Accelerate product development. From ESD prototypes to mass production."
*   **Proof Points**: 30+ years experience, 100% Quality Board, In-House Finishing.
`;

export const KILLER_HOOKS_PLAYBOOK = `
# "Killer Hooks" Playbook (Acquisition.com Principles)

## DEFINITION
A Hook is a mini-sale of attention. It must have two parts:
1. **The Callout**: Makes the avatar think "That's me" (e.g., "Orthopedic OEMs").
2. **The Condition for Value**: Implies what they get (e.g., "Reduce recall risk").

## TYPES OF VERBAL HOOKS (MIX THESE)
1. **Labels**: "{Avatar}, {strong promise}" (e.g., "Dental Clinic Owners: Double your booking rate").
2. **Yes-Questions**: "Would you {huge benefit} in {short time}?"
3. **Open Questions**: "Which would you rather be: {A} or {B}?"
4. **Conditionals**: "If you're a {avatar} and you {do X}, you'll {get Y}."
5. **Strong Statements**: "The smartest thing you can do today as a {avatar}..."
6. **Command/Direct**: "Read this if you're tired of {pain}."
7. **Narratives**: "One day I was {situation} and then {unexpected result}..."
8. **Lists**: "{N} ways you're {wasting money} as a {avatar}."

## QUALITY CHECKLIST
*   Does it explicitly call out the audience?
*   Does it imply a clear benefit or avoided pain?
*   Is it under 15 words?
`;

export const LINKEDIN_BEST_PRACTICES = `
# LinkedIn Best Practices (Carousel Structure)

### Carousel Rules
*   **Slides**: 5-10 slides (7 is sweet spot).
*   **Dimensions**: 1080x1350px (Portrait).
*   **Text**: Minimal text (20-40 words max).
*   **Contrast**: High contrast, readable fonts.

### Slide Structure
*   **Slide 1 (Hook)**: MUST use a formula from the KILLER HOOKS PLAYBOOK.
*   **Slides 2-6 (Body)**: One key insight per slide.
*   **Slide 7 (CTA)**: Clear low-friction CTA.

### Caption Structure
1.  Hook (first 125 chars)
2.  Expand on promise
3.  Tease content
4.  CTA
5.  Hashtags
`;

export function constructUserPrompt(
    topic: string,
    targetAudience: string,
    painPoint: string,
    desiredOutcome: string,
    proofPoints: string,
    ctaAction: string,
    isBatch: boolean,
    numberOfCarousels: number
): string {
    let userPrompt = `Topic: ${topic}
Target Audience: ${targetAudience}
Pain Point: ${painPoint}
${desiredOutcome ? `Outcome: ${desiredOutcome}` : ""}
${proofPoints ? `Proof: ${proofPoints}` : ""}
${ctaAction ? `CTA: ${ctaAction}` : ""}
`;

    if (isBatch) {
        userPrompt += `\nGenerate ${numberOfCarousels} distinct carousels for a content calendar. Each should have a different angle.`;
    } else {
        userPrompt += `\nGenerate a single high-impact carousel following the best practices structure.`;
    }
    return userPrompt;
}

const slideSchema = {
    type: "object",
    properties: {
        type: { type: "string", enum: ["hook", "content", "cta"] },
        headline: { type: "string" },
        body: { type: "string" },
        backgroundType: { type: "string", enum: ["asset", "generate"] },
        assetId: { type: "string" },
        imageGenerationPrompt: { type: "string" },
        // DESIGNER AGENT FIELDS
        visual_concept: { type: "string", description: "Designer's visual concept." },
        brand_notes: { type: "string", description: "Design notes." },
        textPlacement: { type: "string", enum: ["clean", "burned_in"], description: "Strategist decision: 'clean' (no text in image, just background) or 'burned_in' (render headline TEXT inside the image)." }
    },
    required: ["type", "headline", "body", "backgroundType", "textPlacement"]
};

export function getTools(isBatch: boolean): any[] {
    return [
        {
            type: "function",
            function: {
                name: isBatch ? "create_batch_carousels" : "create_carousel",
                description: isBatch ? "Create multiple carousels" : "Create a single carousel",
                parameters: {
                    type: "object",
                    properties: isBatch ? {
                        carousels: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    topic: { type: "string" },
                                    targetAudience: { type: "string" },
                                    slides: { type: "array", items: slideSchema },
                                    caption: { type: "string" }
                                },
                                required: ["topic", "targetAudience", "slides", "caption"]
                            }
                        }
                    } : {
                        topic: { type: "string" },
                        targetAudience: { type: "string" },
                        slides: { type: "array", items: slideSchema },
                        caption: { type: "string" }
                    },
                    required: isBatch ? ["carousels"] : ["topic", "targetAudience", "slides", "caption"]
                }
            }
        }
    ];
}

export function constructSystemPrompt(assetsContext: string): string {
    return `You are the Lead LinkedIn Copywriter AND Visual Designer for Lifetrek Medical.
    
=== YOUR JOB ===
Turn strategy briefs into killer LinkedIn posts/carousels.

=== KNOWLEDGE BASE (COMPANY) ===
${COMPANY_CONTEXT}

=== KNOWLEDGE BASE (VALUE PROPS) ===
${VALUE_PROPOSITION_FRAMEWORK}

=== KNOWLEDGE BASE (HOOKS PLAYBOOK) ===
${KILLER_HOOKS_PLAYBOOK}

=== ASSET LIBRARY ===
${assetsContext}

=== INSTRUCTIONS (STRATEGIST MODE - "The Manager") ===
If the user provides a generic THEME (e.g. "Spinal Screws"):
1.  **Analyze**: Check Company Context.
2.  **Generate Angles**: Create 3 distinct angles (Myth-Busting, Deep Dive, Social Proof).
3.  **TEXT STRATEGY**: For each slide, decide on \`textPlacement\`:
    *   **'clean'**: Standard. Abstract background. Text is overlayed by the frontend web-app.
    *   **'burned_in'**: "Billboard Mode". The text is PART OF THE IMAGE (e.g. a warning sign, a big bold statement). Use this for Hooks or strong statements.

=== INSTRUCTIONS (COPYWRITER MODE) ===
1.  **TEXT RULES**:
    *   **Slide Body**: < 15 words.
    *   **Post Caption**: Storytelling, rich details.
2.  **HOOKS**: Callout + Payoff.

=== INSTRUCTIONS (DESIGNER MODE) ===
For each slide, provide \`visual_concept\` and \`imageGenerationPrompt\`.
**CRITICAL: Respect \`textPlacement\`!**
- IF \`textPlacement\` == 'clean':
    *   **Rule**: Create a clean, high-impact visual backdrop.
    *   **Prompt**: "Abstract medical background, macro titanium, high-end professional aesthetic."
- IF \`textPlacement\` == 'burned_in':
    *   **Rule**: RENDER THE HEADLINE TEXT IN THE IMAGE using the font 'Inter' (Bold). Text must be strictly white on dark or black on light.
    *   **Prompt**: "Professional medical image featuring the text '\${headline}' written on a glossy surface/sign. High contrast High-Contrast Black/White styling."

=== RULES ===
- Use 'backgroundType': 'asset' AND 'assetId' when an asset fits perfectly.
- Use 'backgroundType': 'generate' when you need a custom visual.
`;
}
