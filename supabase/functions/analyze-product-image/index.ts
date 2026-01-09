import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Analyzing image:', imageUrl);

    // Fetch the image to convert to base64 if needed, or pass URL if supported.
    // Gemini API supports image URLs via "fileData" if uploaded to File API, or base64 "inlineData".
    // Since we have a public URL, we might need to fetch and base64 encode it for "inlineData".
    
    // Fetch image data
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error("Failed to fetch image");
    const imageArrayBuffer = await imageResp.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: `Você é especialista em equipamentos de manufatura médica/dental da Lifetrek Medical.

EQUIPAMENTOS QUE VOCÊ CONHECE:
- Tornos CNC: Citizen (L20, L20x, L32, M32), Tornos (GT13, GT26), Doosan
- Centro de usinagem: Robodrill (Fanuc)
- Metrologia: Zeiss Contura (CMM), Microscópios Olympus, durômetros Vickers, máquinas ópticas CNC/manuais
- Ferramentas: Walter (retífica), ESPrit CAM
- Acabamento: Linhas de eletropolimento, laser marking

PRODUTOS MÉDICOS/DENTAIS:
- Implantes dentais, componentes protéticos, fresas, brocas
- Parafusos ortopédicos, placas ósseas, instrumentos
- Implantes espinhais
- Instrumentos cirúrgicos (brocas, pinças, guias)
- Componentes de precisão em titânio/aço inox

CATEGORIAS DISPONÍVEIS:
- equipment_cnc: Máquinas CNC (tornos, centros de usinagem)
- equipment_metrology: Equipamentos de metrologia (CMM, microscópios, durômetros)
- equipment_finishing: Equipamentos de acabamento (eletropolimento, laser)
- dental: Produtos dentais (implantes, componentes, fresas)
- medical_orthopedic: Produtos ortopédicos (parafusos, placas)
- medical_spinal: Implantes espinhais
- surgical_instruments: Instrumentos cirúrgicos
- industrial: Outros componentes industriais

TAREFA:
Analise a imagem e identifique:
1) Nome específico em português (incluindo marca/modelo se visível, máx 60 caracteres)
2) Descrição técnica detalhada em português (2-3 frases sobre aplicação e características)
3) Categoria (uma das listadas acima)
4) Marca (se identificável na imagem)
5) Modelo (se identificável na imagem)

Se identificar marca/modelo específico (ex: "Citizen L32", "Zeiss Contura"), inclua no nome.
Responda APENAS com o JSON: {"name": "...", "description": "...", "category": "...", "brand": "...", "model": "..."}` },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Image
                }
              }
            ]
          }
        ],
        generation_config: {
            response_mime_type: "application/json"
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
    console.log('AI response:', content);

    // Try to parse JSON from the response
    let result;
    try {
      // Find JSON object in the response (handling potential markdown blocks or pure JSON)
      const jsonText = content.replace(/```json\n?|```/g, '').trim();
      result = JSON.parse(jsonText);
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      result = {
        name: content.substring(0, 60),
        description: content,
        category: 'medical'
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-product-image:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
