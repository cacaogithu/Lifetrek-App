// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Knowledge Base Content - Brand Book + Hormozi Framework
const KNOWLEDGE_DOCUMENTS = [
  // Brand Book Sections
  {
    source_type: "brand_book",
    source_id: "identity",
    content: `# Lifetrek Medical - Brand Identity & Voice
Mission: "To lead in the manufacture of high-performance products... with an absolute commitment to life."
Tagline: "Global Reach, Local Excellence."
Tone: Technical, Ethical, Confident, Partnership-Oriented.

Key Themes:
- Risk Reduction: "Manufacturing Capabilities That De-Risk Your Supply Chain"
- Precision: "Micron-level accuracy", "Zero-Defect Manufacturing"
- Compliance: "Regulatory Confidence", "ISO 13485:2016", "ANVISA"
- Speed: "Faster Time to Market"

Brand Associations (MUST reinforce in all content):
1. "Local Swiss-level" → Produção no Brasil com padrão tecnológico global (Citizen M32, ZEISS Contura)
2. "Regulatory-safe" → ISO 13485, ANVISA, documentação para auditorias
3. "Cash-friendly supply chain" → Menos estoque, menos lead time (30d vs 90d importação)
4. "Engineering partner" → Co-engineering, DFM, suporte técnico próximo`,
    metadata: { category: "brand", priority: "high" }
  },
  {
    source_type: "brand_book",
    source_id: "infrastructure",
    content: `# Lifetrek Medical - Infrastructure & Machinery (Technical Specs)
Location: Indaiatuba / SP, Brazil

CNC Manufacturing (Swiss-Type & Turning):
- Citizen M32 (Swiss-Type CNC Lathe): 32mm bar capacity, 12-axis control, live tooling. Application: Complex bone screws, intricate implants.
- Citizen L20 (Swiss-Type CNC Lathe)
- Doosan Lynx 2100 (Turning Center)
- Tornos GT26 (Multi-Axis)
- FANUC Robodrill
- Walter Helitronic (Tool Grinding)

Metrology & Quality Control:
- ZEISS Contura (3D CMM): Accuracy 1.9 + L/300 μm, fully automated
- Optical Comparator CNC
- Olympus Microscope (Metallographic analysis)
- Hardness Vickers (Automated testing)

Finishing & Facilities:
- Electropolishing In-House: Ra < 0.1μm mirror finish
- Laser Marking: Fiber laser for UDI
- Cleanrooms: Two ISO Class 7 cleanrooms`,
    metadata: { category: "technical", priority: "high" }
  },
  {
    source_type: "brand_book",
    source_id: "products",
    content: `# Lifetrek Medical - Product Catalog

Medical:
- Spinal Systems (screws, rods, connectors)
- Trauma Fixation (Plates, Screws, Nails)
- Cranial implants
- Extremities

Surgical Instruments:
- Drills, Reamers, Taps
- Guides, Handles

Dental:
- Titanium Implants (Hex)
- Abutments
- Tools

Veterinary:
- Orthopedic Plates (TPLO)
- Bone Screws`,
    metadata: { category: "products", priority: "medium" }
  },
  {
    source_type: "brand_book",
    source_id: "clients",
    content: `# Lifetrek Medical - Client Portfolio

Current Clients:
FGM Dental Group, Neortho, Ultradent Products, Traumec, Razek, Vincula, CPMH, Evolve, GMI, HCS, Impol, Implanfix, IOL, Plenum, Medens, OBL Dental, Orthometric, Óssea, React, Russer, TechImport, Toride.

Strategic Messaging by Avatar:
- OEMs: "Eliminate supplier risks. ISO 13485 certified quality system."
- R&D: "Accelerate product development. From ESD prototypes to mass production."
- Proof Points: 30+ years experience, 100% Quality Board, In-House Finishing.`,
    metadata: { category: "clients", priority: "medium" }
  },
  // Hormozi Framework Sections
  {
    source_type: "hormozi_framework",
    source_id: "value_equation",
    content: `# Alex Hormozi - Value Equation Framework

Value = (Dream Outcome × Perceived Likelihood) / (Time Delay × Effort & Sacrifice)

Dream Outcome (The Perfect Scenario):
- "How would your operation look if you no longer depended on imports for critical components?"
- "The vision: 100% auditable supply chain, local, with Swiss-German standards."
- "From concept to patient: A flow without bottlenecks between R&D, machining, and sterilization."
- "The engineer's dream: Launching new designs without hearing 'your supplier can't make this'."
- "Unlock Cash Flow: Cut 20–30% of capital tied up in imported stock."

Perceived Likelihood of Achievement (Proof):
- "Why ISO 13485 + ANVISA + CMM Zeiss make Lifetrek a safe bet, not an experiment."
- "What we learned creating for FGM, GMI, Ultradent, and others – and how that reduces your risk."
- "From part to report: How our dimensional reports reduce your receiving inspection workload."
- "Technical Tour: Inside the Swiss lathes, CMM, and cleanrooms backing our quality."`,
    metadata: { category: "framework", priority: "high" }
  },
  {
    source_type: "hormozi_framework",
    source_id: "time_effort",
    content: `# Alex Hormozi - Time Delay & Effort Reduction

Time Delay (Speed to Value):
- "Importing in 90 days vs Local production in 30."
- "Rapid Prototyping: Test new geometries without blocking registration schedules."
- "Why being 1 flight away changes emergency response."
- "Shorten the cycle from 'new drawing' to 'validated product'."

Effort & Sacrifice (Ease of Use):
- "All in one place: Machining, finishing, metrology, cleanroom – no coordinating 4 vendors."
- "Fewer crisis meetings, more engineering."
- "Ready-made documentation (ISO 13485) simplifying internal/ANVISA audits."
- "Stop 'babysitting' suppliers."
- "On-demand supply model: Smaller, recurrent batches."`,
    metadata: { category: "framework", priority: "high" }
  },
  {
    source_type: "hormozi_framework",
    source_id: "hooks_playbook",
    content: `# Killer Hooks Playbook (Acquisition.com Principles)

A Hook is a mini-sale of attention. It must have two parts:
1. The Callout: Makes the avatar think "That's me" (e.g., "Orthopedic OEMs").
2. The Condition for Value: Implies what they get (e.g., "Reduce recall risk").

Types of Verbal Hooks (MIX THESE):
1. Labels: "{Avatar}, {strong promise}" (e.g., "Dental Clinic Owners: Double your booking rate")
2. Yes-Questions: "Would you {huge benefit} in {short time}?"
3. Open Questions: "Which would you rather be: {A} or {B}?"
4. Conditionals: "If you're a {avatar} and you {do X}, you'll {get Y}."
5. Strong Statements: "The smartest thing you can do today as a {avatar}..."
6. Command/Direct: "Read this if you're tired of {pain}."
7. Narratives: "One day I was {situation} and then {unexpected result}..."
8. Lists: "{N} ways you're {wasting money} as a {avatar}."

Quality Checklist:
- Does it explicitly call out the audience?
- Does it imply a clear benefit or avoided pain?
- Is it under 15 words?`,
    metadata: { category: "hooks", priority: "high" }
  },
  {
    source_type: "hormozi_framework",
    source_id: "content_strategy",
    content: `# LinkedIn Content Strategy (Hormozi Framework)

MANDATORY STRUCTURE: HOOK → VALUE → LIGHT CTA

Content Mix:
- 80% "educational / insight / behind-the-scenes" posts
- 20% "direct commercial" posts (capacity, pilots, offers)
All still use HOOK → VALUE → CTA, just with different CTA strength.

Post de VALOR (80%):
- Focus: Educacional, insight, behind-the-scenes
- CTA: Low-friction (PDF, checklist, DM para guia, comenta "GUIA")
- Tone: Engineer-to-engineer, consultative, educational
- Goal: Build trust and brand association, not immediate sales
- The reader should be able to USE this content even without Lifetrek

Post COMERCIAL (20%):
- Focus: Direct offer (capacity, pilots, project slots)
- CTA: Stronger but still professional (schedule call, request quote, pilot project)
- Tone: Confident, direct, still technical
- Goal: Generate qualified leads and conversations

LinkedIn Best Practices:
- Slides: 5-10 slides (7 is sweet spot)
- Dimensions: 1080x1350px (Portrait)
- Text: Minimal (20-40 words max per slide)
- Contrast: High contrast, readable fonts
- Hook on Slide 1: MUST use a formula from KILLER HOOKS PLAYBOOK
- CTA on Final Slide: Single, clear, low-friction`,
    metadata: { category: "linkedin", priority: "high" }
  }
];

