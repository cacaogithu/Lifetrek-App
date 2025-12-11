import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// --- BRAND CONTEXT (PORTUGUÊS) ---
const COMPANY_CONTEXT = `
# Lifetrek Medical - Contexto da Marca

## Identidade
**Missão**: Liderar na fabricação de produtos de alta performance com compromisso absoluto com a vida.
**Slogan**: "Alcance Global, Excelência Local."
**Tom**: Técnico, Consultivo, Confiante, Parceiro.

## Diferenciais-Chave
- **Redução de Risco**: Capacidades que eliminam riscos na cadeia de suprimentos.
- **Precisão**: Acurácia em nível de mícron, manufatura zero-defeito.
- **Conformidade**: ISO 13485:2016, ANVISA, rastreabilidade total.
- **Agilidade**: Protótipos em 10 dias, fábrica em Indaiatuba/SP.

## Equipamentos Principais
- **Citizen M32/L20**: Tornos suíços para geometrias complexas.
- **Zeiss Contura CMM**: Metrologia automatizada, precisão 1.9μm.
- **Salas Limpas ISO 7**: Duas cleanrooms certificadas.
- **Eletropolimento**: Acabamento Ra < 0.1μm.

## Clientes
FGM, Neortho, Ultradent, Traumec, Vincula, GMI, Orthometric, entre outros.
`;

const LINKEDIN_BEST_PRACTICES_PT = `
# Melhores Práticas LinkedIn - Carrossel

## Regras de Slides
- **Quantidade**: 5-7 slides (ideal: 7).
- **Dimensões**: 1080x1350px (retrato).
- **Texto**: MÍNIMO por slide. Headlines até 40 caracteres. Body até 80 caracteres.

## Estrutura
- **Slide 1 (Hook)**: Uma promessa/problema grande.
- **Slides 2-6 (Corpo)**: Um insight por slide. Numerados.
- **Slide 7 (CTA)**: CTA de baixa fricção.

## Tom de Voz
- Consultivo, não agressivo.
- Técnico mas acessível.
- Parceria, não venda.
- Provas concretas (nomes de equipamentos, certificações).

## Fórmulas de Hook
1. "[Audiência]: Se você ainda [faz X], pode estar [perdendo Y]."
2. "O que aprendi ao [fazer X] para [resultado]."
3. "[Problema específico] pode impactar [resultado] - veja como."
`;

// --- STEP 1: Validação de Input ---
function validateInput(data: any): { valid: boolean; error?: string } {
  console.log("=== STEP 1: Validação de Input ===");
  console.log("Dados recebidos:", JSON.stringify(data, null, 2));

  if (!data.topic || typeof data.topic !== "string") {
    return { valid: false, error: "Tópico é obrigatório" };
  }
  if (!data.targetAudience || typeof data.targetAudience !== "string") {
    return { valid: false, error: "Audiência alvo é obrigatória" };
  }

  console.log("✓ Validação OK:", {
    topic: data.topic,
    targetAudience: data.targetAudience,
    format: data.format || "carousel",
    wantImages: data.wantImages ?? true,
    numberOfCarousels: data.numberOfCarousels || 1,
  });

  return { valid: true };
}

