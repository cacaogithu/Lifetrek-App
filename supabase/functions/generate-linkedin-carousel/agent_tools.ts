// Agent Tools for LinkedIn Carousel Generation
// These tools are available to Strategist, Copywriter, and Designer agents

import { createClient } from "npm:@supabase/supabase-js@2.75.0";

declare const Deno: any;

// Tool definitions for Gemini function calling
export const AGENT_TOOLS = {
  strategist: [
    {
      type: "function",
      function: {
        name: "query_knowledge",
        description: "Search the company knowledge base (Brand Book, Hormozi Framework, Market Research, Pain Points) for relevant context based on a topic or question. Use this to ground your strategy in company-specific information and market data.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "The topic or question to search for (e.g., 'dores do OEM ortopédico', 'hooks para linkedin', 'vantagens produção local')" },
            source_type: { 
              type: "string", 
              enum: ["brand_book", "hormozi_framework", "industry_research", "market_pain_points", "competitive_intelligence"],
              description: "Optional: filter by source type"
            },
            max_results: { type: "number", description: "Maximum results to return (default: 5)" }
          },
          required: ["query"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "search_industry_data",
        description: "Search for market research, industry trends, and pain points by avatar type. Use this to add data-backed arguments to your content.",
        parameters: {
          type: "object",
          properties: {
            avatar: { 
              type: "string", 
              enum: ["orthopedic_oem", "dental_oem", "veterinary_oem", "surgical_instruments", "general"],
              description: "The target avatar to get pain points for"
            },
            topic: { 
              type: "string", 
              description: "Specific topic to search (e.g., 'lead time', 'recalls', 'regulatory')"
            }
          },
          required: ["avatar"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "list_product_categories",
        description: "Get a list of available product categories to understand what products can be featured in the carousel.",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    },
    {
      type: "function",
      function: {
        name: "deep_research",
        description: "Perform real-time web research using Perplexity AI. Use this to find current industry trends, news, statistics, competitor analysis, and technical information. Great for adding timely, data-backed insights to content.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "Research query (e.g., 'medical device market trends Brazil 2024', 'orthopedic implant regulations FDA')" },
            focus: { 
              type: "string", 
              enum: ["industry_trends", "competitor_analysis", "market_data", "technical_info", "news", "regulatory"],
              description: "Focus area for research to get more targeted results"
            }
          },
          required: ["query"]
        }
      }
    }
  ],
  copywriter: [
    {
      type: "function",
      function: {
        name: "query_knowledge",
        description: "Search the knowledge base for tone, messaging examples, and best practices.",
        parameters: {
          type: "object",
          properties: {
            query: { type: "string", description: "The topic to search for" },
            source_type: { 
              type: "string", 
              enum: ["brand_book", "hormozi_framework"],
              description: "Optional: filter by source type"
            },
            max_results: { type: "number", description: "Maximum results (default: 3)" }
          },
          required: ["query"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "get_hook_examples",
        description: "Get examples of killer hooks from the playbook for inspiration.",
        parameters: {
          type: "object",
          properties: {
            hook_type: { 
              type: "string", 
              enum: ["label", "yes_question", "conditional", "command", "narrative", "list"],
              description: "Type of hook to get examples for"
            }
          },
          required: []
        }
      }
    }
  ],
  designer: [
    {
      type: "function",
      function: {
        name: "search_products",
        description: "Search for product images that can be used in the carousel. Returns URLs of processed product images.",
        parameters: {
          type: "object",
          properties: {
            category: { 
              type: "string", 
              description: "Product category to search (e.g., 'spinal', 'dental', 'surgical_instruments')"
            },
            query: { 
              type: "string", 
              description: "Search query for product name or description"
            },
            limit: { type: "number", description: "Maximum products to return (default: 5)" }
          },
          required: []
        }
      }
    },
    {
      type: "function",
      function: {
        name: "generate_image",
        description: "Generate a custom image for a carousel slide using AI. Use this when no suitable product image exists.",
        parameters: {
          type: "object",
          properties: {
            prompt: { type: "string", description: "Detailed image generation prompt" },
            headline: { type: "string", description: "Headline text to burn into the image" },
            body_text: { type: "string", description: "Body text to burn into the image" },
            style: { 
              type: "string", 
              enum: ["client_perspective", "technical_proof", "abstract_premium", "product_showcase"],
              description: "Visual style direction"
            }
          },
          required: ["prompt", "headline", "body_text"]
        }
      }
    },
    {
      type: "function",
      function: {
        name: "search_assets",
        description: "Search for REAL company assets (cleanroom photos, equipment images, facility photos). USE THIS FIRST before generating AI images. Available categories: 'facilities' (cleanroom, reception, factory), 'equipment' (CNC machines, electropolishing), 'industrial' (general factory shots).",
        parameters: {
          type: "object",
          properties: {
            category: { 
              type: "string", 
              description: "Asset category: 'facilities' (cleanroom, reception, factory), 'equipment' (CNC, machinery), 'industrial' (general)"
            },
            tags: { 
              type: "array", 
              items: { type: "string" }, 
              description: "Tags to filter: cleanroom, iso7, cnc, citizen, reception, factory, machinery, etc." 
            },
            semantic_search: {
              type: "string",
              description: "Natural language description of what you need (e.g., 'foto da sala limpa', 'máquina CNC')"
            }
          },
          required: []
        }
      }
    }
  ]
};

// Tool execution functions
export async function executeToolCall(
  toolName: string,
  params: any,
  context: { supabase: any; lovableApiKey: string }
): Promise<any> {
  const { supabase, lovableApiKey } = context;

  switch (toolName) {
    case "query_knowledge":
      return await queryKnowledge(params, supabase);
    
    case "search_industry_data":
      return await searchIndustryData(params, supabase);
    
    case "list_product_categories":
      return await listProductCategories(supabase);
    
    case "get_hook_examples":
      return await getHookExamples(params);
    
    case "search_products":
      return await searchProducts(params, supabase);
    
    case "generate_image":
      return await generateImage(params, lovableApiKey, supabase);
    
    case "search_assets":
      return await searchAssets(params, supabase);
    
    case "deep_research":
      return await deepResearch(params);
    
    default:
      return { error: `Unknown tool: ${toolName}` };
  }
}

// Query Knowledge Base using text search (no embeddings needed)
async function queryKnowledge(
  params: { query: string; source_type?: string; max_results?: number },
  supabase: any
): Promise<any> {
  try {
    console.log(`🔍 Querying knowledge base: "${params.query}" (source: ${params.source_type || "all"})`);
    
    // Build search terms from query
    const searchTerms = params.query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
    
    // Get all documents matching the source type filter
    let query = supabase
      .from("knowledge_embeddings")
      .select("id, content, source_type, source_id, metadata");
    
    if (params.source_type) {
      query = query.eq("source_type", params.source_type);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    if (!data || data.length === 0) {
      console.log("⚠️ No documents in knowledge base");
      return { results: [], query: params.query, message: "Knowledge base is empty. Please populate it first." };
    }
    
    // Score documents by relevance (simple keyword matching)
    const scoredDocs = data.map((doc: any) => {
      const contentLower = doc.content.toLowerCase();
      const metadataKeywords = (doc.metadata?.keywords || []).join(" ").toLowerCase();
      
      let score = 0;
      for (const term of searchTerms) {
        // Check content
        const contentMatches = (contentLower.match(new RegExp(term, 'g')) || []).length;
        score += contentMatches * 2;
        
        // Check keywords (higher weight)
        if (metadataKeywords.includes(term)) {
          score += 5;
        }
        
        // Check source_id
        if (doc.source_id.toLowerCase().includes(term)) {
          score += 3;
        }
      }
      
      return { ...doc, score };
    });
    
    // Sort by score and take top results
    const topResults = scoredDocs
      .filter((d: any) => d.score > 0)
      .sort((a: any, b: any) => b.score - a.score)
      .slice(0, params.max_results || 5);
    
    console.log(`✅ Found ${topResults.length} relevant documents`);

    return {
      results: topResults.map((d: any) => ({
        content: d.content,
        source: `${d.source_type}/${d.source_id}`,
        relevance_score: d.score,
        category: d.metadata?.category,
      })),
      query: params.query,
      total_documents: data.length,
    };
  } catch (error: any) {
    console.error("Knowledge query error:", error);
    return { error: error.message, results: [] };
  }
}

// Search industry data by avatar
async function searchIndustryData(
  params: { avatar: string; topic?: string },
  supabase: any
): Promise<any> {
  try {
    console.log(`📊 Searching industry data for avatar: ${params.avatar}, topic: ${params.topic || "general"}`);
    
    // Map avatar to source_id patterns
    const avatarMappings: Record<string, string[]> = {
      orthopedic_oem: ["orthopedic_oem_pains", "medical_device_market_brazil", "global_supply_chain_trends", "import_vs_local"],
      dental_oem: ["dental_oem_pains", "medical_device_market_brazil", "global_supply_chain_trends", "import_vs_local"],
      veterinary_oem: ["veterinary_oem_pains", "medical_device_market_brazil", "import_vs_local"],
      surgical_instruments: ["surgical_instruments_pains", "medical_device_market_brazil", "import_vs_local"],
      general: ["medical_device_market_brazil", "global_supply_chain_trends", "import_vs_local"],
    };
    
    const relevantSourceIds = avatarMappings[params.avatar] || avatarMappings.general;
    
    // Query for relevant documents
    const { data, error } = await supabase
      .from("knowledge_embeddings")
      .select("content, source_type, source_id, metadata")
      .in("source_id", relevantSourceIds);
    
    if (error) throw error;
    
    let results = data || [];
    
    // If topic is provided, filter further
    if (params.topic && results.length > 0) {
      const topicLower = params.topic.toLowerCase();
      results = results.filter((d: any) => 
        d.content.toLowerCase().includes(topicLower) ||
        (d.metadata?.keywords || []).some((k: string) => k.toLowerCase().includes(topicLower))
      );
    }
    
    console.log(`✅ Found ${results.length} industry data documents`);
    
    return {
      avatar: params.avatar,
      topic: params.topic,
      documents: results.map((d: any) => ({
        content: d.content,
        source: `${d.source_type}/${d.source_id}`,
        category: d.metadata?.category,
      })),
    };
  } catch (error: any) {
    console.error("Industry data search error:", error);
    return { error: error.message, documents: [] };
  }
}

// List product categories
async function listProductCategories(supabase: any): Promise<any> {
  const { data, error } = await supabase
    .from("processed_product_images")
    .select("category")
    .eq("is_visible", true);

  if (error) return { error: error.message };

  const categories = [...new Set(data?.map((d: any) => d.category) || [])];
  return { categories };
}

// Get hook examples
async function getHookExamples(params: { hook_type?: string }): Promise<any> {
  const hookExamples: Record<string, string[]> = {
    label: [
      "OEMs Ortopédicos: Reduza risco de recall em 30 dias",
      "Engenheiros de Dispositivos Médicos: Pare de 'babysitar' seu fornecedor de usinagem",
      "Gerentes de Qualidade: Documentação que se vende sozinha para auditores",
    ],
    yes_question: [
      "Você cortaria 60 dias do seu lead time de importação?",
      "Você lançaria novos SKUs sem ouvir 'não conseguimos fazer isso'?",
      "Você reduziria 25% do capital parado em estoque importado?",
    ],
    conditional: [
      "Se você ainda importa implantes de precisão, está pagando caro pelo risco",
      "Se seu fornecedor não mostra relatórios CMM, você tem um problema",
      "Se você coordena 4 fornecedores para um produto, existe um jeito melhor",
    ],
    command: [
      "Leia isso antes da sua próxima auditoria de fornecedor",
      "Pare de aceitar lead times de 90 dias",
      "Assista isso se já teve uma surpresa regulatória",
    ],
    narrative: [
      "Uma vez, um cliente nosso perdeu 6 meses por um lote ruim do exterior...",
      "Semana passada, um OEM nos perguntou: 'Vocês realmente fazem nível suíço no Brasil?'",
      "Um gerente de qualidade nos disse: 'Seus relatórios passaram nossa auditoria FDA'",
    ],
    list: [
      "5 formas que seu fornecedor importado está custando mais do que você pensa",
      "3 perguntas para fazer antes do seu próximo RFQ de componentes ortopédicos",
      "7 sinais de que seu fornecedor de usinagem não é realmente de precisão",
    ],
  };

  if (params.hook_type && hookExamples[params.hook_type]) {
    return { hook_type: params.hook_type, examples: hookExamples[params.hook_type] };
  }

  return { all_types: Object.keys(hookExamples), examples: hookExamples };
}

// Search products
async function searchProducts(
  params: { category?: string; query?: string; limit?: number },
  supabase: any
): Promise<any> {
  const { data, error } = await supabase.rpc("search_products_for_carousel", {
    search_category: params.category || null,
    search_query: params.query || null,
    limit_count: params.limit || 5,
  });

  if (error) return { error: error.message };

  return {
    products: data?.map((p: any) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      category: p.category,
      image_url: p.enhanced_url,
      brand: p.brand,
      model: p.model,
    })) || [],
  };
}

// Sanitize prompts: remove font names, sizes, and English text that might get rendered
function sanitizeImagePrompt(text: string): string {
  if (!text) return text;
  return text
    // Remove font names that get rendered in images
    .replace(/inter\s*(bold|semibold|regular|medium|light)?/gi, "")
    .replace(/fonte\s*[a-z]+\s*(bold|semibold)?/gi, "")
    // Remove pixel sizes
    .replace(/\d+\s*px/gi, "")
    .replace(/\d+\s*pt/gi, "")
    // Remove technical labels that get rendered
    .replace(/headline:/gi, "")
    .replace(/body\s*text:/gi, "")
    .replace(/visual:/gi, "")
    .replace(/context:/gi, "")
    .trim();
}

// Generate image with Nano Banana + Multimodal RAG (logo + products)
async function generateImage(
  params: { prompt: string; headline: string; body_text: string; style?: string; slide_type?: string; base_image_url?: string },
  lovableApiKey: string,
  supabase: any
): Promise<any> {
  const imageStartTime = Date.now();
  const style = params.style || "client_perspective";
  const slideType = params.slide_type || "content";
  const hasBaseImage = !!params.base_image_url;
  
  console.log(`\n         🖼️ [IMAGE-GEN] Starting ${hasBaseImage ? "image editing" : "generation"}`);
  console.log(`            └─ Style: ${style}, Type: ${slideType}`);
  console.log(`            └─ Headline: "${params.headline?.substring(0, 50)}..."`);
  if (hasBaseImage) {
    console.log(`            └─ Base image: ${params.base_image_url?.substring(0, 60)}...`);
  }
  
  // Fetch logo from company_assets
  const assetFetchStart = Date.now();
  const { data: logoAsset } = await supabase
    .from("company_assets")
    .select("url")
    .eq("type", "logo")
    .single();

  // Fetch visible product images for visual reference (only if no base image)
  let products: any[] = [];
  if (!hasBaseImage) {
    const { data } = await supabase
      .from("processed_product_images")
      .select("name, enhanced_url, category")
      .eq("is_visible", true)
      .limit(2);
    products = data || [];
  }
  
  const assetFetchTime = Date.now() - assetFetchStart;
  console.log(`            └─ Assets fetched in ${assetFetchTime}ms: { logo: ${!!logoAsset?.url}, products: ${products.length} }`);

  const styleDirections: Record<string, string> = {
    client_perspective: "Perspectiva do CLIENTE - engenheiros inspecionando peças de precisão, gerentes de qualidade revisando documentação, produção em sala limpa",
    technical_proof: "Close-up de maquinário de precisão, medições CMM ZEISS, certificações ISO em destaque",
    abstract_premium: "Estética médica/industrial abstrata com sensação premium, gradientes sutis, profissional",
    product_showcase: "Fotografia elegante de implantes médicos ou instrumentos em superfície premium",
  };

  // Truncate body text to max 15 words to avoid cluttered images
  const truncateToWords = (text: string, maxWords: number): string => {
    if (!text) return "";
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  // Adjust text density based on slide type
  const maxBodyWords = slideType === "hook" ? 8 : slideType === "cta" ? 10 : 15;
  const truncatedBody = truncateToWords(params.body_text, maxBodyWords);

  // Sanitize headline and body to avoid technical text in images
  const cleanHeadline = sanitizeImagePrompt(params.headline);
  const cleanBody = sanitizeImagePrompt(truncatedBody);
  const cleanPrompt = sanitizeImagePrompt(params.prompt);

  // Build prompt - different for base image editing vs generation
  let fullPrompt: string;
  
  if (hasBaseImage) {
    // IMAGE EDITING MODE: Apply branding and text overlay to real photo
    fullPrompt = `Edite esta foto real da empresa para criar um slide de LinkedIn premium.

=== AÇÃO PRINCIPAL ===
1. Aplique um overlay de gradiente escuro (#0A1628 → transparente) nas bordas para destacar o texto
2. Renderize o texto abaixo CENTRALIZADO na imagem, em fonte sans-serif BOLD BRANCA

=== TEXTO OBRIGATÓRIO (PT-BR) ===
TÍTULO: "${cleanHeadline}"
${cleanBody ? `SUBTEXTO: "${cleanBody}"` : ""}

=== REGRAS ABSOLUTAS ===
- TODO texto DEVE estar em PORTUGUÊS BRASILEIRO
- NUNCA escreva nomes de fontes (Inter, Arial, etc.) na imagem
- NUNCA escreva tamanhos (px, pt) na imagem
- NUNCA escreva labels como "HEADLINE:", "BODY:"
- Mantenha a foto original reconhecível
- Texto BRANCO com sombra sutil para legibilidade
- Espaço no canto inferior direito para logo`;
  } else {
    // GENERATION MODE: Create new image from scratch
    fullPrompt = `Crie um slide premium para carrossel LinkedIn (1080x1350px) - indústria médica B2B.

=== ESTILO VISUAL ===
- Paleta: Azul #004F8F (dominante), gradiente escuro #0A1628 → #003052
- Acentos: Verde #1A7A3E (micro), Laranja #F07818 (apenas CTAs)
- Estética: Premium editorial, tecnologia médica de ponta, profissional

=== PERSPECTIVA ===
${styleDirections[style] || styleDirections.client_perspective}

=== CONTEXTO VISUAL ===
${cleanPrompt}

=== TEXTO OBRIGATÓRIO (PT-BR) ===
TÍTULO (grande, bold, branco, centralizado): "${cleanHeadline}"
${cleanBody ? `SUBTEXTO (menor, abaixo): "${cleanBody}"` : ""}

=== REGRAS ABSOLUTAS ===
- TODO texto DEVE estar em PORTUGUÊS BRASILEIRO
- NUNCA escreva nomes de fontes (Inter, Arial, etc.) na imagem
- NUNCA escreva tamanhos (px, pt) na imagem  
- NUNCA escreva labels como "HEADLINE:", "BODY:", "VISUAL:"
- Texto BRANCO com alto contraste
- Layout limpo - o headline é a estrela
- Espaço no canto inferior direito para logo`;
  }

  // Add visual references notes
  if (logoAsset?.url) {
    fullPrompt += "\n\n[ANEXO: Logo da empresa - usar EXATA no canto inferior direito]";
  }
  if (products.length > 0) {
    fullPrompt += `\n\n[ANEXO: ${products.length} imagens de produtos como referência de estilo]`;
  }

  // Retry helper function
  async function callWithRetry(content: any, maxRetries = 3): Promise<Response | null> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image-preview",
            messages: [{ role: "user", content }],
            modalities: ["image", "text"],
          }),
        });
        
        if (res.status === 429) {
          console.warn(`         ⏳ Rate limited on attempt ${attempt}, waiting ${attempt * 2}s...`);
          await new Promise(r => setTimeout(r, attempt * 2000));
          continue;
        }
        if (res.ok) return res;
        
        console.warn(`         ⚠️ Attempt ${attempt} failed: ${res.status}`);
      } catch (e: any) {
        console.error(`         ❌ Attempt ${attempt} error: ${e.message}`);
      }
      
      if (attempt < maxRetries) {
        await new Promise(r => setTimeout(r, attempt * 1000));
      }
    }
    return null;
  }

  try {
    // Build multimodal content array
    type ContentPart = 
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } };

    const userContent: ContentPart[] = [
      { type: "text", text: fullPrompt }
    ];

    // Add logo as visual reference for replication
    if (logoAsset?.url) {
      userContent.push({
        type: "image_url",
        image_url: { url: logoAsset.url }
      });
    }

    // Add product images as visual reference (max 2)
    if (products?.length) {
      for (const product of products.slice(0, 2)) {
        if (product.enhanced_url) {
          userContent.push({
            type: "image_url",
            image_url: { url: product.enhanced_url }
          });
        }
      }
    }

    const apiCallStart = Date.now();
    console.log(`            └─ Calling AI Gateway with retry (model: google/gemini-3-pro-image-preview)...`);
    
    // Use retry logic
    const response = await callWithRetry(userContent);

    const apiCallTime = Date.now() - apiCallStart;
    console.log(`            └─ API Response: ${response?.status || 'failed'} in ${apiCallTime}ms`);

    if (!response || !response.ok) {
      if (response) {
        const errorBody = await response.text();
        console.error(`            ❌ [IMAGE-GEN] API Error ${response.status}:`);
        console.error(`               Body: ${errorBody.substring(0, 500)}`);
        throw new Error(`Image generation error: ${response.status} - ${errorBody.substring(0, 200)}`);
      }
      throw new Error("All retry attempts failed");
    }

    const data = await response.json();
    let imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    // If we have a base image and logo, overlay the real logo via image editing
    if (imageUrl && logoAsset?.url) {
      try {
        console.log(`            └─ Overlaying real logo via image editing...`);
        const overlayRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image-preview",
            messages: [{
              role: "user",
              content: [
                { type: "text", text: "Add this company logo to the bottom-right corner of the slide image. Keep the logo clear, professional, and properly sized (not too large, about 80-100px). Maintain the original image quality." },
                { type: "image_url", image_url: { url: imageUrl } },
                { type: "image_url", image_url: { url: logoAsset.url } }
              ]
            }],
            modalities: ["image", "text"],
          }),
        });
        
        if (overlayRes.ok) {
          const overlayData = await overlayRes.json();
          const overlayedUrl = overlayData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
          if (overlayedUrl) {
            imageUrl = overlayedUrl;
            console.log(`            ✅ Logo overlay successful`);
          }
        }
      } catch (logoErr: any) {
        console.warn(`            ⚠️ Logo overlay failed, using base image: ${logoErr.message}`);
      }
    }
    
    const totalImageTime = Date.now() - imageStartTime;
    if (imageUrl) {
      console.log(`            ✅ [IMAGE-GEN] Success in ${totalImageTime}ms (API: ${apiCallTime}ms)`);
    } else {
      console.warn(`            ⚠️ [IMAGE-GEN] No image in response after ${totalImageTime}ms`);
      console.warn(`               Response structure: ${JSON.stringify(Object.keys(data || {}))}`);
    }

    return { image_url: imageUrl, prompt_used: fullPrompt };
  } catch (error: any) {
    const totalImageTime = Date.now() - imageStartTime;
    console.error(`            ❌ [IMAGE-GEN] Exception after ${totalImageTime}ms: ${error.message}`);
    return { error: error.message };
  }
}

