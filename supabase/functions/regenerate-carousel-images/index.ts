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
  const startTime = Date.now();

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
    console.log(`[REGEN] Fetching carousel ${carousel_id}...`);
    const { data: carousel, error: carouselError } = await supabase
      .from("linkedin_carousels")
      .select("*")
      .eq("id", carousel_id)
      .single();

    if (carouselError || !carousel) {
      console.error(`[REGEN] Carousel not found: ${carouselError?.message}`);
      return new Response(
        JSON.stringify({ error: "Carousel not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    console.log(`[REGEN] ✅ Found carousel: "${carousel.topic}" with ${carousel.slides?.length || 0} slides`);

    // Fetch company assets for logo/ISO overlay
    const { data: companyAssets } = await supabase
      .from("company_assets")
      .select("type, url, name");

    const logoAsset = companyAssets?.find((a: any) => a.type === 'logo');
    const isoAsset = companyAssets?.find((a: any) => a.type === 'iso_badge');
    
    console.log(`[REGEN] Assets: Logo=${!!logoAsset?.url}, ISO=${!!isoAsset?.url}`);

    let slides = carousel.slides || [];
    const totalSlides = slides.length;

    // Limit to 5 slides max
    if (slides.length > 5) {
      console.log(`[REGEN] ⚠️ Truncating ${slides.length} slides to 5`);
      const hook = slides.find((s: any) => s.type === 'hook') || slides[0];
      const cta = slides.find((s: any) => s.type === 'cta') || slides[slides.length - 1];
      const content = slides.filter((s: any) => s.type === 'content').slice(0, 3);
      slides = [hook, ...content, cta].filter(Boolean).slice(0, 5);
    }

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    // Sanitize prompts to prevent font names, sizes, and labels from being rendered
    function sanitizePrompt(text: string): string {
      if (!text) return text;
      return text
        .replace(/inter\s*(bold|semibold|regular|medium|light)?/gi, "")
        .replace(/fonte\s*[a-z]+\s*(bold|semibold)?/gi, "")
        .replace(/\d+\s*px/gi, "")
        .replace(/\d+\s*pt/gi, "")
        .replace(/headline:/gi, "")
        .replace(/body\s*text:/gi, "")
        .replace(/visual:/gi, "")
        .replace(/context:/gi, "")
        .trim();
    }

    async function fetchAiWithRetry(payload: any, label: string, maxAttempts = 3) {
      let lastStatus: number | null = null;
      let lastBody: string | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const attemptStart = Date.now();
        try {
          const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (res.ok) return res;

          lastStatus = res.status;
          lastBody = await res.text().catch(() => null);
          console.warn(
            `[REGEN] ${label} attempt ${attempt}/${maxAttempts} failed: ${res.status} (${Date.now() - attemptStart}ms)`
          );

          // Retry only on transient failures
          if (![429, 500, 502, 503, 504].includes(res.status)) {
            break;
          }

          await sleep(Math.min(2000, 250 * 2 ** (attempt - 1)));
        } catch (e) {
          console.warn(`[REGEN] ${label} attempt ${attempt}/${maxAttempts} threw: ${String(e)}`);
          await sleep(Math.min(2000, 250 * 2 ** (attempt - 1)));
        }
      }

      return {
        ok: false,
        status: lastStatus ?? 500,
        text: async () => lastBody ?? "",
      } as unknown as Response;
    }

    // Process slide function - generates image for a single slide
    async function processSlide(slide: any, index: number): Promise<any> {
      const slideStart = Date.now();
      const slideNum = index + 1;
      const isFirstSlide = index === 0;
      const isLastSlide = index === slides.length - 1;
      
      // Auto-set overlay flags
      slide.showLogo = isFirstSlide || isLastSlide || slide.showLogo === true;
      slide.showISOBadge = isLastSlide || slide.type === 'cta' || slide.showISOBadge === true;
      
      console.log(`[REGEN] [Slide ${slideNum}/${slides.length}] Starting: ${slide.type} (logo: ${slide.showLogo}, ISO: ${slide.showISOBadge})`);

      const logoPosition = slide.logoPosition || 'top-right';
      
      // Sanitize text content
      const cleanHeadline = sanitizePrompt(slide.headline);
      const cleanBody = sanitizePrompt(slide.body);
      const cleanVisual = sanitizePrompt(slide.imageGenerationPrompt || "");
      
      // Premium prompt - ALL IN PORTUGUESE, NO FONT NAMES
      let imagePrompt = `=== LIFETREK MEDICAL - SLIDE PREMIUM ===
DIMENSÕES: 1080x1350px (retrato)
CORES: Azul #004F8F (primário), gradiente #0A1628 → #003052, Verde #1A7A3E (acentos), Laranja #F07818 (CTA)
ESTÉTICA: Glassmorphism premium, estilo editorial revista, precisão médica, high-tech

VISUAL: ${cleanVisual || "Manufatura médica profissional, usinagem CNC de precisão, ambiente de sala limpa"}`;

      if (slide.textPlacement === "burned_in" || cleanHeadline) {
        imagePrompt += `

TEXTO A RENDERIZAR (PT-BR):
Título: "${cleanHeadline}"
${cleanBody ? `Subtexto: "${cleanBody.split(' ').slice(0, 12).join(' ')}"` : ""}`;
      } else {
        imagePrompt += `

MODO LIMPO: Apenas fundo premium, sem texto. Texturas médicas abstratas.`;
      }

      imagePrompt += `

REGRAS ABSOLUTAS:
- TODO texto em PORTUGUÊS BRASILEIRO
- NUNCA escrever nomes de fontes (Inter, Arial, etc.)
- NUNCA escrever tamanhos (px, pt)
- NUNCA escrever labels como "HEADLINE:", "BODY:"
- Texto BRANCO com alto contraste
- Espaço no ${logoPosition} para logo
- Estilo editorial premium`;

      let imageUrl = "";

      try {
        // Step 1: Generate base image
        console.log(`[REGEN] [Slide ${slideNum}] Generating base image...`);
        const genStart = Date.now();
        
         const imgRes = await fetchAiWithRetry(
           {
             model: IMAGE_MODEL,
             messages: [
               { role: "system", content: "Professional medical device designer. Create premium LinkedIn slides. Inter Bold font. Never include label prefixes." },
               { role: "user", content: imagePrompt },
             ],
             modalities: ["image", "text"],
           },
           `[Slide ${slideNum}] base image`
         );

        if (!imgRes.ok) {
          console.error(`[REGEN] [Slide ${slideNum}] Image gen failed: ${imgRes.status}`);
          return { ...slide, imageUrl: "" };
        }

        const imgData = await imgRes.json();
        let baseImageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
        console.log(`[REGEN] [Slide ${slideNum}] Base image generated in ${Date.now() - genStart}ms`);

        if (!baseImageUrl) {
          console.warn(`[REGEN] [Slide ${slideNum}] No image returned from AI`);
          return { ...slide, imageUrl: "" };
        }

        // Step 2: Overlay logo if needed (only first and last slides typically)
        if (slide.showLogo && logoAsset?.url) {
          console.log(`[REGEN] [Slide ${slideNum}] Overlaying logo at ${logoPosition}...`);
          const logoStart = Date.now();
          
          try {
             const overlayRes = await fetchAiWithRetry(
               {
                 model: IMAGE_MODEL,
                 messages: [
                   {
                     role: "user",
                     content: [
                       { type: "text", text: `Overlay company logo at ${logoPosition} corner. Size: 8-10% width. Keep EXACT as provided. Don't alter rest of image.` },
                       { type: "image_url", image_url: { url: baseImageUrl } },
                       { type: "image_url", image_url: { url: logoAsset.url } },
                     ],
                   },
                 ],
                 modalities: ["image", "text"],
               },
               `[Slide ${slideNum}] logo overlay`
             );
            
            if (overlayRes.ok) {
              const overlayData = await overlayRes.json();
              const overlayedUrl = overlayData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              if (overlayedUrl) {
                baseImageUrl = overlayedUrl;
                console.log(`[REGEN] [Slide ${slideNum}] ✅ Logo overlay done in ${Date.now() - logoStart}ms`);
              }
            }
          } catch (e) {
            console.warn(`[REGEN] [Slide ${slideNum}] Logo overlay failed, continuing`);
          }
        }

        // Step 3: Overlay ISO badge if needed
        if (slide.showISOBadge && isoAsset?.url) {
          console.log(`[REGEN] [Slide ${slideNum}] Overlaying ISO badge...`);
          const isoStart = Date.now();
          
          try {
             const isoRes = await fetchAiWithRetry(
               {
                 model: IMAGE_MODEL,
                 messages: [
                   {
                     role: "user",
                     content: [
                       { type: "text", text: `Overlay ISO badge at bottom-left corner. Size: 6-8% width. Keep EXACT as provided. Don't alter rest.` },
                       { type: "image_url", image_url: { url: baseImageUrl } },
                       { type: "image_url", image_url: { url: isoAsset.url } },
                     ],
                   },
                 ],
                 modalities: ["image", "text"],
               },
               `[Slide ${slideNum}] ISO overlay`
             );
            
            if (isoRes.ok) {
              const isoData = await isoRes.json();
              const isoUrl = isoData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
              if (isoUrl) {
                baseImageUrl = isoUrl;
                console.log(`[REGEN] [Slide ${slideNum}] ✅ ISO overlay done in ${Date.now() - isoStart}ms`);
              }
            }
          } catch (e) {
            console.warn(`[REGEN] [Slide ${slideNum}] ISO overlay failed, continuing`);
          }
        }

        // Step 4: Upload to Storage
        if (baseImageUrl && baseImageUrl.startsWith('data:image')) {
          console.log(`[REGEN] [Slide ${slideNum}] Uploading to Storage...`);
          const uploadStart = Date.now();
          
          try {
            const base64Data = baseImageUrl.split(',')[1];
            const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
            const fileName = `regen-${carousel_id.slice(0, 8)}-s${slideNum}-${Date.now()}.png`;
            
            const { error: uploadError } = await supabase.storage
              .from('carousel-images')
              .upload(fileName, imageBytes, { contentType: 'image/png' });
            
            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('carousel-images')
                .getPublicUrl(fileName);
              imageUrl = publicUrlData.publicUrl;
              console.log(`[REGEN] [Slide ${slideNum}] ✅ Uploaded in ${Date.now() - uploadStart}ms`);
            } else {
              console.warn(`[REGEN] [Slide ${slideNum}] Upload failed: ${uploadError.message}`);
              imageUrl = baseImageUrl; // Keep base64 as fallback
            }
          } catch (e) {
            console.warn(`[REGEN] [Slide ${slideNum}] Upload error, keeping base64`);
            imageUrl = baseImageUrl;
          }
        } else {
          imageUrl = baseImageUrl;
        }

        console.log(`[REGEN] [Slide ${slideNum}] ✅ COMPLETE in ${Date.now() - slideStart}ms`);
      } catch (e) {
        console.error(`[REGEN] [Slide ${slideNum}] ERROR: ${e}`);
      }

      return { ...slide, imageUrl };
    }

    // BATCH PROCESSING: Process slides in parallel batches of 3
    console.log(`[REGEN] Starting batch processing (${slides.length} slides, batch size: 3)...`);
    const batchSize = 3;
    const processedSlides: any[] = [];

    for (let i = 0; i < slides.length; i += batchSize) {
      const batch = slides.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(slides.length / batchSize);
      
      console.log(`[REGEN] Processing batch ${batchNum}/${totalBatches} (slides ${i + 1}-${Math.min(i + batchSize, slides.length)})...`);
      const batchStart = Date.now();
      
      // Process batch in parallel
      const batchResults = await Promise.all(
        batch.map((slide: any, batchIdx: number) => processSlide(slide, i + batchIdx))
      );
      
      processedSlides.push(...batchResults);
      console.log(`[REGEN] ✅ Batch ${batchNum} complete in ${Date.now() - batchStart}ms`);
      
      // Small delay between batches to avoid rate limiting
      if (i + batchSize < slides.length) {
        await new Promise(r => setTimeout(r, 500));
      }
    }

    // Update carousel in database
    const imageUrls = processedSlides.map((s: any) => s.imageUrl || "").filter(Boolean);
    
    console.log(`[REGEN] Updating database with ${imageUrls.length} images...`);
    const { error: updateError } = await supabase
      .from("linkedin_carousels")
      .update({
        slides: processedSlides,
        image_urls: imageUrls,
        updated_at: new Date().toISOString()
      })
      .eq("id", carousel_id);

    if (updateError) {
      console.error(`[REGEN] DB update failed: ${updateError.message}`);
      return new Response(
        JSON.stringify({ error: "Failed to update carousel", details: updateError.message }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    const totalTime = Date.now() - startTime;
    console.log(`[REGEN] ✅✅ COMPLETE: ${processedSlides.length} slides, ${imageUrls.length} images, ${totalTime}ms total`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        carousel_id,
        slides_regenerated: processedSlides.length,
        images_generated: imageUrls.length,
        duration_ms: totalTime
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error(`[REGEN] FATAL ERROR: ${error}`);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
