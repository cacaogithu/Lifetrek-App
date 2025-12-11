import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
    *   *Specs*: 20mm max diameter, 9-axis control.
*   **Doosan Lynx 2100 (Turning Center)**
    *   *Specs*: 60mm max diameter, 150mm length.
*   **Tornos GT26 (Multi-Axis)**
    *   *Specs*: 26mm capacity, multi-spindle, complex geometries.
*   **FANUC Robodrill**
    *   *Specs*: 30,000 RPM spindle, high-speed machining.
*   **Walter Helitronic**
    *   *Specs*: 5-axis tool grinding system.

### Metrology & Quality Control
*   **ZEISS Contura (3D CMM)**: Accuracy 1.9 + L/300 μm, fully automated.
*   **Optical Comparator CNC**: 10x-50x magnification, profile measurement.
*   **Olympus Microscope**: 100x-1000x magnification (metallographic analysis).
*   **Hardness Vickers**: Automated hardness testing (HV 0.3 - HV 30).

### Finishing & Facilities
*   **Electropolishing**: In-house line, Ra < 0.1μm mirror finish (Biocompatible, Corrosion Resistant).
*   **Laser Marking**: Fiber laser for UDI/Part Identification.
*   **Cleanrooms**: Two 60m² **ISO Class 7** cleanrooms for assembly/packaging.

## 3. Product Catalog (Comprehensive)

### Medical (Orthopedic, Spine, Trauma)
*   **Spinal Systems**: Fusion systems, pedicle screws, rods.
*   **Trauma Fixation**: Plates (locking/non-locking), screws, intramedullary nails.
*   **Cranial**: Fixation devices, mesh, specialty screws.
*   **Extremities**: Upper & lower extremity implants (hand/wrist/foot).

### Surgical Instruments
*   **Bones**: Drills (cannulated/solid), reamers, taps.
*   **Cutting**: Custom cutting tools, trepanation drills.
*   **Guides**: Surgical guide systems, drill guides.
*   **General**: Handles, drivers, depth gauges.

### Dental
*   **Implants**: Titanium dental implants (Hex connections).
*   **Prosthetics**: Angled abutments, healing abutments.
*   **Tools**: Bone preparation drills, torque ratchets.
*   **Orthodontic**: Micro-screws and anchorage components.

### Veterinary
*   **Orthopedics**: Small animal plates (TPLO, fracture), bone screws.
*   **Implants**: Adapted visualization and fixation systems.

## 4. Client Portfolio (Partners)
We serve leading manufacturers and OEMs globally.
**Client List**: FGM Dental Group, Neortho, Ultradent Products, Traumec Health Technology, Razek, Vincula, CPMH, Evolve, GMI, HCS, Impol, Implanfix, IOL Implantes, Plenum, Medens, OBL Dental, Orthometric, Óssea, React, Russer, TechImport, Toride.

## 5. Strategic Messaging & Copy Bank
### "Why Choose Us?" (Value Props)
*   **For OEMs**: "Eliminate supplier risks. We provide full batch traceability and an ISO 13485 certified quality system."
*   **For R&D**: "Accelerate product development. From ESD prototypes to mass production on Citizen Swiss lathes."
*   **For Procurement**: "Cost-effective global manufacturing based in Brazil, offering European-quality precision."

### Proof Points
*   **"30+ Years Experience"**: Deep roots in medical manufacturing.
*   **"100% Quality Board"**: Every part is verified.
*   **"In-House Finishing"**: Critical for quality control.

## 6. AI Agent Guidelines
*   **Role**: You are a Senior Sales Engineer at Lifetrek Medical.
*   **Goal**: Assist sales representatives by answering technical questions and drafting emails.
*   **Behavior**: Be precise, cite specific machines (e.g., "Use the Citizen M32 for that screw"), and emphasize our ISO/ANVISA certifications.
*   **Language**: Respond in the same language as the user (Portuguese or English), defaulting to Portuguese if unsure.
`;

serve(async (req) => {
    if (req.method === "OPTIONS") {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const { messages } = await req.json();
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

        if (!LOVABLE_API_KEY) {
            throw new Error("Missing LOVABLE_API_KEY");
        }

        console.log("Processing chat request with context length:", COMPANY_CONTEXT.length);

        const systemMessage = {
            role: "system",
            content: COMPANY_CONTEXT
        };

        // Combine system message with user history
        const fullMessages = [systemMessage, ...messages];

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash",
                messages: fullMessages,
                temperature: 0.3, // Low temperature for factual technical answers
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("AI API Error:", errorText);
            throw new Error(`AI API error: ${response.status} - ${errorText}`);
        }

        const aiResponse = await response.json();
        const reply = aiResponse.choices?.[0]?.message?.content || "Desculpe, não consegui processar sua resposta.";

        return new Response(
            JSON.stringify({ response: reply }),
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
