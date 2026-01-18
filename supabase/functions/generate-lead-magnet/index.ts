import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const COMPANY_CONTEXT = `
# Lifetrek Medical - Company Context & Brand Book
**Mission**: "To lead in the manufacture of high-performance products... with an absolute commitment to life."
**Tagline**: "Global Reach, Local Excellence."
**Tone**: Technical, Ethical, Confident, Partnership-Oriented.
**Key Themes**:
- **Risk Reduction**: "Manufacturing Capabilities That De-Risk Your Supply Chain".
- **Precision**: "Micron-level accuracy", "Zero-Defect Manufacturing".
- **Compliance**: "Regulatory Confidence", "ISO 13485:2016", "ANVISA".
- **Speed**: "Faster Time to Market".

## Infrastructure & Machinery (Technical Specs)
Lifetrek operates a world-class facility in **Indaiatuba / SP, Brazil**.
- **Citizen M32 / L20 (Swiss-Type CNC Lathe)**: Complex medical implants, 12-axis control.
- **ZEISS Contura (3D CMM)**: Micron-level automated inspection.
- **ISO Class 7 Cleanrooms**: Assembly and packaging.
- **Electropolishing**: Mirror finish for biocompatibility.
`;

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { persona, topic, templateId, job_id } = await req.json();

        const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || Deno.env.get('GOOGLE_API_KEY');
        const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
        const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!GEMINI_API_KEY) throw new Error("Missing GEMINI_API_KEY");

        const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

        if (job_id) {
            await supabase.from('jobs').update({
                status: 'processing',
                started_at: new Date().toISOString()
            }).eq('id', job_id);
        }

        console.log(`🧲 Generating Lead Magnet for: ${persona} - ${topic}`);

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `
        Role: You are a Senior Growth Marketer for Lifetrek Medical, specializing in B2B Lead Gen for Medical Device Manufacturing.
        Task: Lead Magnet Content Generation.
        
        Industry Persona: ${persona}
        Template Type: ${templateId}
        Specific Topic/Context: ${topic}
        
        Company Context:
        ${COMPANY_CONTEXT}
        
        Requirements based on Template Type:
        ${templateId === 'tco-calculator' ? `
        - Focus: CFO/Supply Chain.
        - Style: Structured table representation (Excel-like).
        - Key Sections: Total Landed Cost Analysis, Freight comparison, Exchange rate impact, Capital tied in inventory.
        - LinkedIn CTA: Comments "CALCULO".` : ''}
        
        ${templateId === 'dfm-checklist' ? `
        - Focus: P&D/Product Engineering.
        - Style: 2-3 page technical checklist.
        - Key Sections: Geometry (deep holes, threads), Dia/Depth ratios for Ti/SS/PEEK, Surface reqs (Ra, electropolishing), Swiss-type optimized tolerances.
        - LinkedIn CTA: Comments "DFM".` : ''}
        
        ${templateId === 'iso-audit-checklist' ? `
        - Focus: QA/RA Managers.
        - Style: Audit Matrix with scoring fields.
        - Key Sections: QMS/ISO 13485, Metrology traceability (CMM), Change control (ECN), Cleanroom ISO Class 7 specs.
        - LinkedIn CTA: Comments "AUDITORIA".` : ''}
        
        ${templateId === 'capital-planner' ? `
        - Focus: Finance/Ops.
        - Style: Strategic logic guide + Planilha map.
        - Key Sections: Current vs JIT local supply scenario, Opportunity cost calculation, % Capital released.
        - LinkedIn CTA: Comments "CAPITAL".` : ''}

        General Rules:
        - Output language: Portuguese (pt-BR).
        - Tone: Technical, Professional, Data-driven.
        - Include the specific LinkedIn CTA at the very end.
        
        Format: Professional Markdown.
        `;

        const result = await model.generateContent(prompt);
        const content = result.response.text();

        const responseData = {
            persona,
            topic,
            templateId,
            content,
            generated_at: new Date().toISOString()
        };

        if (job_id) {
            await supabase.from('jobs').update({
                status: 'completed',
                completed_at: new Date().toISOString(),
                result: responseData
            }).eq('id', job_id);
        }

        return new Response(JSON.stringify(responseData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error("Error:", error);
        return new Response(JSON.stringify({ error: error.message }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }
});
