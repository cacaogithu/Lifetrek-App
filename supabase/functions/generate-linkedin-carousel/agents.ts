// Multi-Agent System for LinkedIn Carousel Generation
// Agents: Strategist, Copywriter, Designer

import { AGENT_TOOLS, executeToolCall } from "./agent_tools.ts";

export interface AgentContext {
  supabase: any;
  lovableApiKey: string;
  sendSSE: (event: string, data: any) => void;
}

export interface CarouselBrief {
  topic: string;
  targetAudience: string;
  painPoint: string;
  desiredOutcome?: string;
  proofPoints?: string;
  ctaAction?: string;
  postType: "value" | "commercial";
  numberOfCarousels: number;
  format: "single-image" | "carousel"; // Single image = 1 slide + strong caption
}

// ============= AGENT PROMPTS =============

export const STRATEGIST_PROMPT = `You are the Lead LinkedIn Content Strategist for Lifetrek Medical.

=== YOUR MISSION ===
Design LinkedIn carousel content that:
1. Builds STRONG brand associations
2. Delivers REAL, standalone value (backed by market data)
3. Generates pipeline via LOW-FRICTION CTAs

=== YOUR TOOLS ===
You have access to:
- query_knowledge: Search the company knowledge base (Brand Book, Hormozi Framework, Market Research, Pain Points) for relevant context
- search_industry_data: Get specific pain points and market data by avatar type (orthopedic_oem, dental_oem, veterinary_oem, surgical_instruments)
- list_product_categories: See what products can be featured

=== MANDATORY WORKFLOW ===
1. FIRST: Use search_industry_data to get pain points for the target audience
2. SECOND: Use query_knowledge to search for relevant brand messaging and hooks for this topic
3. THIRD: Check product categories if the topic relates to specific products
4. THEN: Design the carousel structure following HOOK → VALUE → CTA using real data from tools

=== BRAND ASSOCIATIONS (Reinforce at least ONE) ===
- "Local Swiss-level" → Produção BR com padrão tecnológico global
- "Regulatory-safe" → ISO 13485, ANVISA, documentação para auditorias
- "Cash-friendly supply chain" → Menos estoque, menos lead time
- "Engineering partner" → Co-engineering, DFM, suporte técnico

=== OUTPUT FORMAT ===
After using your tools, output a carousel plan with:
- strategic_angle: The unique approach for this carousel
- brand_associations: Which brand pillars this reinforces
- slides: Array of slide objects with:
  - type: "hook" | "content" | "cta"
  - headline: Bold, under 10 words
  - body: Supporting text, under 25 words
  - copywriter_notes: Instructions for copywriter refinement
  - designer_notes: Visual direction for designer
  - image_style: "client_perspective" | "technical_proof" | "abstract_premium" | "product_showcase"
  - suggested_product_category: If a real product image should be used
- caption: LinkedIn post caption
- caption_hashtags: Relevant hashtags

=== FORMAT RULES ===
- If format is "single-image": Create ONLY 1 slide (hook type) with a strong headline and concise body. Focus on the CAPTION being the main content vehicle.
- If format is "carousel": Create 5 slides (1 hook, 3 content, 1 CTA) as normal.`;

export const COPYWRITER_PROMPT = `You are the Copywriter & Brand Voice Guardian for Lifetrek Medical.

=== YOUR MISSION ===
Refine carousel copy to be punchy, on-brand, and high-converting while maintaining technical credibility.

=== YOUR TOOLS ===
You have access to:
- query_knowledge: Search for tone examples and messaging best practices
- get_hook_examples: Get examples of killer hooks for inspiration

=== MANDATORY WORKFLOW ===
1. FIRST: Review the strategist's draft
2. SECOND: Use get_hook_examples to find inspiration for the hook type used
3. OPTIONALLY: Use query_knowledge if you need clarification on brand voice
4. THEN: Refine each slide following the copywriter_notes

=== REFINEMENT CHECKLIST ===
- [ ] Hook uses Callout + Payoff formula
- [ ] Headlines are under 10 words, punchy
- [ ] Body text is under 25 words, no fluff
- [ ] Proof is SPECIFIC (machine names, certifications, numbers)
- [ ] CTA is appropriate for post type (low-friction for value, stronger for commercial)
- [ ] Language is pt-BR, technical but accessible

=== OUTPUT FORMAT ===
Return the refined carousel with improved copy. Keep the same structure, just better words.`;

