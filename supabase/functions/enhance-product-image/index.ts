import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

// Verify user is admin
async function verifyAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader) return false;
  
  try {
    const token = authHeader.replace('Bearer ', '');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });
    
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return false;
    
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('user_id', user.id)
      .single();
    
    return !!adminData;
  } catch {
    return false;
  }
}

// Input validation
function validateInput(data: unknown): { imageData: string; prompt?: string } | null {
  if (!data || typeof data !== 'object') return null;
  
  const obj = data as Record<string, unknown>;
  
  if (typeof obj.imageData !== 'string') return null;
  
  const imageData = obj.imageData.trim();
  
  // Validate URL format (must be http/https or data URL)
  if (!imageData.startsWith('http://') && !imageData.startsWith('https://') && !imageData.startsWith('data:image/')) {
    return null;
  }
  
  // Limit data URL length (max ~10MB base64)
  if (imageData.length > 15000000) return null;
  
  // Validate optional prompt
  let prompt: string | undefined;
  if (obj.prompt !== undefined) {
    if (typeof obj.prompt !== 'string' || obj.prompt.length > 5000) return null;
    prompt = obj.prompt.trim();
  }
  
  return { imageData, prompt };
}

serve(async (req) => {
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
        JSON.stringify({ error: 'Invalid input - provide valid imageData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { imageData, prompt } = validatedInput;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Enhancing product image for admin user');

    // Professional medical/dental product photography prompt
    const enhancementPrompt = prompt || 
      `Transform this into a premium medical equipment photoshoot worthy of a high-end catalog:

LIGHTING & STUDIO SETUP:
- Professional 3-point studio lighting with soft diffused key light and subtle rim lighting
- Dramatic yet clean shadows that emphasize product dimensionality
- Perfectly balanced exposure highlighting metallic surfaces and precision details

BACKGROUND & COMPOSITION:
- Pure white seamless background (RGB 255,255,255) or subtle gradient for depth
- Product positioned with optimal viewing angle showing key features
- Clean, minimalist composition following rule of thirds
- Slight depth of field to isolate subject while maintaining sharpness

MATERIAL & SURFACE TREATMENT:
- Crystal-clear rendering of metallic surfaces (titanium, stainless steel) with accurate reflections
- Showcase precision machining marks and surface finish authenticity
- Remove dust, fingerprints, and minor imperfections while preserving genuine texture
- Enhance contrast and micro-details without over-processing

TECHNICAL SPECS:
- Ultra-high resolution 4K quality (minimum 3840×2160 equivalent sharpness)
- Professional color grading with neutral white balance
- Slight contrast boost for commercial appeal
- Maintain product authenticity - no artificial effects or unrealistic enhancements

OUTPUT GOAL: Magazine-quality product photography suitable for medical equipment catalogs, websites, and marketing materials.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: enhancementPrompt
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageData
                }
              }
            ]
          }
        ],
        modalities: ['image', 'text']
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 402) {
        throw new Error('Payment required. Please add credits to your workspace.');
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Extract the generated image from the response
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!enhancedImageUrl) {
      throw new Error('No image returned from AI');
    }

    console.log('Image enhancement completed');

    return new Response(
      JSON.stringify({ 
        enhancedImage: enhancedImageUrl
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in enhance-product-image:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