// Search assets with semantic category mapping and fallback to processed_product_images
async function searchAssets(
  params: { category?: string; tags?: string[]; semantic_search?: string },
  supabase: any
): Promise<any> {
  console.log(`🔍 [SEARCH-ASSETS] Searching for category: ${params.category}, tags: ${params.tags?.join(", ") || "none"}, semantic: ${params.semantic_search || "none"}`);
  
  // Semantic category mapping - maps natural language to database categories and tags
  // Updated to include office and new categories from website-assets
  const semanticMapping: Record<string, { categories: string[]; tags: string[] }> = {
    // Portuguese terms - Facilities
    "sala limpa": { categories: ["cleanroom", "facilities"], tags: ["cleanroom", "iso7", "sala_limpa", "qualidade"] },
    "cleanroom": { categories: ["cleanroom", "facilities"], tags: ["cleanroom", "iso7", "sala_limpa", "qualidade"] },
    "sala_limpa": { categories: ["cleanroom", "facilities"], tags: ["cleanroom", "iso7", "qualidade"] },
    "recepção": { categories: ["facilities", "office"], tags: ["reception", "recepção", "office", "lobby", "escritorio"] },
    "reception": { categories: ["facilities", "office"], tags: ["reception", "recepção", "office", "lobby"] },
    "escritorio": { categories: ["office", "facilities"], tags: ["office", "escritorio", "reception", "facilities"] },
    "escritório": { categories: ["office", "facilities"], tags: ["office", "escritorio", "reception", "facilities"] },
    "office": { categories: ["office", "facilities"], tags: ["office", "escritorio", "reception", "facilities"] },
    "fábrica": { categories: ["facilities"], tags: ["factory", "fabrica", "exterior", "building"] },
    "fabrica": { categories: ["facilities"], tags: ["factory", "fabrica", "exterior", "building"] },
    "factory": { categories: ["facilities"], tags: ["factory", "fabrica", "exterior", "building"] },
    "instalações": { categories: ["facilities", "office", "cleanroom"], tags: ["factory", "reception", "hero", "office", "cleanroom"] },
    "facilities": { categories: ["facilities", "office", "cleanroom"], tags: ["hero", "factory", "cleanroom", "office"] },
    // Equipment terms
    "cnc": { categories: ["equipment"], tags: ["cnc", "citizen", "machinery", "equipment"] },
    "máquina": { categories: ["equipment"], tags: ["cnc", "machinery", "citizen", "equipment"] },
    "maquina": { categories: ["equipment"], tags: ["cnc", "machinery", "citizen", "equipment"] },
    "torno": { categories: ["equipment"], tags: ["cnc", "swiss_turn", "citizen", "equipment"] },
    "equipment": { categories: ["equipment"], tags: ["cnc", "machinery", "citizen", "equipment"] },
    "equipamento": { categories: ["equipment"], tags: ["cnc", "machinery", "finishing", "equipment"] },
    "citizen": { categories: ["equipment"], tags: ["citizen", "cnc", "l20", "m32", "equipment"] },
    "eletropolimento": { categories: ["equipment"], tags: ["electropolishing", "finishing", "surface_treatment", "equipment"] },
    // Product terms
    "implante": { categories: ["product", "products", "medical_spinal"], tags: ["implant", "spinal", "medical", "produto"] },
    "produto": { categories: ["product", "products"], tags: ["produto", "processado", "product"] },
    "products": { categories: ["product", "products", "dental", "veterinary"], tags: ["implant", "medical", "produto"] },
    // General
    "hero": { categories: ["facilities", "cleanroom"], tags: ["hero", "principal"] },
    "qualidade": { categories: ["cleanroom", "facilities", "equipment"], tags: ["cleanroom", "iso7", "cnc", "qualidade"] },
    "infraestrutura": { categories: ["facilities", "office", "cleanroom"], tags: ["factory", "cleanroom", "reception", "office"] },
    // Team
    "equipe": { categories: ["team"], tags: ["team", "equipe", "people"] },
    "team": { categories: ["team"], tags: ["team", "equipe", "people"] },
  };

  // Determine categories and tags from semantic search or explicit params
  let searchCategories: string[] = [];
  let searchTags: string[] = params.tags || [];
  
  // Process semantic search term
  if (params.semantic_search) {
    const semanticLower = params.semantic_search.toLowerCase();
    for (const [keyword, mapping] of Object.entries(semanticMapping)) {
      if (semanticLower.includes(keyword)) {
        searchCategories.push(...mapping.categories);
        searchTags.push(...mapping.tags);
      }
    }
  }
  
  // Process explicit category with mapping
  if (params.category) {
    const categoryLower = params.category.toLowerCase();
    if (semanticMapping[categoryLower]) {
      searchCategories.push(...semanticMapping[categoryLower].categories);
      searchTags.push(...semanticMapping[categoryLower].tags);
    } else {
      searchCategories.push(params.category);
    }
  }
  
  // Remove duplicates
  searchCategories = [...new Set(searchCategories)];
  searchTags = [...new Set(searchTags)];
  
  console.log(`   └─ Expanded search: categories=[${searchCategories.join(", ")}], tags=[${searchTags.join(", ")}]`);
  
  // Build query for content_assets
  let query = supabase
    .from("content_assets")
    .select("id, filename, file_path, category, tags")
    .limit(15);

  // Filter by categories (OR logic)
  if (searchCategories.length > 0) {
    query = query.in("category", searchCategories);
  }

  const { data: contentAssets, error: contentError } = await query;

  if (contentError) {
    console.error(`❌ [SEARCH-ASSETS] content_assets error: ${contentError.message}`);
  }

  let assets = contentAssets || [];
  
  // Score and sort by tag match relevance
  if (searchTags.length > 0) {
    assets = assets.map((a: any) => {
      const assetTags = a.tags || [];
      const matchScore = searchTags.filter(tag => 
        assetTags.some((at: string) => at.toLowerCase().includes(tag.toLowerCase()))
      ).length;
      return { ...a, matchScore };
    });
    
    // Sort by match score and filter to only those with matches
    assets = assets.filter((a: any) => a.matchScore > 0);
    assets.sort((a: any, b: any) => b.matchScore - a.matchScore);
  }

  // If no content_assets found, fallback to processed_product_images
  if (assets.length === 0) {
    console.log(`🔄 [SEARCH-ASSETS] No content_assets found, falling back to processed_product_images`);
    
    let productQuery = supabase
      .from("processed_product_images")
      .select("id, name, enhanced_url, category, description")
      .eq("is_visible", true)
      .limit(10);
    
    if (params.category) {
      productQuery = productQuery.ilike("category", `%${params.category}%`);
    }
    
    const { data: products, error: productError } = await productQuery;
    
    if (productError) {
      console.error(`❌ [SEARCH-ASSETS] processed_product_images error: ${productError.message}`);
      return { assets: [], error: productError.message };
    }
    
    // Map products to asset format
    assets = (products || []).map((p: any) => ({
      id: p.id,
      filename: p.name,
      file_path: p.enhanced_url,
      category: p.category,
      tags: [p.category, "produto", "processado"],
      source: "processed_product_images"
    }));
    
    console.log(`✅ [SEARCH-ASSETS] Found ${assets.length} products as fallback`);
  } else {
    console.log(`✅ [SEARCH-ASSETS] Found ${assets.length} content_assets (best match: ${assets[0]?.filename})`);
  }

  return { 
    assets,
    searchedCategories: searchCategories,
    searchedTags: searchTags,
    totalFound: assets.length
  };
}

