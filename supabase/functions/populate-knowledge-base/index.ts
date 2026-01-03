// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Knowledge Base Content - Brand Book + Hormozi Framework + Market Research
const KNOWLEDGE_DOCUMENTS = [
  // ============= BRAND BOOK =============
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
    metadata: { category: "brand", priority: "high", keywords: ["brand", "identity", "mission", "values"] }
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
    metadata: { category: "technical", priority: "high", keywords: ["machinery", "cnc", "swiss", "citizen", "zeiss", "metrology", "cleanroom"] }
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
    metadata: { category: "products", priority: "medium", keywords: ["products", "spinal", "dental", "veterinary", "trauma", "implants"] }
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
    metadata: { category: "clients", priority: "medium", keywords: ["clients", "oem", "portfolio", "references"] }
  },

  // ============= HORMOZI FRAMEWORK =============
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
    metadata: { category: "framework", priority: "high", keywords: ["hormozi", "value", "dream outcome", "proof", "likelihood"] }
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
    metadata: { category: "framework", priority: "high", keywords: ["hormozi", "time", "effort", "lead time", "speed"] }
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
    metadata: { category: "hooks", priority: "high", keywords: ["hooks", "copywriting", "callout", "attention", "linkedin"] }
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
    metadata: { category: "linkedin", priority: "high", keywords: ["linkedin", "carousel", "content", "strategy", "cta"] }
  },

  // ============= INDUSTRY RESEARCH =============
  {
    source_type: "industry_research",
    source_id: "medical_device_market_brazil",
    content: `# Mercado de Dispositivos Médicos no Brasil - 2024/2025

Tamanho do Mercado:
- R$ 60+ bilhões em 2024
- Crescimento anual: 8-12%
- 95% dependência de importações em implantes

Principais Dores dos OEMs:
1. Lead times de 60-120 dias para importação
2. Câmbio volátil (R$ 5.50-6.50/USD)
3. Capital de giro alto em estoque
4. Auditorias ANVISA cada vez mais rigorosas
5. Dificuldade em encontrar fornecedores locais certificados

Tendências:
- Reshoring e nearshoring acelerando pós-pandemia
- ANVISA alinhando com MDR europeu
- Hospitais exigindo rastreabilidade UDI completa
- Crescimento de veterinária e dental acima da média
- Pressão por produção local para licitações públicas`,
    metadata: { category: "market", priority: "high", keywords: ["mercado", "brasil", "tendências", "importação", "anvisa", "medical device"] }
  },
  {
    source_type: "industry_research",
    source_id: "global_supply_chain_trends",
    content: `# Tendências Globais de Supply Chain - Dispositivos Médicos

Reshoring Movement (2023-2025):
- 78% dos OEMs médicos consideram reshoring parcial
- COVID-19 expôs fragilidades de supply chain asiático
- Tempo médio de recuperação pós-disrupção: 6-12 meses

Regulatory Pressure:
- FDA 21 CFR Part 820 → MDR-style updates
- UDI mandatory para todos os dispositivos
- Auditorias surpresa aumentando 40%

Supplier Consolidation:
- Tendência de "fewer, deeper" supplier relationships
- Single-source risk awareness crescendo
- Dual-source strategies para componentes críticos

Cost vs Quality Trade-off:
- Lowest-cost sourcing perdendo preferência
- Total Cost of Ownership (TCO) ganhando espaço
- Recalls custam 10-100x mais que qualidade upfront`,
    metadata: { category: "market", priority: "high", keywords: ["supply chain", "reshoring", "fda", "mdr", "risk", "global"] }
  },

  // ============= PAIN POINTS BY AVATAR =============
  {
    source_type: "market_pain_points",
    source_id: "orthopedic_oem_pains",
    content: `# Dores do OEM Ortopédico

Top 5 Problemas:
1. **Recalls por Qualidade**
   - Custo médio de recall: R$ 500K-2M
   - Impacto reputacional: 18-24 meses para recuperar
   - Recalls de parafusos e placas são os mais frequentes
   
2. **Lead Time Imprevisível**
   - Importação: 60-120 dias (variação alta)
   - Local (Lifetrek): 30-45 dias (consistente)
   - Economia de capital: 20-30% menos estoque

3. **Documentação para ANVISA**
   - Fornecedores sem ISO 13485 = risco de registro
   - Sem rastreabilidade = reprovação em auditoria
   - RDC 665/2022 exigindo mais controles

4. **Estoque vs Capital de Giro**
   - OEMs mantêm 3-6 meses de estoque importado
   - Local: 1-2 meses suficiente
   - Capital liberado: R$ 200K-1M por SKU

5. **Suporte Técnico**
   - Fornecedor internacional: fuso horário, idioma
   - Problemas demoram semanas para resolver
   - Local: visita técnica em 24-48h

Gatilhos de Compra:
- Recall recente (próprio ou do concorrente)
- Auditoria ANVISA iminente
- Lançamento de nova linha de produtos
- Troca de fornecedor problemático`,
    metadata: { category: "pain_points", priority: "high", keywords: ["ortopédico", "oem", "recall", "lead time", "anvisa", "dores"] }
  },
  {
    source_type: "market_pain_points",
    source_id: "dental_oem_pains",
    content: `# Dores do OEM Dental

Top 5 Problemas:
1. **Personalização Limitada**
   - Fornecedores asiáticos: MOQ alto (5000+ unidades), sem customização
   - Mercado dental quer kits específicos por cliente
   - Diferenciação de produto = vantagem competitiva

2. **Acabamento de Implantes**
   - Rugosidade superficial crítica para osseointegração
   - Jateamento + ataque ácido requer controle rigoroso
   - Ra específico: 1.0-2.0 μm para osseointegração ideal
   - Variações comprometem resultados clínicos

3. **Compatibilidade de Conexões**
   - Hex interno/externo, cone morse
   - Precisão de 5μm em interfaces
   - Componentes incompatíveis = dor de cabeça para dentista

4. **Velocidade para Novos Designs**
   - Mercado dental evolui rápido (implantes narrow, short)
   - Importação: 6-12 meses para novo produto
   - Local: 2-3 meses do CAD à produção

5. **Certificações Específicas**
   - ANVISA + ABNT NBR ISO 14801 (fadiga)
   - Necessidade de testes in-house
   - Documentação de biocompatibilidade

Gatilhos de Compra:
- Lançamento de concorrente novo
- Feedback de dentistas sobre falhas
- Expansão para novos mercados
- Problemas com fornecedor atual`,
    metadata: { category: "pain_points", priority: "high", keywords: ["dental", "implante", "osseointegração", "conexão", "acabamento", "dores"] }
  },
  {
    source_type: "market_pain_points",
    source_id: "veterinary_oem_pains",
    content: `# Dores do OEM Veterinário

Top 5 Problemas:
1. **Volume Baixo, Variedade Alta**
   - Muitos tamanhos (felino a equino)
   - MOQ de importação inviável (500-1000/SKU)
   - Estoque parado = dinheiro morto
   - Local: lotes menores viáveis (50-100)

2. **Regulamentação Crescente**
   - MAPA exigindo mais documentação
   - Tendência a requisitos próximos de humano
   - Rastreabilidade se tornando obrigatória
   - IN 85/2023 aumentou requisitos de BPF

3. **Preço Competitivo**
   - Mercado sensível a preço
   - Importado nem sempre viável após câmbio + impostos
   - Veterinários comparam com humano (expectativa de preço menor)

4. **Inovação Rápida**
   - TPLO, TTA evoluindo rapidamente
   - Miniplate para felinos/exóticos em alta
   - Necessidade de prototipagem ágil
   - Ciclo de inovação: 12-18 meses

5. **Materiais Específicos**
   - Titânio Grau 5 (Ti6Al4V) para placas
   - Aço inox 316L para placas temporárias
   - Exigência de certificado de material rastreável

Gatilhos de Compra:
- Entrada em novo segmento (equino → felino)
- Reclamação de veterinário influenciador
- Concorrente lançou versão melhor
- Fornecedor aumentou preços significativamente`,
    metadata: { category: "pain_points", priority: "high", keywords: ["veterinário", "vet", "tplo", "mapa", "animal", "dores"] }
  },
  {
    source_type: "market_pain_points",
    source_id: "surgical_instruments_pains",
    content: `# Dores do Fabricante de Instrumentais Cirúrgicos

Top 5 Problemas:
1. **Complexidade Geométrica**
   - Instrumentais exigem tolerâncias apertadas
   - Múltiplas operações: torneamento, fresamento, EDM
   - Fornecedores não conseguem fazer tudo in-house

2. **Ergonomia e Acabamento**
   - Cirurgiões exigem tato específico
   - Acabamento afeta esterilização e manuseio
   - Eletropolimento para suavidade

3. **Kits Completos**
   - Cada sistema precisa de 10-50 instrumentais
   - Sincronizar produção de todos é desafio
   - Um atrasado = kit incompleto = venda perdida

4. **Durabilidade e Reprocessamento**
   - Instrumentais são reprocessados 100+ vezes
   - Materiais precisam aguentar autoclave
   - Design deve facilitar limpeza

5. **Matching com Implantes**
   - Instrumental deve casar perfeitamente
   - Tolerâncias do instrumental afetam cirurgia
   - Fornecedor único para implante + instrumental = ideal

Gatilhos de Compra:
- Lançamento de novo sistema de implantes
- Feedback negativo de cirurgiões
- Problema de esterilização em hospital
- Expansão de linha de produtos`,
    metadata: { category: "pain_points", priority: "medium", keywords: ["instrumental", "cirúrgico", "ergonomia", "kit", "esterilização", "dores"] }
  },

  // ============= COMPETITIVE INTELLIGENCE =============
  {
    source_type: "competitive_intelligence",
    source_id: "import_vs_local",
    content: `# Comparativo: Importação vs Produção Local

LEAD TIME
- Importação Ásia: 60-120 dias + customs
- Importação Europa: 45-90 dias
- Lifetrek Local: 30-45 dias (rush: 15-20 dias)

CUSTO TOTAL (TCO)
Importação aparece "barato" mas esconde:
- Frete internacional: 8-15% do valor
- Impostos (II, IPI, ICMS, PIS, COFINS): 30-50%
- Despachante e armazenagem: 3-5%
- Estoque maior (capital parado): 15-25% a.a.
- Risco de câmbio: variação de 10-20%

QUALIDADE
- Ásia: Variável, auditorias caras
- Europa: Alta, mas cara
- Local: Alta, auditável facilmente, ISO 13485

FLEXIBILIDADE
- Import: MOQ alto, alterações caras e lentas
- Local: MOQ baixo, iterações rápidas

RISCO
- Import: Disrupção logística, câmbio, alfândega
- Local: Controlável, próximo, comunicação fácil

DOCUMENTAÇÃO
- Import: Tradução, apostilamento, validação
- Local: Português, padrão ANVISA, resposta rápida`,
    metadata: { category: "competitive", priority: "high", keywords: ["importação", "local", "custo", "tco", "comparativo", "vantagem"] }
  }
];

