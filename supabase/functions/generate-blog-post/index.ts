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

// Helper: Timeout wrapper for promises
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms))
  ]);
}

// Helper: Safe AI call with retry
async function callAI(apiKey: string, body: object, timeoutMs = 25000): Promise<any> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { 
        Authorization: `Bearer ${apiKey}`, 
        "Content-Type": "application/json" 
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error ${response.status}:`, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { generateNews, topic, category, research_context, skipImage } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let contextToUse = research_context || "";

    // 1. RESEARCH PHASE (Optional - with timeout)
    if (generateNews && PERPLEXITY_API_KEY && !contextToUse) {
      console.log("🔍 [Phase 1] Researching with Perplexity...");
      const researchStart = Date.now();
      
      try {
        const researchPromise = fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              { role: "system", content: "You are a medical industry researcher. Be concise." },
              { role: "user", content: `Find 2-3 recent news/trends (last 30 days) about: ${topic || "Medical Device Manufacturing in Brazil"}. Focus on ANVISA, supply chain, or technology. Keep response under 500 words.` }
            ],
          }),
        }).then(r => r.json());
        
        const pData = await withTimeout(researchPromise, 10000, { choices: [] });
        contextToUse = pData.choices?.[0]?.message?.content || "";
        console.log(`✅ [Phase 1] Research complete in ${Date.now() - researchStart}ms`);
      } catch (e) {
        console.error("⚠️ Perplexity failed, continuing without research", e);
      }
    }

    // 2. STRATEGIST AGENT (Fast model)
    console.log("🧠 [Phase 2] Strategist is working...");
    const stratStart = Date.now();
    
    const stratSystemPrompt = `You are the Content Strategist for Lifetrek Medical.
    Plan a high-impact blog post that positions Lifetrek as a Technical Authority.
    
    INPUT: Topic: "${topic}", Category: "${category}".
    CONTEXT: ${contextToUse.slice(0, 800)}
    
    OUTPUT JSON:
    {
      "target_persona": "Specific role (e.g. Quality Manager at Ortho OEM)",
      "angle": "The unique technical perspective",
      "visual_concept": "Description for header image (clean, medical, no text)",
      "outline": [
        { "tag": "h2", "title": "Section Title", "key_points": "What to cover" }
      ]
    }`;

    const stratData = await callAI(LOVABLE_API_KEY, {
      model: "google/gemini-2.5-flash-lite", // Faster model
      messages: [
        { role: "system", content: stratSystemPrompt }, 
        { role: "user", content: "Create the strategy. Be concise." }
      ],
      response_format: { type: "json_object" },
    }, 15000);
    
    let strategy;
    try {
      strategy = JSON.parse(stratData.choices[0].message.content);
    } catch {
      strategy = {
        target_persona: "Quality Manager at Medical Device OEM",
        angle: "Technical deep-dive on precision manufacturing",
        visual_concept: "Clean medical manufacturing environment",
        outline: [
          { tag: "h2", title: "Introdução", key_points: "Context and importance" },
          { tag: "h2", title: "Desenvolvimento", key_points: "Technical details" },
          { tag: "h2", title: "Conclusão", key_points: "Key takeaways" }
        ]
      };
    }
    console.log(`✅ [Phase 2] Strategy complete in ${Date.now() - stratStart}ms`);

    // 3. COPYWRITER AGENT (Main content - PRIORITY)
    // Moved BEFORE image generation to ensure content is always generated
    console.log("✍️ [Phase 3] Copywriter is working...");
    const writeStart = Date.now();
    
    const writerSystemPrompt = `You are a Senior Manufacturing Engineer writing for Lifetrek Medical.
    
    BASICS:
    - Tone: Expert, Technical, Educational (Not Salesy).
    - Format: Semantic HTML (No <html> or <body> tags, just content).
    - Language: Portuguese (Brazil).
    
    COMPANY DATA:
    ${COMPANY_CONTEXT}
    
    STRATEGY:
    - Persona: ${strategy.target_persona}
    - Angle: ${strategy.angle}
    - Outline: ${JSON.stringify(strategy.outline)}
    
    INSTRUCTIONS:
    - Write a technical article (800-1200 words).
    - Use specific machine names (Citizen L20, Zeiss CMM), regulatory references (ANVISA RDC).
    - Goal: Make reader learn something valuable about manufacturing.
    
    OUTPUT JSON:
    {
      "title": "SEO Optimized Title (max 70 chars)",
      "seo_title": "Title tag (max 60 chars)",
      "seo_description": "Meta description (max 160 chars)",
      "excerpt": "2-3 sentence summary",
      "content": "HTML string",
      "keywords": ["tag1", "tag2", "tag3"]
    }`;

    const writerData = await callAI(LOVABLE_API_KEY, {
      model: "google/gemini-2.5-flash", // Standard model for quality
      messages: [
        { role: "system", content: writerSystemPrompt }, 
        { role: "user", content: "Write the article now." }
      ],
      response_format: { type: "json_object" },
    }, 30000);
    
    let finalPost;
    try {
      finalPost = JSON.parse(writerData.choices[0].message.content);
    } catch (parseError) {
      console.error("Failed to parse writer response:", parseError);
      throw new Error("Failed to generate blog content");
    }
    console.log(`✅ [Phase 3] Content complete in ${Date.now() - writeStart}ms`);

    // 4. IMAGE GENERATION (Optional, non-blocking)
    let imageUrl = "";
    if (!skipImage) {
      console.log("🎨 [Phase 4] Attempting image generation (optional)...");
      const imgStart = Date.now();
      
      try {
        // Quick asset fetch
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const [logoResult, productsResult] = await Promise.all([
          supabase.from("company_assets").select("url").eq("type", "logo").single(),
          supabase.from("processed_product_images").select("name, enhanced_url").eq("is_visible", true).limit(2)
        ]);

        const logoUrl = logoResult.data?.url;
        const productImages = productsResult.data?.map(p => ({ url: p.enhanced_url, name: p.name })) || [];

        // Simplified image prompt
        const designPrompt = `Generate a professional header image for a medical manufacturing blog.
        Concept: ${strategy.visual_concept}
        Style: Clean, sterile, high-tech, medical blue/white/grey.
        NO TEXT OVERLAYS. Photorealistic, soft studio lighting.`;

        type ContentPart = 
          | { type: "text"; text: string }
          | { type: "image_url"; image_url: { url: string } };

        const userContent: ContentPart[] = [{ type: "text", text: designPrompt }];
        
        if (logoUrl) {
          userContent.push({ type: "image_url", image_url: { url: logoUrl } });
        }
        if (productImages.length > 0) {
          userContent.push({ type: "image_url", image_url: { url: productImages[0].url } });
        }

        // Image generation with strict timeout
        const imgPromise = callAI(LOVABLE_API_KEY, {
          model: "google/gemini-2.5-flash-image", // Faster image model
          messages: [{ role: "user", content: userContent }],
          modalities: ["image", "text"]
        }, 20000);
        
        const imgData = await withTimeout(imgPromise, 20000, null);
        if (imgData) {
          imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
        }
        console.log(`✅ [Phase 4] Image ${imageUrl ? 'generated' : 'skipped'} in ${Date.now() - imgStart}ms`);
      } catch (e) {
        console.warn("⚠️ Image generation failed/timed out, continuing without image");
      }
    }

    // Generate slug from title
    const slug = finalPost.title
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "") || `post-${Date.now()}`;

    // Merge results
    const result = {
      title: finalPost.title,
      seo_title: finalPost.seo_title,
      seo_description: finalPost.seo_description,
      excerpt: finalPost.excerpt || finalPost.seo_description,
      content: finalPost.content,
      keywords: finalPost.keywords || [],
      tags: finalPost.keywords || [],
      slug,
      featured_image: imageUrl,
      strategy_brief: strategy,
      sources: []
    };

    const totalTime = Date.now() - startTime;
    console.log(`🎉 [COMPLETE] Blog post generated in ${totalTime}ms`);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    const totalTime = Date.now() - startTime;
    console.error(`❌ Error after ${totalTime}ms:`, error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});