// --- STEP 2: Geração de Conteúdo ---
async function generateContent(
  data: any,
  LOVABLE_API_KEY: string
): Promise<any[]> {
  console.log("=== STEP 2: Geração de Conteúdo ===");
  console.log("Modelo: google/gemini-2.5-flash");

  const {
    topic,
    targetAudience,
    painPoint,
    desiredOutcome,
    proofPoints,
    ctaAction,
    numberOfCarousels = 1,
  } = data;

  const isBatch = numberOfCarousels > 1;

  const SYSTEM_PROMPT = `Você é o Gerador de Carrossel LinkedIn da Lifetrek Medical.

${COMPANY_CONTEXT}

${LINKEDIN_BEST_PRACTICES_PT}

=== INSTRUÇÕES CRÍTICAS ===
1. TODO conteúdo DEVE ser em PORTUGUÊS BRASILEIRO.
2. Headlines: MÁXIMO 40 caracteres. Curtos e impactantes.
3. Body: MÁXIMO 80 caracteres. Concisos e diretos.
4. Tom: Consultivo, parceiro. NUNCA agressivo ou alarmista.
5. Use nomes específicos: Citizen M32, Zeiss Contura, ISO 13485.
6. Estruture com 5-7 slides seguindo o padrão hook → corpo → CTA.
7. CTA de baixa fricção: "Comente X", "Veja mais", "Fale conosco".
`;

  let userPrompt = `Crie um carrossel para LinkedIn.

Tópico: ${topic}
Audiência: ${targetAudience}
${painPoint ? `Dor principal: ${painPoint}` : ""}
${desiredOutcome ? `Resultado desejado: ${desiredOutcome}` : ""}
${proofPoints ? `Provas/dados: ${proofPoints}` : ""}
${ctaAction ? `CTA desejado: ${ctaAction}` : ""}

LEMBRE: Headlines ≤40 chars, Body ≤80 chars, tudo em PORTUGUÊS, tom consultivo.
`;

  if (isBatch) {
    userPrompt += `\nGere ${numberOfCarousels} carrosséis distintos, cada um com ângulo diferente.`;
  }

  console.log("Prompt do usuário:", userPrompt);

  const slideSchema = {
    type: "object",
    properties: {
      type: { 
        type: "string", 
        enum: ["hook", "content", "cta"],
        description: "Tipo do slide" 
      },
      headline: { 
        type: "string",
        description: "Título curto em PORTUGUÊS. MÁXIMO 40 caracteres." 
      },
      body: { 
        type: "string",
        description: "Texto de suporte em PORTUGUÊS. MÁXIMO 80 caracteres." 
      },
      imageGenerationPrompt: { 
        type: "string",
        description: "Descrição visual para gerar imagem de fundo (em inglês para o modelo de imagem)" 
      },
    },
    required: ["type", "headline", "body"],
  };

  const tools = [
    {
      type: "function",
      function: {
        name: isBatch ? "create_batch_carousels" : "create_carousel",
        description: isBatch
          ? "Criar múltiplos carrosséis em português"
          : "Criar um carrossel em português",
        parameters: {
          type: "object",
          properties: isBatch
            ? {
                carousels: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      topic: { type: "string" },
                      targetAudience: { type: "string" },
                      slides: { type: "array", items: slideSchema },
                      caption: { 
                        type: "string",
                        description: "Caption do post em português, com hashtags" 
                      },
                    },
                    required: ["topic", "targetAudience", "slides", "caption"],
                  },
                },
              }
            : {
                topic: { type: "string" },
                targetAudience: { type: "string" },
                slides: { type: "array", items: slideSchema },
                caption: { 
                  type: "string",
                  description: "Caption do post em português, com hashtags" 
                },
              },
          required: isBatch
            ? ["carousels"]
            : ["topic", "targetAudience", "slides", "caption"],
        },
      },
    },
  ];

  console.log("Chamando API de conteúdo...");

  const response = await fetch(
    "https://ai.gateway.lovable.dev/v1/chat/completions",
    {
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
        tool_choice: {
          type: "function",
          function: { name: isBatch ? "create_batch_carousels" : "create_carousel" },
        },
      }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Erro na API de conteúdo:", response.status, errorText);
    throw new Error(`Erro API conteúdo: ${response.status}`);
  }

  const aiResponse = await response.json();
  console.log("Resposta da API recebida");

  const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    console.error("Sem tool call na resposta:", JSON.stringify(aiResponse));
    throw new Error("Sem tool call na resposta da IA");
  }

  const args = JSON.parse(toolCall.function.arguments);
  const carousels = isBatch ? args.carousels : [args];

  console.log(`✓ Conteúdo gerado: ${carousels.length} carrossel(éis)`);
  
  // Log slide details
  carousels.forEach((c: any, idx: number) => {
    console.log(`Carrossel ${idx + 1}:`, {
      topic: c.topic,
      slideCount: c.slides?.length || 0,
      slides: c.slides?.map((s: any) => ({
        type: s.type,
        headlineLength: s.headline?.length,
        bodyLength: s.body?.length,
      })),
    });
  });

  return carousels;
}

