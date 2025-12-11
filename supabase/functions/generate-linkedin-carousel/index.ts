import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- EMBEDDED CONTEXTS ---

const COMPANY_CONTEXT = `
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

const LINKEDIN_BEST_PRACTICES = `
# LinkedIn Best Practices (Summary)

### Carousel Rules
*   **Slides**: 5-10 slides (7 is sweet spot).
*   **Dimensions**: 1080x1350px (Portrait) preferred.
*   **Text**: Minimal text per slide (20-40 words max).
*   **Contrast**: High contrast, readable fonts (30pt+).

### Hook Formulas
1.  **The Callout**: "[Audience]: If you're still [doing X], you're losing [specific loss]."
2.  **The Counter-Intuitive**: "I stopped [common practice] and [unexpected result]."
3.  **The Risk/Loss**: "[X] is costing [audience] [amount]."

### Slide Structure
*   **Slide 1 (Hook)**: One big promise/problem.
*   **Slides 2-6 (Body)**: One key insight per slide. Numbered.
*   **Slide 7 (CTA)**: Clear low-friction CTA (e.g., "Comment X").

### Caption Structure
1.  Hook (first 125 chars)
2.  Expand on promise (2-3 sentences)
3.  Tease content ("In this carousel...")
4.  CTA
5.  Hashtags (#MedTech #ISO13485 #PrecisionMachining)
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      topic,
      targetAudience,
      painPoint,
      desiredOutcome,
      proofPoints,
      ctaAction,
      format = "carousel",
      wantImages = true,
      numberOfCarousels = 1
    } = await req.json();

    const isBatch = numberOfCarousels > 1;

    console.log("Generating LinkedIn content:", { topic, targetAudience, format, wantImages, numberOfCarousels });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing configuration keys");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch available assets
    const { data: assets, error: assetsError } = await supabase
      .from("content_assets")
      .select("id, filename, category, tags")
      .limit(50);

    if (assetsError) {
      console.error("Error fetching assets:", assetsError);
    }

    const assetsContext = assets?.map(a =>
      `- [${a.category.toUpperCase()}] ID: ${a.id} (Tags: ${a.tags?.join(", ")}, Filename: ${a.filename})`
    ).join("\n") || "No assets available.";

    // Combined System Prompt with EMBEDDED CONTEXT
    const SYSTEM_PROMPT = `You are the LinkedIn Carousel Content Generator for Lifetrek Medical, a senior content strategist assistant.

=== KNOWLEDGE BASE (COMPANY) ===
${COMPANY_CONTEXT}

=== KNOWLEDGE BASE (LINKEDIN BEST PRACTICES) ===
${LINKEDIN_BEST_PRACTICES}

=== ASSET LIBRARY ===
You have access to a library of approved brand assets. STRATEGICALLY select an existing asset if it matches the slide content perfectly.
${assetsContext}

=== INSTRUCTIONS ===
1. **Use the Hook Formulas** from the best practices.
2. **Be Specific**: Use exact machine names (Citizen M32, Zeiss Contura) and client names where relevant to build authority.
3. **Asset Usage**: Use 'backgroundType': 'asset' AND 'assetId' when an asset fits. Use 'backgroundType': 'generate' AND 'imageGenerationPrompt' when no asset fits.
4. **Voice**: Technical but accessible, confident.

BATCH GENERATION:
If requested, generate multiple distinct carousels for a content calendar.
    `;

    // Construct User Prompt
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

    // Define Tools
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

    const tools = [
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

    // Call AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: tools,
        tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const args = JSON.parse(toolCall.function.arguments);

    // Normalize to array
    let resultCarousels = isBatch ? args.carousels : [args];

    // Process Images for ALL carousels
    for (const carousel of resultCarousels) {
      const processedSlides = [];
      const slidesToProcess = format === "single-image" ? [carousel.slides[0]] : carousel.slides;

      for (const slide of slidesToProcess) {
        let imageUrl = "";

        // 1. Try Asset
        if (slide.backgroundType === "asset" && slide.assetId) {
          const { data: assetData } = await supabase.from("content_assets").select("filename").eq("id", slide.assetId).single();
          if (assetData) {
            const { data: publicUrlData } = supabase.storage.from("content-assets").getPublicUrl(assetData.filename);
            imageUrl = publicUrlData.publicUrl;
          }
        }

        // 2. Generate if needed
        if (!imageUrl && wantImages && (slide.backgroundType === "generate" || !slide.assetId)) {
          try {
            const imagePrompt = `Create a professional LinkedIn background image for Lifetrek Medical.
HEADLINE: ${slide.headline}
CONTEXT: ${slide.body}
VISUAL DESCRIPTION: ${slide.imageGenerationPrompt || "Professional medical manufacturing scene"}
STYLE: Photorealistic, clean, ISO 13485 medical aesthetic.`;

            const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-2.5-flash-image",
                messages: [
                  { role: "system", content: "You are a professional medical designer." },
                  { role: "user", content: imagePrompt }
                ],
                modalities: ["image", "text"]
              }),
            });
            const imgData = await imgRes.json();
            imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
          } catch (e) {
            console.error("Image gen error", e);
          }
        }

        processedSlides.push({ ...slide, imageUrl });
      }
      carousel.slides = processedSlides;
      carousel.imageUrls = processedSlides.map(s => s.imageUrl);
    }

    return new Response(
      JSON.stringify(isBatch ? { carousels: resultCarousels } : { carousel: resultCarousels[0] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
