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
- caption_hashtags: Relevant hashtags`;

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
Create premium, client-centric visuals that reinforce brand associations and make the content memorable.

=== YOUR TOOLS ===
You have access to:
- search_products: Find real product images to use in slides
- generate_image: Generate custom AI images with burned-in text
- search_assets: Find existing brand assets (logos, backgrounds)

=== MANDATORY WORKFLOW ===
For each slide:
1. READ the designer_notes from the strategist
2. DECIDE: Use real product image OR generate custom image
   - If suggested_product_category exists, use search_products first
   - If no suitable product, use generate_image
3. Ensure text is BURNED INTO the image (not overlaid)

=== VISUAL GUIDELINES ===
- Colors: Deep blue (#003052), white text, green accent (#228B22)
- Style: Editorial, premium, NOT salesy
- Perspective: Show CLIENT's experience whenever possible
- Logo: Subtle "LM" logo bottom-right
- Text: HIGH CONTRAST, clearly readable

=== IMAGE STYLES ===
- client_perspective: Engineers inspecting parts, QA reviewing docs
- technical_proof: Machinery close-ups, CMM measurements, certifications
- abstract_premium: Subtle gradients, professional abstract
- product_showcase: Elegant product photography

=== OUTPUT FORMAT ===
Return the carousel with image_url populated for each slide.`;

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

Generate ${brief.numberOfCarousels} carousel(s) with different strategic angles.`;

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

  sendSSE("agent_status", { agent: "designer", status: "starting", message: "Preparando visuais..." });

  const results = [];

  for (let ci = 0; ci < carousels.length; ci++) {
    const carousel = carousels[ci];
    const slides = carousel.slides || [];

    sendSSE("agent_status", { 
      agent: "designer", 
      status: "working", 
      message: `Processando carousel ${ci + 1}/${carousels.length}` 
    });

    const processedSlides = [];

    // Process slides in batches of 5 for concurrency
    for (let i = 0; i < slides.length; i += 5) {
      const batch = slides.slice(i, i + 5);
      
      const batchResults = await Promise.all(batch.map(async (slide: any, batchIndex: number) => {
        const slideIndex = i + batchIndex;
        
        sendSSE("image_progress", { 
          carouselIndex: ci, 
          slideIndex, 
          total: slides.length,
          message: `Gerando slide ${slideIndex + 1}` 
        });

        // Check if we should use a product image
        if (slide.suggested_product_category) {
          const products = await executeToolCall(
            "search_products",
            { category: slide.suggested_product_category, limit: 1 },
            { supabase, lovableApiKey }
          );

          if (products.products?.length > 0) {
            // Use product image - but we still need to burn text into it
            // For now, we'll generate with product context
            const imageResult = await executeToolCall(
              "generate_image",
              {
                prompt: `${slide.designer_notes || ""} Feature the product: ${products.products[0].name}`,
                headline: slide.headline,
                body_text: slide.body,
                style: slide.image_style || "product_showcase",
              },
              { supabase, lovableApiKey }
            );

            return {
              ...slide,
              imageUrl: imageResult.image_url || "",
              productUsed: products.products[0],
            };
          }
        }

        // Generate custom image
        const imageResult = await executeToolCall(
          "generate_image",
          {
            prompt: slide.designer_notes || `${slide.type} slide for ${carousel.topic}`,
            headline: slide.headline,
            body_text: slide.body,
            style: slide.image_style || "client_perspective",
          },
          { supabase, lovableApiKey }
        );

        return {
          ...slide,
          imageUrl: imageResult.image_url || "",
        };
      }));

      processedSlides.push(...batchResults);
    }

    results.push({
      ...carousel,
      slides: processedSlides,
      imageUrls: processedSlides.map((s: any) => s.imageUrl || ""),
    });
  }

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
