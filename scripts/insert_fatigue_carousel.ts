
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env or .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;

let SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_KEY || !SUPABASE_KEY.startsWith('ey')) {
    console.warn('Service Role Key appears invalid or missing, falling back to Anon Key');
    SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY;
}



if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: Missing SUPABASE_URL or SUPABASE_KEY/VITE_SUPABASE_ANON_KEY in environment variables.');
  process.exit(1);
}

console.log('URL:', SUPABASE_URL);
console.log('KEY Prefix:', SUPABASE_KEY.substring(0, 10) + '...');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CAROUSEL_DATA = {
  topic: "Framework: Combinar Impressão 3D + CNC para Validar Fadiga",
  target_audience: "OEMs Ortopédicos, Engenheiros de P&D",
  pain_point: "Ciclos de teste de fadiga lentos e não-conformidades",
  desired_outcome: "Validar mais rápido combinando 3D e CNC",
  proof_points: "Citizen M32, Materiais Grau Implante, ISO 13485",
  cta_action: "Solicitar Fluxograma de Validação",
  caption: `Fadiga de material é o vilão silencioso dos implantes ortopédicos.
E validar isso rápido, sem perder confiabilidade, é o jogo que P&D e Manufatura precisam ganhar.

A melhor combinação que temos visto na prática não é “3D ou CNC”, é **3D + CNC**:

🔹 **Impressão 3D médica**
Para validar geometria, encaixe, volume de material e conceito de design em dias, com baixo custo de iteração.

🔹 **Usinagem CNC em materiais de grau implante**
Para testar fadiga em condições reais, com titânio, Nitinol ou PEEK usinados em tolerâncias de mícron – exatamente como serão produzidos em série.

Quando esse pipeline é bem desenhado, você:
- Reduz ciclos de tentativa e erro,
- Ganha dados de fadiga que valem para ANVISA/FDA,
- Chega ao lançamento com muito menos NCG e retrabalho.

Na Lifetrek Medical, integramos impressão 3D médica com usinagem Swiss‑type (Citizen M32) e ISO 13485 para que OEMs ortopédicos validem mais rápido sem abrir mão de segurança.

👉 Se quiser ver o fluxograma que usamos para combinar 3D + CNC na validação de fadiga, comente **“FADIGA”** que eu envio o modelo.

#Impressao3D #CNC #ImplantesOrtopedicos #FadigaDeMaterial #MedTech #ISO13485 #LifetrekMedical`,
  slides: [
    {
      type: "hook",
      headline: "FADIGA DE MATERIAL EM IMPLANTES ÓSSEOS: TESTE MAIS RÁPIDO, LANCE MAIS SEGURO.",
      body: "Para OEMs ortopédicos, prototipagem de alta fidelidade reduz ciclos de teste e não‑conformidades.",
      backgroundType: "generate",
      imageGenerationPrompt: "Extreme close-up of a medical bone implant (titanium) having a stress test. High-tech laboratory visual, dramatic lighting, blue and branding colors. Represents material fatigue testing.",
      textPlacement: "burned_in"
    },
    {
      type: "context",
      headline: "DO CAD AO TESTE DE FADIGA EM SEMANAS",
      body: "Combine impressão 3D médica para validar geometria com usinagem CNC em materiais de grau implante para testar fadiga em condições reais.",
      backgroundType: "generate",
      imageGenerationPrompt: "Split visual: Left side shows a 3D printer creating a prototype, Right side shows a precision CNC machine cutting metal. Connected by a digital glowing line representing the workflow.",
      textPlacement: "burned_in"
    },
    {
      type: "problem/solution",
      headline: "POR QUE AINDA PRECISAMOS DO CNC",
      body: "Impressão 3D valida forma e conceito. Fadiga exige peça usinada em titânio, Nitinol ou PEEK, com tolerâncias de mícron – aí entra a Citizen M32.",
      backgroundType: "generate",
      imageGenerationPrompt: "Close up of a Citizen M32 Swiss-type lathe machining a small precise medical implant. Sparks or cooling fluid, very technical and precise look.",
      textPlacement: "burned_in"
    },
    {
      type: "proof",
      headline: "MATERIAIS CERTOS, DADOS CONFIÁVEIS",
      body: "Nitinol, Titânio Grau Implante (ASTM F136) e PEEK, usinados sob ISO 13485:2016, geram resultados de fadiga que você pode levar para ANVISA/FDA.",
      backgroundType: "generate",
      imageGenerationPrompt: "Visual composition of raw materials: Titanium bars, PEEK rods, and Nitinol wire, formatted as high-end engineering materials context. ISO 13485 stamp overlay concept.",
      textPlacement: "burned_in"
    },
    {
      type: "benefit",
      headline: "MENOS ITERAÇÕES, MAIS APRENDIZADO POR LOTE",
      body: "Pipeline 3D + CNC bem desenhado reduz ciclos de reprojeto, corta custo de teste e encurta o caminho até a validação final do implante.",
      backgroundType: "generate",
      imageGenerationPrompt: "Graph or chart visual showing 'Time to Market' decreasing and 'Learning Cycles' increasing. Positive, growth-oriented, futuristic medical manufacturing background.",
      textPlacement: "burned_in"
    },
    {
      type: "cta",
      headline: "QUER O FLUXO 3D + CNC QUE USAMOS?",
      body: "Temos um fluxograma de validação de fadiga que mostra onde usar impressão 3D e onde usar CNC em cada etapa. Comente “FADIGA” ou fale com nossa equipe técnica para receber o modelo.",
      backgroundType: "generate",
      imageGenerationPrompt: "A digital tablet or blueprint showing a complex but clean flowchart titled 'Fatigue Validation Workflow'. Hand holding it or placed on an engineer's desk.",
      textPlacement: "burned_in"
    }
  ],
  status: "draft",
  format: "carousel",
  generation_settings: {
    mode: "manual_upload",
    timestamp: new Date().toISOString()
  }
};

async function insertCarousel() {
  console.log("Insert Fatigue Carousel...");
  
  // Try to get a user ID, otherwise use a placeholder or fail if RLS enforces it.
  // Ideally we use the service role key to bypass RLS.
  // If we only have anon key, we might need to sign in, but we can't interactively sign in here.
  // We'll try to insert with a hardcoded admin_user_id if we can't find one, assuming Service Role.
  // Or fetch the first admin user.
  
  let adminUserId = '00000000-0000-0000-0000-000000000000';
  
  // Try to find a user if we can query auth.users (requires service role)
  // Or query public.admin_users
  try {
     const { data: adminUsers } = await supabase.from('admin_users').select('user_id').limit(1);
     if (adminUsers && adminUsers.length > 0) {
         adminUserId = adminUsers[0].user_id;
         console.log(`Using Admin User ID: ${adminUserId}`);
     }
  } catch (e) {
      console.warn("Could not fetch admin user, using default UUID", e);
  }

  const payload = {
      ...CAROUSEL_DATA,
      admin_user_id: adminUserId,
      image_urls: [] // Empty for now, will need generation
  };

  const { data, error } = await supabase
    .from('linkedin_carousels')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Failed to insert carousel:', error);
    process.exit(1);
  }

  console.log('✅ Carousel inserted successfully!');
  console.log('ID:', data.id);
  console.log('Topic:', data.topic);
}

insertCarousel();
