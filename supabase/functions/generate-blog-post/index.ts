import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- CONSTANTS ---
const COMPANY_CONTEXT = `
# Lifetrek Medical - Company Context
**Mission**: "To lead in the manufacture of high-performance products... with an absolute commitment to life."
**Tone**: Technical, Ethical, Confident, Partnership-Oriented.
**Key Themes**: Risk Reduction, Precision (Micron-level), Compliance (ANVISA/ISO 13485), Speed.

## Infrastructure
- **CNC**: Citizen M32/L20 (Swiss-Type), Doosan Lynx 2100.
- **Metrology**: ZEISS Contura (3D CMM), Optical Comparator.
- **Finishing**: In-house Electropolishing, Laser Marking, ISO Class 7 Cleanrooms.

## Value Proposition
1. **Dream Outcome**: Eliminate import dependency. Audit-ready supply chain.
2. **Proof**: ISO 13485, ANVISA, Supplier for FGM/Ultradent.
3. **Speed**: 30 days local production vs 90 days import.
4. **Effort**: Single-source (Machining + Finishing + Metrology).
`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { generateNews, topic, category, research_context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let contextToUse = research_context || "";

    // 1. RESEARCH PHASE (Optional if not provided)
    if (generateNews && PERPLEXITY_API_KEY && !contextToUse) {
      console.log("🔍 [Phase 1] Researching with Perplexity...");
      try {
        const perplexityResponse = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              { role: "system", content: "You are a medical industry researcher." },
              { role: "user", content: `Find recent news/trends (last 30 days) about: ${topic || "Medical Device Manufacturing in Brazil"}. Focus on ANVISA regulations, supply chain shifts, or technology.` }
            ],
          }),
        });
        const pData = await perplexityResponse.json();
        contextToUse = pData.choices?.[0]?.message?.content || "";
      } catch (e) {
        console.error("Perplexity failed", e);
      }
    }

    // 2. STRATEGIST AGENT
    console.log("🧠 [Phase 2] Strategist is working...");
    const stratSystemPrompt = `You are the Content Strategist for Lifetrek Medical.
    Your goal is to plan a high-impact blog post that positions Lifetrek as the Technical Authority in medical manufacturing.
    
    INPUT: Topic: "${topic}", Category: "${category}".
    CONTEXT: ${contextToUse.slice(0, 1000)}...
    
    OUTPUT JSON:
    {
      "target_persona": "Specific role (e.g. Quality Manager at Ortho OEM)",
      "angle": "The unique, contrarian, or highly technical perspective",
      "visual_concept": "Description for a header image (Professional, ISO 13485 aesthetic, no text)",
      "outline": [
        { "tag": "h2", "title": "Section Title", "key_points": "What to cover" }
      ]
    }`;

    const stratResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: stratSystemPrompt }, { role: "user", content: "Create the strategy." }],
        response_format: { type: "json_object" },
      }),
    });
    const stratData = await stratResponse.json();
    const strategy = JSON.parse(stratData.choices[0].message.content);

    // 3. DESIGNER AGENT
    console.log("🎨 [Phase 3] Designer is working...");
    let imageUrl = "";
    try {
      // Fetch Assets (Logo & Products)
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: assets } = await supabase.from("company_assets").select("url, type").eq("type", "logo").single();
      const { data: products } = await supabase.from("products").select("name, image_url").limit(5);

      const logoUrl = assets?.url;
      const productImages = products?.map(p => ({ url: p.image_url, name: p.name })) || [];

      // Construct Multimodal Prompt
      const designSystemPrompt = `You are a world-class Industrial Designer & Photographer for Lifetrek Medical.
      GOAL: Generate a photorealistic header image for a blog post.
      
      INPUTS:
      - Concept: ${strategy.visual_concept}
      - Style: Clean, sterile, high-tech, medical blue/white/grey palette.
      - Vibe: Swiss precision, ISO 13485 compliance.
      ${logoUrl ? "- REFERENCE: Use the provided Logo for branding placement (subtle)." : ""}
      ${productImages.length > 0 ? `- PRODUCTS: Incorporate elements from the provided product images to ensure technical accuracy.` : ""}
      
      STRICTLY FOLLOW:
      - NO TEXT OVERLAYS.
      - High dynamic range, soft studio lighting.
      - Cinematic composition.`;

      const userContent = [
        { type: "text", text: designSystemPrompt }
      ];

      if (logoUrl) userContent.push({ type: "image_url", image_url: { url: logoUrl } });
      productImages.forEach(p => {
        userContent.push({ type: "text", text: `Product Reference: ${p.name}` });
        userContent.push({ type: "image_url", image_url: { url: p.url } });
      });

      console.log("Creating image with references:", { logo: !!logoUrl, productCount: productImages.length });

      const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview", 
          messages: [{ role: "user", content: userContent }],
          modalities: ["image", "text"]
        }),
      });
      const imgData = await imgResponse.json();
      imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
    } catch (e) {
      console.error("Image generation failed", e);
    }

    // 4. COPYWRITER AGENT
    console.log("✍️ [Phase 4] Copywriter is working...");
    const writerSystemPrompt = `You are a Senior Manufacturing Engineer writing for Lifetrek Medical.
    
    BASICS:
    - Tone: Expert, Technical, Educational (Not Salesy).
    - Format: Semantic HTML (No <html> or <body> tags, just content).
    - Language: Portuguese (Brazil).
    
    COMPANY DATA:
    ${COMPANY_CONTEXT}
    
    STRATEGY TO FOLLOW:
    - Persona: ${strategy.target_persona}
    - Angle: ${strategy.angle}
    - Outline: ${JSON.stringify(strategy.outline)}
    
    INSTRUCTIONS:
    - Write a deep-dive technical article (1000+ words).
    - Use data, specific machine names (Citizen L20, Zeiss CMM), and regulatory references (ANVISA RDC).
    - The goal is to make the reader feel they learned something valuable about manufacturing risks/processes.
    
    OUTPUT JSON:
    {
      "title": "SEO Optimized Title",
      "seo_title": "Title tag",
      "seo_description": "Meta description",
      "slug": "url-slug",
      "content": "HTML string",
      "keywords": ["tag1", "tag2"]
    }`;

    const writerResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "system", content: writerSystemPrompt }, { role: "user", content: "Write the article." }],
        response_format: { type: "json_object" },
      }),
    });
    const writerData = await writerResponse.json();
    const finalPost = JSON.parse(writerData.choices[0].message.content);

    // Merge results
    const result = {
      ...finalPost,
      image_url: imageUrl,
      strategy_brief: strategy, // Passing back for debugging/approval context
      sources: [] // Populate if used in research
    };

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-blog-post:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