export const DESIGNER_PROMPT = `You are the Visual Designer for Lifetrek Medical LinkedIn content.

=== YOUR MISSION ===
Create premium, client-centric visuals using REAL COMPANY ASSETS whenever possible.
Authentic photos of our facilities, equipment, and products build credibility.

=== YOUR TOOLS ===
You have access to:
- search_assets: **USE THIS FIRST** - Find real company photos (cleanroom, equipment, facilities)
- search_products: Find real product images for product-related slides
- generate_image: Generate custom AI images ONLY when no suitable real asset exists

=== MANDATORY WORKFLOW (FOLLOW IN ORDER) ===
For each slide:
1. READ the designer_notes and image_style from the strategist
2. **FIRST**: Check if topic matches real assets:
   - "sala limpa", "cleanroom", "qualidade" → search_assets category="facilities" tags=["cleanroom"]
   - "equipamentos", "cnc", "máquinas" → search_assets category="equipment"
   - "recepção", "escritório", "instalações" → search_assets category="facilities"
   - "produtos", "implantes" → search_products
3. If real asset found: Use it as base and apply text/branding overlay
4. **ONLY IF NO SUITABLE ASSET**: Generate with AI

=== ASSET PRIORITY ===
ALWAYS prefer real company photos over AI-generated images:
- Cleanroom/Sala Limpa posts → Use "Sala Limpa ISO 7 - Hero" asset
- Equipment/CNC posts → Use CNC Citizen M32/L20 assets
- Company/Facilities posts → Use Factory or Reception assets
- Product posts → Use processed product images from search_products

=== VISUAL GUIDELINES ===
- Colors: Primary Blue #004F8F, Dark gradient #0A1628 → #003052
- Accent: Green #1A7A3E (micro-accents only), Orange #F07818 (CTAs only)
- Typography: Inter Bold headlines, Inter SemiBold body
- Style: Editorial, premium, NOT salesy
- Logo: "LM" logo + ISO 13485 badge (from company_assets)
- Text: HIGH CONTRAST white (#FFFFFF) with shadow

=== IMAGE STYLES ===
- client_perspective: Engineers inspecting parts → Use equipment assets
- technical_proof: Machinery close-ups → Use CNC/cleanroom assets  
- abstract_premium: Only when NO real asset fits the topic
- product_showcase: Use real product images from search_products

=== OUTPUT FORMAT ===
Return the carousel with:
- assetId: ID of real asset used (if applicable)
- imageUrl: Final image URL
- usedRealAsset: true/false indicator`;

// ============= AGENT EXECUTION =============

