
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { config } from "https://deno.land/std@0.168.0/dotenv/mod.ts";

await config({ export: true });

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function generateManufacturingCarousel() {
    console.log("🚀 Generating 'End-to-End Engineering' Carousel...");

    const payload = {
        // We bypass the AI text generation by providing 'existingSlides' if the function supports it?
        // Wait, the function only uses 'existingSlides' if action === 'regenerate_images'.
        // But we want to provide the text AND generate images (or use mixed).
        // The current function logic:
        // If 'existingSlides' is NOT provided, it generates text via LLM.
        // I should probably update the function to accept 'slides' directly in the main payload to bypass text generation.

        // Let's assume I can pass 'slides' in the body and if present, use them.
        // Checking the code: 
        // line 304: } else { // Build the system prompt...

        // It seems currently it ALWAYS generates text if not regenerating.
        // I might need to update the function one more time to accept 'slides' payload.
        // But for now, I will use action="regenerate_images" which seems to trigger the "use provided slides" logic.

        action: "regenerate_images",
        topic: "Engenharia End-to-End: Nosso Processo de Fabricação",
        targetAudience: "P&D de dispositivos médicos",
        painPoint: "Engenharia End-to-End",
        desiredOutcome: "N/A",
        format: "carousel",
        profileType: "company",
        style: "visual",

        existingSlides: [
            {
                type: "hook",
                headline: "P&D de Dispositivos Médicos: Buscando Fabricação Sem Complicações?",
                body: "Nossa engenharia end-to-end acelera seus projetos com precisão e conformidade.",
                // image: "OPTIONAL_STORAGE_URL_HERE" // If you have one
            },
            {
                type: "content",
                headline: "01 Design e Engenharia",
                body: "Programação CAD/CAM (ESPRIT) e elaboração de FMEA para todos os novos produtos."
            },
            {
                type: "content",
                headline: "02 Usinagem CNC",
                body: "Fabricação em equipamento CNC de alta precisão (Citizen, Doosan, Fanuc)."
            },
            {
                type: "content",
                headline: "03 Acabamento",
                body: "Eletropolimento e passivação para acabamento espelhado e biocompatível."
            },
            {
                type: "content",
                headline: "04 Controle de Qualidade",
                body: "Medição 3D CMM ZEISS e microscopia DSX1000 para validação dimensional."
            },
            {
                type: "content",
                headline: "05 Embalagem Sala Limpa",
                body: "Embalagem em sala limpa ISO 7 com certificação completa de rastreabilidade."
            },
            {
                type: "content",
                headline: "06 Certificação Final",
                body: "Documentação completa de qualidade e certificação de conformidade ISO 13485."
            }
        ]
    };

    const { data, error } = await supabase.functions.invoke('generate-linkedin-carousel', {
        body: payload
    });

    if (error) {
        console.error("❌ Error:", error);
    } else {
        console.log("✅ Carousel Generated Successfully!");
        console.log(data);
    }
}

generateManufacturingCarousel();