// Generate embedding using Lovable AI (Gemini)
async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  // Use Gemini embedding model
  const response = await fetch("https://ai.gateway.lovable.dev/v1/embeddings", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-embedding-001",
      input: text,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Embedding API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(
      JSON.stringify({ error: "Missing configuration" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  try {
    const { mode = "populate" } = await req.json().catch(() => ({}));

    if (mode === "clear") {
      // Clear existing embeddings
      const { error } = await supabase
        .from("knowledge_embeddings")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000"); // Delete all
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({ success: true, message: "Knowledge base cleared" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Populate knowledge base
    console.log(`📚 Starting knowledge base population with ${KNOWLEDGE_DOCUMENTS.length} documents...`);
    
    const results = [];
    
    for (const doc of KNOWLEDGE_DOCUMENTS) {
      console.log(`📝 Processing: ${doc.source_type}/${doc.source_id}`);
      
      // Generate embedding
      const embedding = await generateEmbedding(doc.content, LOVABLE_API_KEY);
      console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
      
      // Insert into database
      const { data, error } = await supabase
        .from("knowledge_embeddings")
        .upsert({
          content: doc.content,
          metadata: doc.metadata,
          embedding: embedding,
          source_type: doc.source_type,
          source_id: doc.source_id,
          chunk_index: 0,
        }, {
          onConflict: "source_type,source_id"
        })
        .select()
        .single();
      
      if (error) {
        console.error(`❌ Error inserting ${doc.source_id}:`, error);
        results.push({ source_id: doc.source_id, success: false, error: error.message });
      } else {
        console.log(`✅ Inserted: ${doc.source_id}`);
        results.push({ source_id: doc.source_id, success: true });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Populated ${successCount}/${KNOWLEDGE_DOCUMENTS.length} documents`,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error populating knowledge base:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
