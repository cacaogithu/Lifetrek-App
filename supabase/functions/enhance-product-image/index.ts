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
    const { imageData, prompt } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Enhancing product image with Lovable AI...');

    // Professional medical/dental product photography prompt - inspired by high-end medical equipment catalogs
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
      
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Extract the generated image from the response
    const enhancedImageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!enhancedImageUrl) {
      throw new Error('No image returned from AI');
    }

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
        error: error instanceof Error ? error.message : 'Unknown error',
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
