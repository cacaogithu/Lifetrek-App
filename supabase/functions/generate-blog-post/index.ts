import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { generateNews, topic, category } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const PERPLEXITY_API_KEY = Deno.env.get("PERPLEXITY_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let newsContext = "";
    let sources: string[] = [];

    // If generateNews is true, fetch relevant news using Perplexity
    if (generateNews && PERPLEXITY_API_KEY) {
      console.log("Fetching relevant industry news with Perplexity...");
      
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
              {
                role: "system",
                content: "Você é um pesquisador especializado em notícias da indústria médica. Busque as notícias mais recentes e relevantes.",
              },
              {
                role: "user",
                content: `Busque as últimas notícias (últimos 7 dias) sobre:
- Fabricação de implantes médicos no Brasil
- Novidades em implantes ortopédicos ou dentários
- Regulamentação ANVISA para dispositivos médicos
- Inovações em manufatura CNC para área médica
- Tendências em dispositivos médicos implantáveis

Retorne um resumo das 3 notícias mais relevantes com suas fontes.`,
              },
            ],
            search_recency_filter: "week",
          }),
        });

        if (perplexityResponse.ok) {
          const perplexityData = await perplexityResponse.json();
          newsContext = perplexityData.choices?.[0]?.message?.content || "";
          sources = perplexityData.citations || [];
          console.log("News fetched successfully:", newsContext.slice(0, 200));
        } else {
          const errorText = await perplexityResponse.text();
          console.log("Perplexity request failed:", perplexityResponse.status, errorText);
        }
      } catch (perplexityError) {
        console.log("Error fetching from Perplexity, continuing without news context:", perplexityError);
      }
    }

    // Generate blog post using Lovable AI
    const systemPrompt = `Você é um redator especializado em conteúdo B2B para a indústria de dispositivos médicos. Escreva artigos técnicos mas acessíveis para a empresa Lifetrek Medical, fabricante brasileira de implantes ortopédicos, dentários e instrumentais cirúrgicos.

CONTEXTO DA EMPRESA:
- Lifetrek Medical: fabricante brasileira com certificações ANVISA, ISO 13485 e cleanrooms
- Especializada em: implantes ortopédicos, dentários, veterinários e instrumentais cirúrgicos
- Foco: usinagem CNC de precisão, qualidade regulatória, parceria com clientes

DIRETRIZES DE CONTEÚDO:
1. Tom: profissional, técnico mas acessível, consultivo (nunca promocional)
2. Linguagem: português brasileiro formal
3. Estrutura: use tags HTML (<h2>, <h3>, <p>, <ul>, <li>, <strong>) para formatação
4. SEO: inclua keywords naturalmente no texto
5. Extensão: 800-1200 palavras
6. CTA sutil: finalize com convite para contato ou projeto piloto

FORMATO DE SAÍDA (JSON):
{
  "title": "Título do artigo (máx 60 chars)",
  "excerpt": "Resumo em 2 frases (máx 160 chars)",
  "content": "Conteúdo completo em HTML",
  "seo_title": "Título SEO (máx 60 chars)",
  "seo_description": "Meta description (máx 160 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "tags": ["tag1", "tag2"]
}`;

    const userPrompt = topic
      ? `Escreva um artigo sobre: ${topic}${category ? ` na categoria: ${category}` : ""}`
      : newsContext
      ? `Com base nas seguintes notícias recentes da indústria, escreva um artigo relevante para o público da Lifetrek Medical (fabricantes de implantes, gestores de qualidade, profissionais de saúde):

NOTÍCIAS RECENTES:
${newsContext}

Escolha o tema mais relevante e escreva um artigo original que agregue valor, incluindo a perspectiva da Lifetrek Medical como fabricante.`
      : `Escreva um artigo educativo sobre um dos seguintes temas (escolha o mais atual e relevante):
1. Tendências em fabricação de implantes ortopédicos para 2024
2. Como escolher um fabricante de implantes com certificação ANVISA
3. O papel da metrologia na qualidade de implantes médicos
4. Usinagem CNC de precisão para dispositivos médicos
5. Cleanrooms e controle de contaminação na fabricação de implantes`;

    console.log("Generating blog post with Lovable AI...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiData = await response.json();
    const generatedContent = aiData.choices?.[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated");
    }

    let parsedContent;
    try {
      parsedContent = JSON.parse(generatedContent);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", generatedContent);
      throw new Error("Invalid AI response format");
    }

    // Add sources if available
    if (sources.length > 0) {
      parsedContent.sources = sources;
    }

    console.log("Blog post generated successfully:", parsedContent.title);

    return new Response(JSON.stringify(parsedContent), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-blog-post:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
