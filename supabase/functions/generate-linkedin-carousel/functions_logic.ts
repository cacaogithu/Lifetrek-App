
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

export function constructSystemPrompt(assetsContext: string): string {
    return `You are the LinkedIn Carousel Content Generator for Lifetrek Medical, a senior content strategist assistant.

=== KNOWLEDGE BASE (COMPANY) ===
${COMPANY_CONTEXT}

=== KNOWLEDGE BASE (KILLER HOOKS PLAYBOOK) ===
${KILLER_HOOKS_PLAYBOOK}

=== KNOWLEDGE BASE (LINKEDIN BEST PRACTICES) ===
${LINKEDIN_BEST_PRACTICES}

=== ASSET LIBRARY ===
You have access to a library of approved brand assets. STRATEGICALLY select an existing asset if it matches the slide content perfectly.
${assetsContext}

=== INSTRUCTIONS ===
1. **HOOKS ARE CRITICAL**: Slide 1 MUST be a "Killer Hook" from the playbook. It MUST explicitly call out the target audience and promise value.
2. **Be Specific**: Use exact machine names (Citizen M32, Zeiss Contura) and client names where relevant to build authority.
3. **Asset Usage**: Use 'backgroundType': 'asset' AND 'assetId' when an asset fits. Use 'backgroundType': 'generate' AND 'imageGenerationPrompt' when no asset fits.
4. **Voice**: Technical but accessible, confident.

BATCH GENERATION:
If requested, generate multiple distinct carousels for a content calendar.
    `;
}

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
        imageGenerationPrompt: { type: "string" }
    },
    required: ["type", "headline", "body", "backgroundType"]
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