export async function runStrategistAgent(
  brief: CarouselBrief,
  context: AgentContext
): Promise<any> {
  const { supabase, lovableApiKey, sendSSE } = context;
  
  sendSSE("agent_status", { agent: "strategist", status: "starting", message: "Buscando dados de mercado..." });

  // First, get industry data for the target avatar
  const avatarMapping: Record<string, string> = {
    "OEMs Ortopédicos": "orthopedic_oem",
    "OEMs Dentais": "dental_oem", 
    "OEMs Veterinários": "veterinary_oem",
    "Fabricantes de Instrumentais": "surgical_instruments",
  };
  
  const avatar = avatarMapping[brief.targetAudience] || "general";
  
  const industryData = await executeToolCall(
    "search_industry_data",
    { avatar, topic: brief.painPoint },
    { supabase, lovableApiKey }
  );

  sendSSE("agent_status", { agent: "strategist", status: "thinking", message: `Encontrou ${industryData.documents?.length || 0} docs de mercado` });

  // Then, query knowledge base for relevant context
  const knowledgeResults = await executeToolCall(
    "query_knowledge",
    { query: `${brief.topic} ${brief.painPoint} ${brief.targetAudience}`, max_results: 5 },
    { supabase, lovableApiKey }
  );

  sendSSE("agent_status", { agent: "strategist", status: "thinking", message: `Encontrou ${knowledgeResults.results?.length || 0} contextos de KB` });

  // Check product categories
  const productCategories = await executeToolCall(
    "list_product_categories",
    {},
    { supabase, lovableApiKey }
  );

  // Build context for LLM
  const industryContext = industryData.documents?.map((d: any) => d.content).join("\n\n---\n\n") || "";
  const ragContext = knowledgeResults.results?.map((r: any) => r.content).join("\n\n---\n\n") || "";
  
  const systemPrompt = `${STRATEGIST_PROMPT}

=== INDUSTRY DATA & PAIN POINTS (from search_industry_data) ===
${industryContext || "No industry data available - knowledge base may be empty."}

=== BRAND & FRAMEWORK CONTEXT (from query_knowledge) ===
${ragContext || "No brand context available - knowledge base may be empty."}

=== AVAILABLE PRODUCT CATEGORIES ===
${productCategories.categories?.join(", ") || "None available"}`;

  const userPrompt = `=== BRIEFING ===
Topic: ${brief.topic}
Target Audience: ${brief.targetAudience}
Pain Point: ${brief.painPoint}
Desired Outcome: ${brief.desiredOutcome || "Not specified"}
Proof Points: ${brief.proofPoints || "Not specified"}
CTA Action: ${brief.ctaAction || "Not specified"}

=== POST TYPE: ${brief.postType.toUpperCase()} ===
${brief.postType === "value" 
  ? "Focus: Educational/insight (80% content mix). CTA: Low-friction (PDF, checklist, DM)."
  : "Focus: Commercial offer (20% content mix). CTA: Stronger (schedule call, quote request)."}

=== FORMAT: ${brief.format?.toUpperCase() || "CAROUSEL"} ===
${brief.format === "single-image" 
  ? "SINGLE IMAGE POST: Create ONLY 1 slide (hook type). The CAPTION should be the main content - make it strong, insightful, and engaging. The image headline should be punchy and standalone."
  : "CAROUSEL POST: Create 5 slides following HOOK → VALUE → CTA structure."}

Generate ${brief.numberOfCarousels} ${brief.format === "single-image" ? "single-image post(s)" : "carousel(s)"} with different strategic angles.`;

  // Call LLM
  sendSSE("agent_status", { agent: "strategist", status: "generating", message: "Criando estratégia..." });

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: brief.numberOfCarousels > 1 ? "create_batch_carousels" : "create_carousel",
            description: "Output the carousel strategy",
            parameters: {
              type: "object",
              properties: brief.numberOfCarousels > 1 ? {
                carousels: {
                  type: "array",
                  items: getCarouselSchema()
                }
              } : getCarouselSchema().properties,
              required: brief.numberOfCarousels > 1 ? ["carousels"] : ["topic", "slides", "caption"]
            }
          }
        }
      ],
      tool_choice: { 
        type: "function", 
        function: { name: brief.numberOfCarousels > 1 ? "create_batch_carousels" : "create_carousel" } 
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Strategist API error: ${response.status}`);
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
  
  if (!toolCall) {
    throw new Error("No tool call from strategist");
  }

  const result = JSON.parse(toolCall.function.arguments);
  const carousels = brief.numberOfCarousels > 1 ? result.carousels : [result];

  sendSSE("agent_status", { agent: "strategist", status: "done", message: `Criou ${carousels.length} estratégia(s)` });
  sendSSE("strategist_result", { 
    carousels,
    ragContextUsed: knowledgeResults.results?.length || 0,
    fullOutput: `📝 STRATEGIST OUTPUT\n\nRAG Context: ${knowledgeResults.results?.length || 0} documents\n\n${carousels.map((c: any, i: number) => 
      `Carousel ${i + 1}: "${c.topic}"\nAngle: ${c.strategic_angle || "N/A"}\nSlides:\n${c.slides?.map((s: any, j: number) => 
        `  ${j + 1}. [${s.type}] ${s.headline}`
      ).join("\n")}`
    ).join("\n\n")}`
  });

  return { carousels, ragContext: knowledgeResults.results };
}

export async function runCopywriterAgent(
  carousels: any[],
  context: AgentContext
): Promise<any[]> {
  const { supabase, lovableApiKey, sendSSE } = context;

  sendSSE("agent_status", { agent: "copywriter", status: "starting", message: "Refinando copy..." });

  // Get hook examples for inspiration
  const hookExamples = await executeToolCall(
    "get_hook_examples",
    {},
    { supabase, lovableApiKey }
  );

  const systemPrompt = `${COPYWRITER_PROMPT}

=== HOOK EXAMPLES FOR INSPIRATION ===
${JSON.stringify(hookExamples, null, 2)}`;

  const userPrompt = `Refine these carousel drafts from the Strategist:

${JSON.stringify(carousels, null, 2)}

Apply the copywriter_notes for each slide. Make headlines punchier, body tighter, proof more specific.
Return the same structure with improved copy.`;

  sendSSE("agent_status", { agent: "copywriter", status: "refining", message: "Aplicando notas do strategist..." });

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: carousels.length > 1 ? "create_batch_carousels" : "create_carousel",
            description: "Output the refined carousel",
            parameters: {
              type: "object",
              properties: carousels.length > 1 ? {
                carousels: {
                  type: "array",
                  items: getCarouselSchema()
                }
              } : getCarouselSchema().properties,
              required: carousels.length > 1 ? ["carousels"] : ["topic", "slides", "caption"]
            }
          }
        }
      ],
      tool_choice: { 
        type: "function", 
        function: { name: carousels.length > 1 ? "create_batch_carousels" : "create_carousel" } 
      },
    }),
  });

  if (!response.ok) {
    console.error("Copywriter API error, using original:", response.status);
    sendSSE("agent_status", { agent: "copywriter", status: "done", message: "Usando draft original" });
    return carousels;
  }

  const data = await response.json();
  const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

  if (!toolCall) {
    return carousels;
  }

  const result = JSON.parse(toolCall.function.arguments);
  const refinedCarousels = carousels.length > 1 ? result.carousels : [result];

  sendSSE("agent_status", { agent: "copywriter", status: "done", message: "Copy refinada!" });
  sendSSE("copywriter_result", { 
    carousels: refinedCarousels,
    fullOutput: `✍️ COPYWRITER OUTPUT\n\n${refinedCarousels.map((c: any, i: number) => 
      `Carousel ${i + 1}:\n${c.slides?.map((s: any, j: number) => 
        `  Slide ${j + 1} [${s.type}]:\n    📌 "${s.headline}"\n    ${s.body?.substring(0, 100)}...`
      ).join("\n")}`
    ).join("\n\n")}`
  });

  return refinedCarousels;
}

export async function runDesignerAgent(
  carousels: any[],
  context: AgentContext
): Promise<any[]> {
  const { supabase, lovableApiKey, sendSSE } = context;
  
  const designerStartTime = Date.now();
  const totalSlides = carousels.reduce((sum, c) => sum + (c.slides?.length || 0), 0);
  console.log(`\n🎨 [DESIGNER] Agent Started`);
  console.log(`   └─ Carousels: ${carousels.length}, Total slides: ${totalSlides}`);

  sendSSE("agent_status", { agent: "designer", status: "starting", message: "Buscando assets reais..." });

  const results = [];
  let completedImages = 0;
  let failedImages = 0;
  let realAssetsUsed = 0;

  for (let ci = 0; ci < carousels.length; ci++) {
    const carousel = carousels[ci];
    let slides = carousel.slides || [];
    const carouselStart = Date.now();

    // === STEP 0: LIMIT SLIDES TO 5 (hook + 3 content + cta) ===
    if (slides.length > 5) {
      console.log(`   ⚠️ [DESIGNER] Truncating ${slides.length} slides to 5 (max)`);
      // Keep first (hook), last (cta), and 3 middle slides
      const hook = slides.find((s: any) => s.type === 'hook') || slides[0];
      const cta = slides.find((s: any) => s.type === 'cta') || slides[slides.length - 1];
      const content = slides.filter((s: any) => s.type === 'content').slice(0, 3);
      slides = [hook, ...content, cta].filter(Boolean).slice(0, 5);
    }

    console.log(`\n   📁 [DESIGNER] Carousel ${ci + 1}/${carousels.length}: "${carousel.topic?.substring(0, 40)}..." (${slides.length} slides)`);

    // === STEP 1: SEARCH FOR REAL ASSETS BASED ON TOPIC ===
    sendSSE("agent_status", { 
      agent: "designer", 
      status: "searching", 
      message: `Buscando fotos reais para "${carousel.topic?.substring(0, 30)}..."` 
    });

    const assetSearchTerms = [carousel.topic, carousel.strategic_angle, slides[0]?.designer_notes]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    
    let availableAssets: any[] = [];
    try {
      const assetResult = await executeToolCall(
        "search_assets",
        { semantic_search: assetSearchTerms },
        { supabase, lovableApiKey }
      );
      availableAssets = assetResult.assets || [];
      console.log(`   📷 [DESIGNER] Found ${availableAssets.length} real assets for topic`);
    } catch (e) {
      console.warn(`   ⚠️ [DESIGNER] Asset search failed, will use AI generation`);
    }

    sendSSE("agent_status", { 
      agent: "designer", 
      status: "working", 
      message: `Processando carousel ${ci + 1}/${carousels.length} (${availableAssets.length} assets disponíveis)` 
    });

    const processedSlides: any[] = [];

    // Process slides in batches of 3 for concurrency
    for (let i = 0; i < slides.length; i += 3) {
      const batch = slides.slice(i, i + 3);
      const batchStart = Date.now();
      console.log(`      🔄 [DESIGNER] Batch ${Math.floor(i/3) + 1}: slides ${i + 1}-${Math.min(i + 3, slides.length)}`);
      
      const batchResults = await Promise.all(batch.map(async (slide: any, batchIndex: number) => {
        const slideIndex = i + batchIndex;
        const slideStart = Date.now();
        const isFirstSlide = slideIndex === 0;
        const isLastSlide = slideIndex === slides.length - 1;
        
        // Force showLogo on first and last slides
        slide.showLogo = isFirstSlide || isLastSlide;
        slide.showISOBadge = isLastSlide || slide.type === 'cta';
        
        console.log(`         🖼️ [DESIGNER] Slide ${slideIndex + 1}/${slides.length} started: [${slide.type}] "${slide.headline?.substring(0, 30)}..."`);
        
        sendSSE("image_progress", { 
          carouselIndex: ci, 
          slideIndex, 
          total: slides.length,
          message: `Gerando slide ${slideIndex + 1}` 
        });

        try {
          // === PRIORITY 1: Use real asset if available and relevant ===
          const slideNotes = (slide.designer_notes || slide.image_style || "").toLowerCase();
          let matchingAsset: { id: string; file_path: string; filename: string; source?: string } | null = null;
          
          // Try to find a matching asset for this slide
          if (availableAssets.length > 0) {
            matchingAsset = availableAssets.find((a: any) => {
              const assetName = (a.filename || "").toLowerCase();
              const assetTags = (a.tags || []).join(" ").toLowerCase();
              const assetCategory = (a.category || "").toLowerCase();
              
              // Match by slide notes
              if (slideNotes.includes("sala limpa") || slideNotes.includes("cleanroom")) {
                return assetCategory.includes("facilities") && (assetTags.includes("cleanroom") || assetName.includes("sala_limpa"));
              }
              if (slideNotes.includes("cnc") || slideNotes.includes("máquina") || slideNotes.includes("equipment")) {
                return assetCategory.includes("equipment") || assetTags.includes("cnc");
              }
              if (slideNotes.includes("recepção") || slideNotes.includes("instalação") || slideNotes.includes("hero")) {
                return assetCategory.includes("facilities");
              }
              // Generic fallback - use any available asset
              return true;
            }) || null;
            
            // Remove used asset to avoid repetition
            if (matchingAsset) {
              const usedId = matchingAsset.id;
              availableAssets = availableAssets.filter((a: any) => a.id !== usedId);
            }
          }

          // === PRIORITY 2: Check if we should use a product image ===
          if (!matchingAsset && slide.suggested_product_category) {
            const products = await executeToolCall(
              "search_products",
              { category: slide.suggested_product_category, limit: 1 },
              { supabase, lovableApiKey }
            );

            if (products.products?.length > 0) {
              matchingAsset = {
                id: products.products[0].id,
                file_path: products.products[0].image_url,
                filename: products.products[0].name,
                source: "product"
              };
            }
          }

          // === If we have a real asset, use image editing to add text/branding ===
          if (matchingAsset?.file_path) {
            realAssetsUsed++;
            console.log(`         📷 [DESIGNER] Using real asset: "${matchingAsset.filename}"`);
            
            const imageResult = await executeToolCall(
              "generate_image",
              {
                prompt: `Usando foto real da empresa como base. ${slide.designer_notes || ""}`,
                headline: slide.headline,
                body_text: slide.body,
                style: slide.image_style || "client_perspective",
                slide_type: slide.type,
                base_image_url: matchingAsset.file_path, // New: pass real asset as base
              },
              { supabase, lovableApiKey }
            );

            const slideTime = Date.now() - slideStart;
            if (imageResult.image_url) {
              completedImages++;
              console.log(`         ✅ [DESIGNER] Slide ${slideIndex + 1} done in ${slideTime}ms (real asset)`);
            } else {
              failedImages++;
              console.error(`         ❌ [DESIGNER] Slide ${slideIndex + 1} FAILED in ${slideTime}ms`);
            }

            return {
              ...slide,
              imageUrl: imageResult.image_url || "",
              usedRealAsset: true,
              assetId: matchingAsset.id,
            };
          }

          // === PRIORITY 3: Generate custom AI image ===
          console.log(`         🤖 [DESIGNER] No asset found, generating AI image`);
          const imageResult = await executeToolCall(
            "generate_image",
            {
              prompt: slide.designer_notes || `${slide.type} slide for ${carousel.topic}`,
              headline: slide.headline,
              body_text: slide.body,
              style: slide.image_style || "client_perspective",
              slide_type: slide.type,
            },
            { supabase, lovableApiKey }
          );

          const slideTime = Date.now() - slideStart;
          if (imageResult.image_url) {
            completedImages++;
            console.log(`         ✅ [DESIGNER] Slide ${slideIndex + 1} done in ${slideTime}ms (AI generated)`);
          } else {
            failedImages++;
            console.error(`         ❌ [DESIGNER] Slide ${slideIndex + 1} FAILED in ${slideTime}ms: ${imageResult.error || 'no image returned'}`);
          }

          return {
            ...slide,
            imageUrl: imageResult.image_url || "",
            usedRealAsset: false,
          };
        } catch (slideError: any) {
          failedImages++;
          const slideTime = Date.now() - slideStart;
          console.error(`         ❌ [DESIGNER] Slide ${slideIndex + 1} EXCEPTION in ${slideTime}ms:`, slideError.message);
          return { ...slide, imageUrl: "", error: slideError.message, usedRealAsset: false };
        }
      }));

      const batchTime = Date.now() - batchStart;
      console.log(`      ✅ [DESIGNER] Batch done in ${batchTime}ms (avg ${(batchTime / batch.length).toFixed(0)}ms/slide)`);
      processedSlides.push(...batchResults);
    }

    const carouselTime = Date.now() - carouselStart;
    console.log(`   ✅ [DESIGNER] Carousel ${ci + 1} done in ${carouselTime}ms`);

    results.push({
      ...carousel,
      slides: processedSlides,
      imageUrls: processedSlides.map((s: any) => s.imageUrl || ""),
    });
  }

  const totalTime = Date.now() - designerStartTime;
  console.log(`\n🎨 [DESIGNER] Agent Complete`);
  console.log(`   └─ Total: ${totalTime}ms (${(totalTime/1000).toFixed(1)}s)`);
  console.log(`   └─ Images: ${completedImages} success, ${failedImages} failed`);
  console.log(`   └─ Avg per image: ${totalSlides > 0 ? (totalTime / totalSlides).toFixed(0) : 0}ms`);

  sendSSE("agent_status", { agent: "designer", status: "done", message: "Visuais prontos!" });
  sendSSE("designer_result", { 
    carousels: results,
    fullOutput: `🎨 DESIGNER OUTPUT\n\nGenerated ${results.reduce((acc, c) => acc + c.slides.length, 0)} images total.`
  });

  return results;
}

// Helper: Carousel schema for tool calling
function getCarouselSchema() {
  return {
    type: "object",
    properties: {
      topic: { type: "string" },
      targetAudience: { type: "string" },
      strategic_angle: { type: "string", description: "The unique strategic approach" },
      brand_associations: { 
        type: "array", 
        items: { type: "string" },
        description: "Which brand pillars this reinforces"
      },
      slides: {
        type: "array",
        items: {
          type: "object",
          properties: {
            type: { type: "string", enum: ["hook", "content", "cta"] },
            headline: { type: "string" },
            body: { type: "string" },
            copywriter_notes: { type: "string" },
            designer_notes: { type: "string" },
            image_style: { 
              type: "string", 
              enum: ["client_perspective", "technical_proof", "abstract_premium", "product_showcase"] 
            },
            suggested_product_category: { type: "string" },
            backgroundType: { type: "string", enum: ["generate", "asset", "product"] }
          },
          required: ["type", "headline", "body"]
        }
      },
      caption: { type: "string" },
      caption_hashtags: { type: "array", items: { type: "string" } }
    },
    required: ["topic", "slides", "caption"]
  };
}
