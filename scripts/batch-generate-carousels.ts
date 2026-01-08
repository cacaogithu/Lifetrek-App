
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Configuration
const SUPABASE_URL = "https://iijkbhiqcsvtnfernrbs.supabase.co";
// Using Verified Anon Key for Invocation
const ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlpamtiaGlxY3N2dG5mZXJucmJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAzNTE2MzUsImV4cCI6MjA3NTkyNzYzNX0.HQJ1vRWwn7YXmWDvb9Pf_JgzeyCDOpXdf2NI-76IUbM";
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-linkedin-carousel`;

// We will skip DB writes if they fail
const OUTPUT_DIR = "execution/generated_carousels";

// Interfaces
interface CarouselTopic {
  topic: string;
  targetAudience: string;
  painPoint: string;
  desiredOutcome?: string;
  proofPoints?: string;
  ctaAction?: string;
  postType: "value" | "commercial";
  format?: string;
  numberOfCarousels?: number;
}

// Helper to read JSON
async function readTopics(filePath: string): Promise<CarouselTopic[]> {
  try {
    const text = await Deno.readTextFile(filePath);
    return JSON.parse(text);
  } catch (err) {
    console.error(`❌ Erro ao ler arquivo ${filePath}:`, err.message);
    Deno.exit(1);
  }
}

async function main() {
  const args = Deno.args;
  let topicsPath = "scripts/sample-carousel-topics.json";
  
  if (args.length > 0) {
    topicsPath = args[0];
  }
  
  // Ensure output dir exists
  try {
    await Deno.mkdir(OUTPUT_DIR, { recursive: true });
  } catch {}
  
  console.log(`📂 Lendo tópicos de: ${topicsPath}`);
  const topics = await readTopics(topicsPath);
  
  console.log(`🚀 Iniciando geração OTIMIZADA (Local Mode) de ${topics.length} carrosséis...`);
  console.log("---------------------------------------------------------");

  let successCount = 0;
  let failCount = 0;

  for (const [index, item] of topics.entries()) {
    console.log(`\n[${index + 1}/${topics.length}] Processando: "${item.topic}"`);
    console.log(`   🎯 Audience: ${item.targetAudience}`);
    
    const start = Date.now();
    let carouselData = null;

    // STEP 1: Generate Text/Strategy ONLY (Fast)
    try {
      console.log("   📝 Passo 1: Gerando roteiro e copy...");
      
      const response = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${ANON_KEY}`
        },
        body: JSON.stringify({
          ...item,
          mode: "generate",
          wantImages: false, // SKIP internal image gen
          numberOfCarousels: 1
        })
      });

      if (!response.ok) {
        throw new Error(`Text Gen Failed: ${response.status} - ${await response.text()}`);
      }

      const result = await response.json();
      const carousels = result.carousels || (result.carousel ? [result.carousel] : []);
      
      if (carousels.length === 0) throw new Error("No carousels returned");
      
      carouselData = carousels[0];
      console.log(`   ✅ Roteiro gerado! (DB Save skipped/failed silently on server)`);

    } catch (err) {
      console.error(`   ❌ Falha no Passo 1:`, err.message);
      failCount++;
      continue;
    }

    // STEP 2: Generate Images Slide by Slide
    try {
      console.log(`   🎨 Passo 2: Gerando imagens para ${carouselData.slides.length} slides...`);
      const updatedSlides = [];
      const imageUrls = [];

      for (let i = 0; i < carouselData.slides.length; i++) {
        const slide = carouselData.slides[i];
        console.log(`      🖼️  Slide ${i+1}/${carouselData.slides.length}...`);
        
        let url = "";
        try {
            // Call Edge Function in IMAGE_ONLY mode
            const imgResponse = await fetch(FUNCTION_URL, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${ANON_KEY}`
                },
                body: JSON.stringify({
                  mode: "image_only",
                  headline: slide.headline,
                  body: slide.body || slide.caption || "",
                  imagePrompt: slide.designer_notes,
                  topic: item.topic
                })
            });
            
            if (imgResponse.ok) {
                const imgResult = await imgResponse.json();
                url = imgResult.imageUrl;
                if (url) {
                    console.log(`         ✅ OK!`);
                } else {
                     console.error(`         ⚠️ Sem URL retornada`);
                }
            } else {
                console.error(`         ❌ Erro na imagem: ${imgResponse.status}`);
            }
        } catch (imgErr) {
            console.error(`         ❌ Exception imagem: ${imgErr.message}`);
        }

        updatedSlides.push({ ...slide, imageUrl: url, url: url }); 
        if (url) imageUrls.push(url);
        
        // Small delay to be nice
        await new Promise(r => setTimeout(r, 1000));
      }

      carouselData.slides = updatedSlides;
      carouselData.imageUrls = imageUrls;
      carouselData.status = 'completed';

      // STEP 3: Save to Local JSON
      const filename = `${OUTPUT_DIR}/carousel_${index + 1}_${Date.now()}.json`;
      console.log(`   💾 Passo 3: Salvando em ${filename}...`);
      await Deno.writeTextFile(filename, JSON.stringify(carouselData, null, 2));
      
      console.log("   ✨ Carrossel finalizado com sucesso (Local)!");
      successCount++;

    } catch (err) {
      console.error(`   ❌ Falha nos Passos 2/3:`, err.message);
    }
    
    if (index < topics.length - 1) await new Promise(r => setTimeout(r, 2000));
  }

  console.log("\n---------------------------------------------------------");
  console.log(`🏁 Finalizado!`);
  console.log(`✅ Salvos em ${OUTPUT_DIR}: ${successCount}`);
  console.log(`❌ Falhas: ${failCount}`);
}

main();
