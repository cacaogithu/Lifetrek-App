// Agent Tools for LinkedIn Carousel Generation
// These tools are available to Strategist, Copywriter, and Designer agents

// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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
        description: "Search for existing content assets (backgrounds, logos, etc.)",
        parameters: {
          type: "object",
          properties: {
            category: { type: "string", description: "Asset category" },
            tags: { type: "array", items: { type: "string" }, description: "Tags to filter by" }
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

// Generate image with Nano Banana + Multimodal RAG (logo + products)
async function generateImage(
  params: { prompt: string; headline: string; body_text: string; style?: string; slide_type?: string },
  lovableApiKey: string,
  supabase: any
): Promise<any> {
  const imageStartTime = Date.now();
  const style = params.style || "client_perspective";
  const slideType = params.slide_type || "content";
  
  console.log(`\n         🖼️ [IMAGE-GEN] Starting generation`);
  console.log(`            └─ Style: ${style}, Type: ${slideType}`);
  console.log(`            └─ Headline: "${params.headline?.substring(0, 50)}..."`);
  
  // Fetch logo from company_assets
  const assetFetchStart = Date.now();
  const { data: logoAsset } = await supabase
    .from("company_assets")
    .select("url")
    .eq("type", "logo")
    .single();

  // Fetch visible product images for visual reference
  const { data: products } = await supabase
    .from("processed_product_images")
    .select("name, enhanced_url, category")
    .eq("is_visible", true)
    .limit(2);
  
  const assetFetchTime = Date.now() - assetFetchStart;
  console.log(`            └─ Assets fetched in ${assetFetchTime}ms: { logo: ${!!logoAsset?.url}, products: ${products?.length || 0} }`);

  const styleDirections: Record<string, string> = {
    client_perspective: "Show the CLIENT'S experience - engineers inspecting precision parts, quality managers reviewing documentation, cleanroom production",
    technical_proof: "Close-up of precision machinery, ZEISS CMM measurements, ISO certifications displayed prominently",
    abstract_premium: "Abstract medical/industrial aesthetic with premium feel, subtle gradients, professional",
    product_showcase: "Elegant product photography of medical implants or instruments on premium surface",
  };

  // Truncate body text to max 15 words to avoid cluttered images
  const truncateToWords = (text: string, maxWords: number): string => {
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(" ") + "...";
  };

  // Adjust text density based on slide type
  const maxBodyWords = slideType === "hook" ? 8 : slideType === "cta" ? 10 : 15;
  const truncatedBody = truncateToWords(params.body_text, maxBodyWords);

  let fullPrompt = `Create a premium LinkedIn carousel slide (1080x1080) for B2B medical device industry.

PERSPECTIVE: ${styleDirections[style] || styleDirections.client_perspective}

CONTEXT: ${params.prompt}

HEADLINE (burn into image, LARGE white bold text, centered): "${params.headline}"
${truncatedBody ? `BODY TEXT (burn into image, SMALLER white text below headline, max 2 lines): "${truncatedBody}"` : ""}

VISUAL STYLE:
- Premium feel: deep blue gradient (#003052 to #004080), white text, green accent (#228B22)
- Editorial, informative, NOT salesy
- HIGH CONTRAST text must be CLEARLY READABLE
- MINIMAL text - let the visual speak

LAYOUT:
- Center-focused: Large, bold headline (Inter Bold equivalent)
- Below headline: Green accent line
- Below line: Short body text if needed (Inter Regular)
- Bottom-right: Company logo (use the EXACT attached logo image)

CRITICAL: Keep text MINIMAL. The headline is the star. Body text should be very short or omitted if headline is strong enough.
The text MUST be part of the image (burned in), not overlaid.`;

  // Add visual references notes
  if (logoAsset?.url) {
    fullPrompt += "\n\nATTACHED: Company logo - use this EXACT logo in bottom-right corner of the image.";
  }
  if (products?.length) {
    fullPrompt += `\n\nATTACHED: ${products.length} product reference images. These are real medical device products - use their style/aesthetic as inspiration.`;
  }

  try {
    // Build multimodal content array
    type ContentPart = 
      | { type: "text"; text: string }
      | { type: "image_url"; image_url: { url: string } };

    const userContent: ContentPart[] = [
      { type: "text", text: fullPrompt }
    ];

    // Add logo as visual reference
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
    console.log(`            └─ Calling AI Gateway (model: google/gemini-3-pro-image-preview)...`);
    
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [{ role: "user", content: userContent }],
        modalities: ["image", "text"],
      }),
    });

    const apiCallTime = Date.now() - apiCallStart;
    console.log(`            └─ API Response: ${response.status} in ${apiCallTime}ms`);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`            ❌ [IMAGE-GEN] API Error ${response.status}:`);
      console.error(`               Body: ${errorBody.substring(0, 500)}`);
      throw new Error(`Image generation error: ${response.status} - ${errorBody.substring(0, 200)}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
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

// Search assets
async function searchAssets(
  params: { category?: string; tags?: string[] },
  supabase: any
): Promise<any> {
  let query = supabase
    .from("content_assets")
    .select("id, filename, file_path, category, tags")
    .limit(10);

  if (params.category) {
    query = query.eq("category", params.category);
  }

  const { data, error } = await query;

  if (error) return { error: error.message };

  let assets = data || [];
  
  // Filter by tags if provided
  if (params.tags && params.tags.length > 0) {
    assets = assets.filter((a: any) => 
      a.tags?.some((t: string) => params.tags!.includes(t))
    );
  }

  return { assets };
}
