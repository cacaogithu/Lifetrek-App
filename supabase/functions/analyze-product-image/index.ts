import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_PUBLISHABLE_KEY') || Deno.env.get('SUPABASE_ANON_KEY')!;

// Verify user is admin - check both admin_users table (legacy) and user_roles table
async function verifyAdmin(authHeader: string | null): Promise<boolean> {
  console.log('verifyAdmin called, authHeader exists:', !!authHeader);
  
  if (!authHeader) {
    console.log('No auth header provided');
    return false;
  }
  
  try {
    const token = authHeader.replace('Bearer ', '');
    console.log('Token extracted, length:', token.length);
    console.log('supabaseUrl:', supabaseUrl);
    console.log('supabaseAnonKey exists:', !!supabaseAnonKey);
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log('getUser result - user:', user?.id, 'error:', userError?.message);
    
    if (userError || !user) {
      console.log('User verification failed');
      return false;
    }
    
    // Check admin_users table first (user can see their own record)
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();
    
    console.log('admin_users query - data:', adminData, 'error:', adminError?.message);
    
    if (adminData) {
      console.log('User is admin via admin_users table');
      return true;
    }
    
    // Also check user_roles table for admin role
    const { data: roleData, error: roleError } = await supabase
      .from('user_roles')
      .select('id')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();
    
    console.log('user_roles query - data:', roleData, 'error:', roleError?.message);
    
    const isAdmin = !!roleData;
    console.log('Final admin check result:', isAdmin);
    return isAdmin;
  } catch (e) {
    console.error('Exception in verifyAdmin:', e);
    return false;
  }
}

// Input validation
function validateInput(data: unknown): { imageUrl: string } | null {
  if (!data || typeof data !== 'object') return null;
  
  const obj = data as Record<string, unknown>;
  
  if (typeof obj.imageUrl !== 'string') return null;
  
  const imageUrl = obj.imageUrl.trim();
  
  // Validate URL format (must be http/https or data URL)
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://') && !imageUrl.startsWith('data:image/')) {
    return null;
  }
  
  // Limit URL length
  if (imageUrl.length > 50000) return null;
  
  return { imageUrl };
}

serve(async (req) => {
  console.log('Request received, method:', req.method);
  console.log('ENV check - SUPABASE_URL:', !!supabaseUrl, 'ANON_KEY:', !!supabaseAnonKey);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify admin authorization
    const authHeader = req.headers.get('authorization');
    const isAdmin = await verifyAdmin(authHeader);
    
    if (!isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - Admin access required' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate input
    const rawData = await req.json();
    const validatedInput = validateInput(rawData);
    
    if (!validatedInput) {
      return new Response(
        JSON.stringify({ error: 'Invalid input - provide valid imageUrl' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageUrl } = validatedInput;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Analyzing image for admin user');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `Você é especialista em equipamentos de manufatura médica/dental da Lifetrek Medical.

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
Responda em formato JSON: {"name": "...", "description": "...", "category": "...", "brand": "...", "model": "..."}`
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise esta imagem e forneça os dados solicitados em formato JSON.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    console.log('AI analysis completed');

    // Try to parse JSON from the response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
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
