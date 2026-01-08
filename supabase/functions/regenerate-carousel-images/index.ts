import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const IMAGE_MODEL = "google/gemini-3-pro-image-preview";

  try {
    const { carousel_id } = await req.json();

    if (!carousel_id) {
      return new Response(
        JSON.stringify({ error: "carousel_id is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing configuration keys");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch carousel
    const { data: carousel, error: carouselError } = await supabase
      .from("linkedin_carousels")
      .select("*")
      .eq("id", carousel_id)
      .single();

    if (carouselError || !carousel) {
      return new Response(
        JSON.stringify({ error: "Carousel not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    console.log(`Regenerating images for carousel: ${carousel_id}, topic: ${carousel.topic}`);

    // Fetch company assets for logo/ISO overlay
    const { data: companyAssets } = await supabase
      .from("company_assets")
      .select("type, url, name");

    const slides = carousel.slides || [];
    const processedSlides = [];

    // Helper function for retry with exponential backoff
    async function generateImageWithRetry(prompt: string, maxRetries = 3): Promise<Response | null> {
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: IMAGE_MODEL,
              messages: [
                { role: "system", content: "You are a professional medical device designer. Create premium, editorial-quality LinkedIn slides. Use Inter Bold font for headlines. NEVER include label prefixes like 'HEADLINE:', 'CONTEXT:' in the image." },
                { role: "user", content: prompt }
              ],
              modalities: ["image", "text"]
            }),
          });
          
          if (res.status === 429) {
            console.warn(`Rate limited on attempt ${attempt}, waiting ${attempt * 2}s...`);
            await new Promise(r => setTimeout(r, attempt * 2000));
            continue;
          }
          if (res.ok) return res;
          
          console.warn(`Image gen attempt ${attempt} failed with status ${res.status}`);
        } catch (e) {
          console.error(`Image gen attempt ${attempt} error:`, e);
        }
        
        if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, attempt * 1000));
        }
      }
      return null;
    }

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      console.log(`Processing slide ${i + 1}/${slides.length}: ${slide.type}`);

      const logoPosition = slide.logoPosition || 'top-right';
      
      // Premium prompt with full Brand Book
      let imagePrompt = `=== LIFETREK MEDICAL - PREMIUM IMAGE GENERATION ===

**MANDATORY DIMENSIONS**: 1080x1350px (portrait, LinkedIn carousel)

**BRAND BOOK COLOR PALETTE**:
- Primary Blue #004F8F: Dominant in backgrounds, gradients, main elements
- Dark Background: Gradient from #0A1628 (top) to #003052 (base)  
- Innovation Green #1A7A3E: ONLY micro-accents (thin lines, subtle borders)
- Energy Orange #F07818: ONLY CTA details (never in backgrounds)

**TYPOGRAPHY**:
- Font: Inter Bold for headlines, Inter SemiBold for body
- Headline size: 48-60px
- Body size: 28-36px
- TEXT COLOR: PURE WHITE (#FFFFFF) with subtle shadow for contrast

**PREMIUM AESTHETIC**:
- Subtle glass morphism gradients
- Premium shadows (not flat design)
- High-tech medical precision feel
- Magazine editorial style, NOT salesy
- Clean composition with generous negative space

**VISUAL ELEMENTS**:
- Medical precision imagery (CNCs, implants, cleanrooms)
- Subtle metallic titanium textures when appropriate
- NEVER generic human faces or obvious stock photos

=== VISUAL DESCRIPTION ===
${slide.imageGenerationPrompt || "Professional medical manufacturing scene featuring precision CNC machining, cleanroom environment, high-tech medical devices. Magazine editorial aesthetic."}`;

      // Text placement
      if (slide.textPlacement === "burned_in") {
        imagePrompt += `

=== TEXT TO RENDER (BURNED-IN MODE) ===
Render this headline in LARGE, BOLD, WHITE, centered Inter font:
"${slide.headline}"

${slide.body ? `Smaller subtext (max 2 lines, Inter SemiBold):
"${slide.body.split(' ').slice(0, 15).join(' ')}${slide.body.split(' ').length > 15 ? '...' : ''}"` : ""}`;
      } else {
        imagePrompt += `

=== CLEAN MODE (NO TEXT) ===
Create premium visual background WITHOUT rendered text.
Abstract professional background, subtle medical textures.`;
      }

      imagePrompt += `

=== CRITICAL RULES ===
1. NEVER write "HEADLINE:", "CONTEXT:", "VISUAL:" or ANY label in the image
2. NEVER draw logos - leave EMPTY SPACE at ${logoPosition} corner
3. NEVER draw ISO badges - will be overlaid separately
4. Text must be CRYSTAL CLEAR, LEGIBLE, Inter font
5. Premium editorial style, NOT generic or salesy
6. Use brand color palette CONSISTENTLY`;

      let imageUrl = "";

      try {
        const imgRes = await generateImageWithRetry(imagePrompt);
        
        if (imgRes) {
          const imgData = await imgRes.json();
          let baseImageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";

          // Overlay logo if needed
          if (baseImageUrl && slide.showLogo && companyAssets) {
            const logoAsset = companyAssets.find((a: any) => a.type === 'logo');
            if (logoAsset?.url) {
              console.log(`Overlaying logo at ${logoPosition}...`);
              const overlayRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: IMAGE_MODEL,
                  messages: [{
                    role: "user",
                    content: [
                      { type: "text", text: `Overlay this company logo onto the slide image at the ${logoPosition} corner. Size: 8-10% of image width. Keep logo EXACTLY as provided. DO NOT alter the rest of the image.` },
                      { type: "image_url", image_url: { url: baseImageUrl } },
                      { type: "image_url", image_url: { url: logoAsset.url } }
                    ]
                  }],
                  modalities: ["image", "text"]
                }),
              });
              
              if (overlayRes.ok) {
                const overlayData = await overlayRes.json();
                const overlayedUrl = overlayData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
                if (overlayedUrl) {
                  baseImageUrl = overlayedUrl;
                  console.log("✅ Logo overlay successful");
                }
              }
            }
          }

          // Overlay ISO badge if needed
          if (baseImageUrl && slide.showISOBadge && companyAssets) {
            const isoAsset = companyAssets.find((a: any) => a.type === 'iso_badge');
            if (isoAsset?.url) {
              console.log(`Overlaying ISO badge...`);
              const isoRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: IMAGE_MODEL,
                  messages: [{
                    role: "user",
                    content: [
                      { type: "text", text: `Overlay this ISO certification badge at the bottom-left corner of the image. Size: 6-8% of image width. Keep badge EXACTLY as provided. DO NOT alter the rest.` },
                      { type: "image_url", image_url: { url: baseImageUrl } },
                      { type: "image_url", image_url: { url: isoAsset.url } }
                    ]
                  }],
                  modalities: ["image", "text"]
                }),
              });
              
              if (isoRes.ok) {
                const isoData = await isoRes.json();
                const isoUrl = isoData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
                if (isoUrl) {
                  baseImageUrl = isoUrl;
                  console.log("✅ ISO badge overlay successful");
                }
              }
            }
          }

          // Upload to Storage
          if (baseImageUrl && baseImageUrl.startsWith('data:image')) {
            try {
              const base64Data = baseImageUrl.split(',')[1];
              const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
              const fileName = `regen-${carousel_id}-slide-${i + 1}-${Date.now()}.png`;
              
              const { error: uploadError } = await supabase.storage
                .from('carousel-images')
                .upload(fileName, imageBytes, { contentType: 'image/png' });
              
              if (!uploadError) {
                const { data: publicUrlData } = supabase.storage
                  .from('carousel-images')
                  .getPublicUrl(fileName);
                imageUrl = publicUrlData.publicUrl;
                console.log(`✅ Uploaded: ${fileName}`);
              } else {
                console.warn("Upload failed, keeping base64:", uploadError.message);
                imageUrl = baseImageUrl;
              }
            } catch (uploadErr) {
              console.warn("Storage error:", uploadErr);
              imageUrl = baseImageUrl;
            }
          } else {
            imageUrl = baseImageUrl;
          }
        }
      } catch (e) {
        console.error(`Error generating slide ${i + 1}:`, e);
      }

      processedSlides.push({ ...slide, imageUrl });
    }

    // Update carousel in database
    const imageUrls = processedSlides.map((s: any) => s.imageUrl || "").filter(Boolean);
    
    const { error: updateError } = await supabase
      .from("linkedin_carousels")
      .update({
        slides: processedSlides,
        image_urls: imageUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", carousel_id);

    if (updateError) {
      console.error("Failed to update carousel:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to update carousel", details: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    console.log(`✅ Carousel ${carousel_id} regenerated successfully with ${processedSlides.length} slides`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        carousel_id,
        slides_regenerated: processedSlides.length,
        image_urls: imageUrls
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Regenerate error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
