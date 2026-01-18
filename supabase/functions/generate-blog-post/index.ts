import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

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
    const body = await req.json();
    const { generateNews, topic, category, research_context, skipImage, job_id: jobIdFromReq } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let contextToUse = research_context || "";

    // 1. DEEP RESEARCH PHASE (Perplexity sonar-pro for comprehensive research)
    if (PERPLEXITY_API_KEY && !contextToUse) {
      console.log("🔍 [Phase 1] Deep Research with Perplexity sonar-pro...");
      const researchStart = Date.now();

      try {
        const deepResearchPrompt = `Você é um pesquisador especialista em dispositivos médicos e manufatura de precisão no Brasil.

TÓPICO: ${topic || "Fabricação de Dispositivos Médicos no Brasil"}
CATEGORIA: ${category || "Geral"}

Realize uma pesquisa aprofundada incluindo:

1. **Contexto Regulatório**: 
   - Últimas atualizações da ANVISA (RDCs, INs, consultas públicas)
   - Mudanças em certificações ISO 13485, ISO 14971
   - Requisitos para registro de dispositivos médicos classe II/III/IV

2. **Tendências de Mercado**:
   - Movimentos de mercado em implantes ortopédicos/dentários no Brasil
   - Investimentos em manufatura nacional vs importação
   - Dados de mercado recentes (valor, crescimento, players)

3. **Inovações Técnicas**:
   - Avanços em usinagem CNC para implantes
   - Novas tecnologias de acabamento superficial
   - Tendências em materiais (titânio, PEEK, ligas de cobalto-cromo)

4. **Casos Relevantes**:
   - Notícias recentes do setor no Brasil
   - Lançamentos de produtos ou certificações
   - Desafios e oportunidades identificados

Forneça informações factuais com fontes quando possível. Resposta em Português do Brasil, máximo 1000 palavras.`;

        const researchPromise = fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "sonar-pro", // Using sonar-pro for deeper research
            messages: [
              { role: "system", content: "Você é um pesquisador sênior especializado em dispositivos médicos, regulamentação ANVISA e manufatura de precisão. Forneça informações atualizadas, precisas e com fontes." },
              { role: "user", content: deepResearchPrompt }
            ],
            search_recency_filter: "month", // Focus on recent content
          }),
        }).then(r => r.json());

        const pData = await withTimeout(researchPromise, 20000, { choices: [], citations: [] });
        contextToUse = pData.choices?.[0]?.message?.content || "";

        // Store citations for reference (not shown to users)
        const citations = pData.citations || [];
        if (citations.length > 0) {
          console.log(`📚 Research sources: ${citations.slice(0, 5).join(", ")}`);
        }

        console.log(`✅ [Phase 1] Deep Research complete in ${Date.now() - researchStart}ms (${contextToUse.length} chars)`);
      } catch (e) {
        console.error("⚠️ Perplexity deep research failed, continuing without research", e);
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

        // Professional banner image prompt for SEO and social sharing
        const designPrompt = `Create a professional wide banner image (16:9 aspect ratio) for a medical manufacturing blog article.

TITLE: "${finalPost.title}"
VISUAL CONCEPT: ${strategy.visual_concept}

STYLE REQUIREMENTS:
- Ultra-professional, clean, premium medical aesthetic
- Color palette: Deep medical blue (#1a365d), clean white, surgical steel grey, subtle teal accents
- Composition: Modern, asymmetric layout with strong visual hierarchy
- Lighting: Soft, diffused studio lighting with subtle highlights
- Atmosphere: Sterile, precise, high-tech yet approachable

ELEMENTS TO INCLUDE:
- Abstract representation of precision manufacturing or medical technology
- Subtle geometric patterns suggesting precision and quality
- Clean negative space for visual breathing room
- Professional gradient overlays

CRITICAL:
- NO TEXT, NO WORDS, NO LETTERS on the image
- NO logos or watermarks
- NO human faces
- Photorealistic quality, 4K detail
- Perfect for LinkedIn/Facebook Open Graph sharing

The image should convey: Trust, Precision, Innovation, Medical Excellence.`;

        type ContentPart =
          | { type: "text"; text: string }
          | { type: "image_url"; image_url: { url: string } };

        const userContent: ContentPart[] = [{ type: "text", text: designPrompt }];

        // Add product reference for visual consistency
        if (productImages.length > 0) {
          userContent.push({
            type: "image_url",
            image_url: { url: productImages[0].url }
          });
        }

        // Image generation with improved model
        const imgPromise = callAI(LOVABLE_API_KEY, {
          model: "google/gemini-3-pro-image-preview", // Better quality for banners
          messages: [{ role: "user", content: userContent }],
          modalities: ["image", "text"]
        }, 25000);

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

    // --- Google Drive Upload Logic ---
    try {
      const { uploadFileToDrive, getConfig, createFolder } = await import("../_shared/google-drive.ts");
      const GOOGLE_DRIVE_FOLDER_ID = await getConfig("GOOGLE_DRIVE_FOLDER_ID");

      if (GOOGLE_DRIVE_FOLDER_ID) {
        console.log("📂 Uploading blog content to Google Drive...");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const cleanTitle = (result.title || "blog").replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);
        const subFolderName = `${timestamp}_${cleanTitle}`;

        const postFolderId = await createFolder(subFolderName, GOOGLE_DRIVE_FOLDER_ID);
        const targetFolderId = postFolderId || GOOGLE_DRIVE_FOLDER_ID;

        // 1. Upload the blog content as Markdown
        const mdContent = `# ${result.title}\n\n**SEO Title**: ${result.seo_title}\n**SEO Description**: ${result.seo_description}\n**Keywords**: ${result.keywords.join(", ")}\n\n---\n\n${result.content}`;
        const textBytes = new TextEncoder().encode(mdContent);
        await uploadFileToDrive("blog_content.md", textBytes, targetFolderId, "text/markdown");

        // 2. Upload strategy brief
        const strategyText = `TARGET PERSONA: ${strategy.target_persona}\nANGLE: ${strategy.angle}\nVISUAL CONCEPT: ${strategy.visual_concept}\n\nOUTLINE:\n${strategy.outline.map((o: any) => `- ${o.title}: ${o.key_points}`).join("\n")}`;
        const strategyBytes = new TextEncoder().encode(strategyText);
        await uploadFileToDrive("strategy_brief.txt", strategyBytes, targetFolderId, "text/plain");

        // 3. Upload header image if generated
        if (imageUrl) {
          try {
            const imgResp = await fetch(imageUrl);
            if (imgResp.ok) {
              const imgBlob = await imgResp.blob();
              const imgBytes = new Uint8Array(await imgBlob.arrayBuffer());
              await uploadFileToDrive("header_image.png", imgBytes, targetFolderId, "image/png");
              console.log("✅ Uploaded header image to Drive");
            }
          } catch (imgFetchErr) {
            console.error("Failed to fetch image for Drive upload:", imgFetchErr);
          }
        }

        console.log("✅ Blog Drive upload complete");
      }
    } catch (driveErr) {
      console.warn("⚠️ Google Drive upload failed (non-critical):", driveErr);
    }

    // ASYNC JOB MODE: Save to DB autonomously
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const jobId = jobIdFromReq;

    if (jobId) {
      console.log(`[Job ${jobId}] Saving result to blog_posts...`);

      try {
        // Get job details to find user_id
        const { data: jobData } = await supabase.from('jobs').select('user_id').eq('id', jobId).single();
        const userId = jobData?.user_id || (await supabase.auth.getUser())?.data?.user?.id;

        if (!userId) {
          console.warn("No userId found for blog save, skipping.");
          return;
        }

        const insertData = {
          author_id: userId,
          user_id: userId, // Set both for compatibility if it exists
          title: result.title,
          content: result.content,
          excerpt: result.excerpt,
          featured_image: result.featured_image,
          category_id: body.category_id,
          status: 'pending_review',
          slug: result.slug,
          seo_title: result.seo_title,
          seo_description: result.seo_description,
          ai_generated: true,
          metadata: {
            strategy: strategy,
            generation_time_ms: totalTime,
            keywords: result.keywords || []
          }
        };

        const { data: blogRecord, error: insertError } = await supabase
          .from("blog_posts")
          .insert([insertData])
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting blog post:", insertError);
          // NEW: Save error to job record
          await supabase.from('jobs').update({
            error: `Blog Save Error: ${insertError.message} (${insertError.code})`,
            checkpoint_data: { insert_failed: true, insert_error: insertError, insert_payload: insertData }
          }).eq('id', jobId);
        } else {
          console.log(`✅ Saved blog post ${blogRecord.id} to database`);
          await supabase.from('jobs').update({
            status: 'completed',
            result: result,
            completed_at: new Date().toISOString()
          }).eq('id', jobId);
        }
      } catch (err) {
        console.error("Critical error in blog worker save:", err);
        const errorMsg = err instanceof Error ? err.message : "Unknown error";
        await supabase.from('jobs').update({
          error: `Blog Post Save Critical Error: ${errorMsg}`
        }).eq('id', jobId);
      }

      return new Response("Job Processed", { status: 200 });
    }

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