// Deep research using Perplexity API
async function deepResearch(
  params: { query: string; focus?: string }
): Promise<any> {
  const perplexityApiKey = Deno.env.get("PERPLEXITY_API_KEY");
  
  if (!perplexityApiKey) {
    console.error("❌ [DEEP-RESEARCH] PERPLEXITY_API_KEY not configured");
    return { error: "Perplexity API key not configured", content: null };
  }
  
  console.log(`🔬 [DEEP-RESEARCH] Query: "${params.query}", Focus: ${params.focus || "general"}`);
  const startTime = Date.now();
  
  const focusPrompts: Record<string, string> = {
    industry_trends: "Focus on current industry trends, market movements, and emerging technologies.",
    competitor_analysis: "Focus on competitor landscape, market positioning, and competitive advantages.",
    market_data: "Focus on market size, growth rates, statistics, and quantitative data.",
    technical_info: "Focus on technical specifications, engineering details, and manufacturing processes.",
    news: "Focus on recent news, announcements, and developments from the past month.",
    regulatory: "Focus on regulatory requirements, FDA/ANVISA updates, compliance standards, and certification processes.",
  };
  
  const systemPrompt = `You are a research assistant for Lifetrek Medical, a precision medical device manufacturer in Brazil.
${focusPrompts[params.focus || ""] || "Provide comprehensive, factual information."}

Context: The company specializes in Swiss-quality CNC machining of orthopedic, dental, and spinal implants.
Target audience: Medical device OEMs, quality managers, and procurement professionals.

Return concise, actionable insights with specific data points when available.
Language: Portuguese (Brazil) preferred, English acceptable for technical terms.
Format: Use bullet points for clarity.`;

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${perplexityApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sonar",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: params.query }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ [DEEP-RESEARCH] API error ${response.status}: ${errorText.substring(0, 200)}`);
      return { error: `Perplexity API error: ${response.status}`, content: null };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    const citations = data.citations || [];
    
    const duration = Date.now() - startTime;
    console.log(`✅ [DEEP-RESEARCH] Completed in ${duration}ms, ${citations.length} citations`);

    return {
      content,
      citations,
      query: params.query,
      focus: params.focus,
      duration_ms: duration
    };
  } catch (error: any) {
    console.error(`❌ [DEEP-RESEARCH] Exception: ${error.message}`);
    return { error: error.message, content: null };
  }
}