// --- STEP 3: Geração de Imagens (PARALELO) ---
async function generateSingleImage(
  slide: any,
  slideIndex: number,
  totalSlides: number,
  LOVABLE_API_KEY: string
): Promise<string> {
  console.log(`  Slide ${slideIndex + 1}/${totalSlides}: "${slide.headline}"`);

  try {
    const imagePrompt = `Create a professional LinkedIn carousel background image.

CONTEXT: ${slide.headline} - ${slide.body}
VISUAL: ${slide.imageGenerationPrompt || "Professional medical manufacturing environment"}

STYLE REQUIREMENTS:
- Clean, modern, medical-industrial aesthetic
- Primary color: Corporate blue (#003A5D)
- Subtle accents in green (#1E6F50) or orange (#E65100)
- NO TEXT in the image
- ISO 13485 medical manufacturing feel
- High quality, professional look
- Suitable as background for white text overlay`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000); // 45s timeout per image

    const imgRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-pro-image-preview",
          messages: [
            {
              role: "system",
              content: "You are a professional medical/industrial designer creating LinkedIn carousel backgrounds.",
            },
            { role: "user", content: imagePrompt },
          ],
          modalities: ["image", "text"],
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!imgRes.ok) {
      const errorText = await imgRes.text();
      console.error(`    ✗ Erro na geração de imagem: ${imgRes.status}`, errorText);
      return "";
    }

    const imgData = await imgRes.json();
    const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
    
    if (imageUrl) {
      console.log(`    ✓ Slide ${slideIndex + 1} imagem gerada`);
    } else {
      console.log(`    ⚠ Slide ${slideIndex + 1} sem imagem na resposta`);
    }

    return imageUrl;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      console.error(`    ✗ Slide ${slideIndex + 1} timeout na geração de imagem`);
    } else {
      console.error(`    ✗ Slide ${slideIndex + 1} erro:`, e);
    }
    return "";
  }
}

async function generateImages(
  carousels: any[],
  wantImages: boolean,
  format: string,
  LOVABLE_API_KEY: string
): Promise<any[]> {
  console.log("=== STEP 3: Geração de Imagens (PARALELO) ===");
  console.log("Modelo: google/gemini-3-pro-image-preview (Nano Banana Pro)");
  console.log("wantImages:", wantImages);
  console.log("format:", format);

  if (!wantImages) {
    console.log("⏭ Imagens não solicitadas, pulando...");
    return carousels;
  }

  for (let cIdx = 0; cIdx < carousels.length; cIdx++) {
    const carousel = carousels[cIdx];
    const slidesToProcess = format === "single-image" 
      ? [carousel.slides[0]] 
      : carousel.slides;

    console.log(`Processando carrossel ${cIdx + 1}: ${slidesToProcess.length} slides EM PARALELO`);

    // Gerar todas as imagens em paralelo
    const imagePromises = slidesToProcess.map((slide: any, sIdx: number) =>
      generateSingleImage(slide, sIdx, slidesToProcess.length, LOVABLE_API_KEY)
    );

    const imageUrls = await Promise.all(imagePromises);

    // Atribuir URLs às slides
    const processedSlides = slidesToProcess.map((slide: any, idx: number) => ({
      ...slide,
      imageUrl: imageUrls[idx] || "",
    }));

    // If single-image, keep only first slide processed, rest unchanged
    if (format === "single-image") {
      carousel.slides = [processedSlides[0], ...carousel.slides.slice(1)];
    } else {
      carousel.slides = processedSlides;
    }
    
    carousel.imageUrls = carousel.slides.map((s: any) => s.imageUrl);
  }

  console.log("✓ Geração de imagens concluída (paralelo)");
  return carousels;
}

// --- STEP 4: Response Final ---
function buildResponse(carousels: any[], isBatch: boolean) {
  console.log("=== STEP 4: Response Final ===");
  console.log("isBatch:", isBatch);
  console.log("Total carrosséis:", carousels.length);

  const result = isBatch 
    ? { carousels } 
    : { carousel: carousels[0] };

  console.log("✓ Response construída com sucesso");
  return result;
}

// --- MAIN HANDLER ---
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  console.log("========================================");
  console.log("LinkedIn Carousel Generator - Iniciando");
  console.log("Timestamp:", new Date().toISOString());
  console.log("========================================");

  try {
    const data = await req.json();

    // STEP 1: Validação
    const validation = validateInput(data);
    if (!validation.valid) {
      console.error("✗ Falha na validação:", validation.error);
      return new Response(
        JSON.stringify({ error: validation.error }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY não configurada");
    }

    // STEP 2: Geração de Conteúdo
    let carousels = await generateContent(data, LOVABLE_API_KEY);

    // STEP 3: Geração de Imagens
    const wantImages = data.wantImages ?? true;
    const format = data.format || "carousel";
    carousels = await generateImages(carousels, wantImages, format, LOVABLE_API_KEY);

    // STEP 4: Response
    const isBatch = (data.numberOfCarousels || 1) > 1;
    const result = buildResponse(carousels, isBatch);

    console.log("========================================");
    console.log("✓ Geração concluída com sucesso");
    console.log("========================================");

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("========================================");
    console.error("✗ ERRO:", error);
    console.error("========================================");

    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Erro desconhecido" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
