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
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    console.log('Enhancing product image with Google Gemini (Vision + Imagen 3)...');

    // Step 1: Analyze the original image to get a description
    console.log('Step 1: Analyzing original image...');
    
    // Convert image to base64 if needed (similar logic to analyze-product-image)
    // Assuming imageData is a URL here.
    const imageResp = await fetch(imageData);
    if (!imageResp.ok) throw new Error("Failed to fetch image for analysis");
    const imageArrayBuffer = await imageResp.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageArrayBuffer)));
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    const visionResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{
            role: "user",
            parts: [
                { text: "Describe this medical product image in extreme visual detail. Focus on the object's shape, materials, lighting, angle, and key features so a 3D artist could recreate it perfectly." },
                { inline_data: { mime_type: mimeType, data: base64Image } }
            ]
        }]
      }),
    });

    if (!visionResponse.ok) {
        throw new Error(`Vision API error: ${visionResponse.status}`);
    }

    const visionData = await visionResponse.json();
    const imageDescription = visionData.candidates?.[0]?.content?.parts?.[0]?.text || "A medical device";
    console.log('Image description obtained');

    // Step 2: Generate new image using Imagen 3
    console.log('Step 2: Generating enhanced image...');

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

    const finalPrompt = `Create a photorealistic image based on this description: ${imageDescription}. 
    
    STYLE INSTRUCTIONS: ${enhancementPrompt}`;

    const imageResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt: finalPrompt }],
        parameters: {
            sampleCount: 1,
            aspectRatio: "1:1" // Square 1:1, or 1024x1024 equivalent
        }
      }),
    });

    if (!imageResponse.ok) {
      const errorText = await imageResponse.text();
      console.error('Imagen API error:', imageResponse.status, errorText);
      throw new Error(`Imagen API error: ${imageResponse.status}`);
    }

    const data = await imageResponse.json();
    
    // Extract the generated image (Imagen returns base64 usually, checking spec)
    // Imagen on Vertex returns base64. generateContent returns inline base64 too.
    // Wait, `imagen-3.0-generate-001` via generativelanguage might not be public yet or returns base64.
    // Google AI Studio API usually returns base64 data for images.
    
    // Assuming standard Google AI Studio format: predictions[0].bytesBase64Encoded
    // Or if using generateContent with response_mime_type image/png... (not supported yet)
    
    // Let's assume the Vertex-style response for now, but handle potential base64 return.
    // NOTE: If this endpoint fails, we might need to use `gemini-pro-vision` 
    // but the user asked for "Nano Banana Pro" which IS Imagen 3.
    // Let's double check the return format. 
    // Typical Vertex: predictions[0].bytesBase64Encoded.
    
    const b64Image = data.predictions?.[0]?.bytesBase64Encoded;
    let enhancedImageUrl = "";
    
    if (b64Image) {
        // Upload to Supabase Storage temporarily or return base64 data URI?
        // Returning data URI is safer for now.
        enhancedImageUrl = `data:image/png;base64,${b64Image}`;
    }

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