// Generate embedding using Gemini via chat API (workaround)
async function generateEmbeddingViaChat(text: string, apiKey: string): Promise<number[] | null> {
  try {
    // Use Gemini to generate a semantic representation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          {
            role: "user",
            content: `Generate a semantic embedding representation for the following text. Output ONLY a JSON array of 768 floating point numbers between -1 and 1 that captures the semantic meaning. No explanation, just the array.

Text: "${text.substring(0, 500)}"`
          }
        ],
      }),
    });

    if (!response.ok) {
      console.log("Embedding via chat failed, skipping embedding generation");
      return null;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    // Try to parse as JSON array
    try {
      const embedding = JSON.parse(content);
      if (Array.isArray(embedding) && embedding.length === 768) {
        return embedding;
      }
    } catch {
      console.log("Could not parse embedding response");
    }
    
    return null;
  } catch (error) {
    console.log("Embedding generation error:", error);
    return null;
  }
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
    const { mode = "populate", skipEmbeddings = true } = await req.json().catch(() => ({}));

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

    if (mode === "list") {
      // List all documents
      const { data, error } = await supabase
        .from("knowledge_embeddings")
        .select("id, source_type, source_id, metadata, created_at")
        .order("source_type");
      
      if (error) throw error;
      
      return new Response(
        JSON.stringify({ success: true, documents: data }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Populate knowledge base
    console.log(`📚 Starting knowledge base population with ${KNOWLEDGE_DOCUMENTS.length} documents...`);
    console.log(`📦 Skip embeddings: ${skipEmbeddings}`);
    
    const results = [];
    
    for (const doc of KNOWLEDGE_DOCUMENTS) {
      console.log(`📝 Processing: ${doc.source_type}/${doc.source_id}`);
      
      // Generate embedding only if not skipping
      let embedding = null;
      if (!skipEmbeddings) {
        embedding = await generateEmbeddingViaChat(doc.content, LOVABLE_API_KEY);
        if (embedding) {
          console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
        } else {
          console.log(`⚠️ Skipping embedding for ${doc.source_id}`);
        }
      }
      
      // Insert into database (with or without embedding)
      const insertData: any = {
        content: doc.content,
        metadata: doc.metadata,
        source_type: doc.source_type,
        source_id: doc.source_id,
        chunk_index: 0,
        updated_at: new Date().toISOString(),
      };
      
      if (embedding) {
        insertData.embedding = embedding;
      }
      
      // Try to upsert by source_type + source_id
      const { data: existingData } = await supabase
        .from("knowledge_embeddings")
        .select("id")
        .eq("source_type", doc.source_type)
        .eq("source_id", doc.source_id)
        .single();
      
      let error;
      
      if (existingData) {
        // Update existing
        const result = await supabase
          .from("knowledge_embeddings")
          .update(insertData)
          .eq("id", existingData.id);
        error = result.error;
      } else {
        // Insert new
        const result = await supabase
          .from("knowledge_embeddings")
          .insert(insertData);
        error = result.error;
      }
      
      if (error) {
        console.error(`❌ Error inserting ${doc.source_id}:`, error);
        results.push({ source_id: doc.source_id, source_type: doc.source_type, success: false, error: error.message });
      } else {
        console.log(`✅ Inserted: ${doc.source_id}`);
        results.push({ source_id: doc.source_id, source_type: doc.source_type, success: true });
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
