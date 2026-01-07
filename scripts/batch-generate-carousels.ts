#!/usr/bin/env -S deno run --allow-net --allow-env --allow-read

/**
 * Batch LinkedIn Carousel Generator
 * 
 * Usage:
 *   deno run --allow-net --allow-env --allow-read scripts/batch-generate-carousels.ts
 * 
 * Or with a custom input file:
 *   deno run --allow-net --allow-env --allow-read scripts/batch-generate-carousels.ts ./my-topics.json
 * 
 * Environment variables required:
 *   SUPABASE_URL - Your Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Service role key for auth bypass
 * 
 * Input JSON format (array of carousel configs):
 * [
 *   {
 *     "topic": "Nossas salas limpas ISO 7",
 *     "targetAudience": "Fabricantes ortopédicos, P&D de dispositivos médicos",
 *     "painPoint": "Compliance regulatório",
 *     "postType": "value",
 *     "format": "carousel",
 *     "selectedEquipment": ["Sala Limpa", "Torno CNC Citizen L20"]
 *   },
 *   ...
 * ]
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "https://iijkbhiqcsvtnfernrbs.supabase.co";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
  Deno.exit(1);
}

interface CarouselConfig {
  topic: string;
  targetAudience?: string;
  painPoint?: string;
  desiredOutcome?: string;
  ctaAction?: string;
  postType?: "value" | "commercial";
  format?: "carousel" | "single-image";
  selectedEquipment?: string[];
  referenceImage?: string;
  scheduledDate?: string;
}

// Default topics if no input file provided
const DEFAULT_TOPICS: CarouselConfig[] = [
  {
    topic: "Por dentro das nossas salas limpas ISO 7: onde a precisão médica acontece",
    postType: "value",
    selectedEquipment: ["Sala Limpa", "Sala Limpa (Layout Geral)"]
  },
  {
    topic: "Como escolher o fornecedor certo de implantes ortopédicos",
    targetAudience: "Fabricantes ortopédicos, Gestores de qualidade",
    painPoint: "Falta de fornecedores qualificados",
    postType: "value"
  },
  {
    topic: "5 tolerâncias críticas que definem a qualidade de um implante espinhal",
    targetAudience: "Engenheiros de produção, P&D de dispositivos médicos",
    painPoint: "Tolerâncias apertadas",
    postType: "value",
    selectedEquipment: ["Componentes de Implante Espinhal", "Torno CNC Citizen M32"]
  },
  {
    topic: "Do protótipo à produção em série: nossa capacidade de escala",
    targetAudience: "Startups de medtech",
    painPoint: "Dificuldade em escalar",
    postType: "commercial"
  },
  {
    topic: "Usinagem Suíça vs CNC Convencional: qual a diferença real?",
    targetAudience: "Engenheiros de produção",
    postType: "value",
    selectedEquipment: ["Torno CNC Citizen L20", "Torno CNC Doosan LYNX 2100W"]
  }
];

async function generateCarousel(config: CarouselConfig, index: number, total: number): Promise<boolean> {
  console.log(`\n🎯 [${index + 1}/${total}] Gerando: "${config.topic.substring(0, 50)}..."`);
  
  try {
    const startTime = Date.now();
    
    const response = await fetch(`${SUPABASE_URL}/functions/v1/generate-linkedin-carousel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        "apikey": SUPABASE_SERVICE_ROLE_KEY!,
      },
      body: JSON.stringify({
        topic: config.topic,
        targetAudience: config.targetAudience || "Geral",
        painPoint: config.painPoint || "",
        desiredOutcome: config.desiredOutcome || "",
        ctaAction: config.ctaAction || "",
        postType: config.postType || "value",
        format: config.format || "carousel",
        selectedEquipment: config.selectedEquipment || [],
        referenceImage: config.referenceImage || "",
        scheduledDate: config.scheduledDate || null,
        numberOfCarousels: 1,
        stream: false, // No streaming for batch mode
        batchMode: true, // Signal to edge function this is batch
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`   ❌ Erro HTTP ${response.status}: ${errorText.substring(0, 200)}`);
      return false;
    }

    const data = await response.json();
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    if (data.carousel || data.carousels?.[0]) {
      const carousel = data.carousel || data.carousels[0];
      const slideCount = carousel.slides?.length || 0;
      console.log(`   ✅ Sucesso! ${slideCount} slides gerados em ${elapsed}s`);
      console.log(`   📝 ID: ${carousel.id || "auto-saved"}`);
      return true;
    } else {
      console.error(`   ❌ Resposta inválida:`, JSON.stringify(data).substring(0, 200));
      return false;
    }
  } catch (error) {
    console.error(`   ❌ Erro: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

async function main() {
  console.log("🚀 Batch LinkedIn Carousel Generator");
  console.log("====================================\n");

  // Load topics from file or use defaults
  let topics: CarouselConfig[] = DEFAULT_TOPICS;
  
  const inputFile = Deno.args[0];
  if (inputFile) {
    try {
      const fileContent = await Deno.readTextFile(inputFile);
      topics = JSON.parse(fileContent);
      console.log(`📄 Carregados ${topics.length} tópicos de ${inputFile}`);
    } catch (e) {
      console.error(`❌ Erro ao ler arquivo: ${e instanceof Error ? e.message : e}`);
      Deno.exit(1);
    }
  } else {
    console.log(`📄 Usando ${topics.length} tópicos padrão (passe um arquivo JSON como argumento para customizar)`);
  }

  console.log(`\n⏱️  Iniciando geração de ${topics.length} carrosséis...\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < topics.length; i++) {
    const result = await generateCarousel(topics[i], i, topics.length);
    if (result) {
      success++;
    } else {
      failed++;
    }
    
    // Small delay between generations to avoid rate limiting
    if (i < topics.length - 1) {
      console.log("   ⏳ Aguardando 3s antes do próximo...");
      await new Promise(r => setTimeout(r, 3000));
    }
  }

  console.log("\n====================================");
  console.log(`✅ Sucesso: ${success}/${topics.length}`);
  console.log(`❌ Falhas: ${failed}/${topics.length}`);
  console.log("====================================\n");

  if (failed > 0) {
    Deno.exit(1);
  }
}

main();
