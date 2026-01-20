import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.75.0";

declare const Deno: any;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { constructSystemPrompt, constructUserPrompt, getTools } from "./functions_logic.ts";

// Type definitions
interface CarouselSlide {
  type: string;
  headline: string;
  body: string;
  imageGenerationPrompt?: string;
  backgroundType: string;
  assetId?: string;
  imageUrl?: string;
}

interface Carousel {
  topic: string;
  targetAudience: string;
  slides: CarouselSlide[];
  imageUrls?: string[];
  caption?: string; 
}

// Serve handling...
serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // --- CONSTANTS ---
  const TEXT_MODEL = "google/gemini-2.5-flash";
  const IMAGE_MODEL = "google/gemini-3-pro-image-preview"; // Nano Banana Pro 3.0

  try {
    const {
      topic,
      targetAudience = "Geral",
      painPoint = "",
      desiredOutcome = "",
      proofPoints = "",
      ctaAction = "",
      format = "carousel",
      wantImages = true,
      numberOfCarousels = 1,
      mode = "generate", // 'generate', 'image_only', 'plan'
      postType = "value",
      // New optional fields
      selectedEquipment = [], // Array of equipment/product names
      referenceImage = "", // Base64 or URL of reference image
      batchMode = false, // For terminal batch generation
      scheduledDate = null, // For scheduling
      // For image_only mode
      headline,
      body: slideBody,
      imagePrompt
    } = await req.json();

    const isBatch = (numberOfCarousels > 1) || (mode === 'plan') || batchMode;

    console.log("Generating LinkedIn content:", { topic, mode, isBatch, postType, equipmentCount: selectedEquipment?.length || 0 });

    // --- HANDLE IMAGE ONLY MODE ---
    if (mode === "image_only") {
         const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
         if (!LOVABLE_API_KEY) throw new Error("Missing Lovable Key");

         // Clean prompt without literal HEADLINE:/CONTEXT: prefixes
         const finalPrompt = `Crie uma imagem profissional para carrossel do LinkedIn da Lifetrek Medical.

=== ESTILO OBRIGATÓRIO ===
- Dimensões: 1080x1350px (retrato)
- Cores da marca: Azul Primário #004F8F (dominante em fundos), Verde #1A7A3E (apenas micro-acentos), Laranja #F07818 (apenas CTAs)
- Fundo: Gradiente escuro de #003052 para #004F8F
- Fonte: Inter Bold para títulos, alto contraste branco sobre escuro
- Estética: Premium, minimalista, alta tecnologia médica

=== TEXTO A RENDERIZAR NA IMAGEM ===
Renderize o seguinte título em fonte grande, branca, bold, centralizado:
"${headline}"

${slideBody ? `Subtexto (menor, abaixo do título):
"${slideBody}"` : ""}

=== DESCRIÇÃO VISUAL ===
${imagePrompt || "Professional medical manufacturing scene, precision CNC machining, cleanroom environment"}

=== REGRAS CRÍTICAS ===
1. NÃO escreva "HEADLINE:", "CONTEXT:", "VISUAL:" ou qualquer label na imagem
2. Texto deve ser CLARO, LEGÍVEL, alto contraste
3. Logo "LM" pequena no canto inferior direito
4. Estilo editorial premium, NÃO vendedor`;

        const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
            model: IMAGE_MODEL,
            messages: [
                { role: "system", content: "You are an expert professional medical device designer. You create premium, editorial-quality LinkedIn slides with burned-in text. Never include label prefixes like 'HEADLINE:' in the image." },
                { role: "user", content: finalPrompt }
            ],
            modalities: ["image", "text"]
            }),
        });
        const imgData = await imgRes.json();
        const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
        
        return new Response(
            JSON.stringify({ imageUrl }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }


    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing configuration keys");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch available assets - include file_path for proper URL resolution
    const { data: assets, error: assetsError } = await supabase
      .from("content_assets")
      .select("id, filename, file_path, category, tags")
      .limit(50);

    // Log and handle assets error gracefully
    if (assetsError) {
      console.warn("Could not fetch assets (non-fatal):", assetsError.message, assetsError.code);
    }

    const assetsContext = assets?.map((a: any) => {
      const category = a.category || "general";
      const tags = Array.isArray(a.tags) ? a.tags.join(", ") : "none";
      return `- [${category.toUpperCase()}] ID: ${a.id} (Tags: ${tags}, Filename: ${a.filename})`;
    }).join("\n") || "No assets available. AI will generate all images.";

    // Fetch company assets (logos, ISO badge, etc.)
    const { data: companyAssets, error: companyAssetsError } = await supabase
      .from("company_assets")
      .select("type, url, name, metadata");

    if (companyAssetsError) {
      console.warn("Could not fetch company assets (non-fatal):", companyAssetsError.message);
    }

    const companyAssetsContext = companyAssets?.map((a: any) => 
      `- [${a.type.toUpperCase()}] URL: ${a.url} (${a.name || 'No name'})`
    ).join("\n") || "No company assets available.";

    // Fetch processed product images for visual reference
    const { data: products, error: productsError } = await supabase
      .from("processed_product_images")
      .select("name, enhanced_url, category")
      .eq("is_visible", true)
      .limit(15);

    if (productsError) {
      console.warn("Could not fetch products (non-fatal):", productsError.message);
    }

    const productsContext = products?.map((p: any) =>
      `- [${p.category || 'general'}] ${p.name}: ${p.enhanced_url}`
    ).join("\n") || "No product images available.";
    
    console.log("📚 RAG Context loaded:", { 
      contentAssets: assets?.length || 0, 
      companyAssets: companyAssets?.length || 0,
      products: products?.length || 0 
    });

    // Combined System Prompt with EMBEDDED CONTEXT
    const SYSTEM_PROMPT = constructSystemPrompt(assetsContext, companyAssetsContext, productsContext, selectedEquipment, referenceImage);

    // Construct User Prompt
    let userPrompt = constructUserPrompt(topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, isBatch, numberOfCarousels);
    
    // --- PLAN MODE ADJUSTMENT ---
    if (mode === 'plan') {
        userPrompt += "\n\nIMPORTANT: The user wants to see 3 DISTINCT STRATEGIC ANGLES/PLANS for this topic. Generate 3 variants (Batch Mode) so the user can choose the best one. Focus on the HEADLINES and HOOKS diffentiation.";
    }

    // Define Tools
    const tools = getTools(isBatch);

    // Call AI
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        tools: tools,
        tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a few seconds." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 429 }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add more credits." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 402 }
        );
      }
      throw new Error(`AI API error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const toolCall = aiResponse.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in AI response");

    const args = JSON.parse(toolCall.function.arguments);

    // Normalize to array
    let resultCarousels = isBatch ? args.carousels : [args];
    if (!resultCarousels) resultCarousels = []; // Safety check

    // If Mode is 'plan', we return here WITHOUT generating images or running critique.
    // The user just wants to see the text plans.
    if (mode === 'plan') {
         return new Response(
            JSON.stringify({ carousels: resultCarousels, mode: 'plan_results' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // --- CRITIQUE LOOP (BRAND ANALYST) ---
    // Only run if not in mock mode and not image_only
    if (LOVABLE_API_KEY !== "mock-key-for-testing" && mode !== "image_only") {
      console.log("🧐 Agente Analista: Revisando conteúdo contra Brand Book...");
      
      const critiqueSystemPrompt = `Você é o Analista de Marca & Qualidade da Lifetrek Medical.
Missão: Revisar rascunhos para garantir Voz on-brand, Credibilidade técnica e Alinhamento estratégico.

=== REGRA DE IDIOMA ===
TODO O CONTEÚDO DEVE PERMANECER EM PORTUGUÊS BRASILEIRO.

=== CHECKLIST ===
1. **Avatar & Problema**: O avatar está claramente identificado (Chamado)? UM problema principal é abordado?
2. **Valor**: O "resultado dos sonhos" (lançamentos mais seguros, menos NCs) é óbvio?
3. **Gancho**: O slide 1 segue a fórmula "Chamado + Recompensa"? (ex: "OEMs Ortopédicos: ...")
4. **Prova**: Máquinas específicas (Citizen M32) ou padrões (ISO 13485) são usados como prova? Sem claims genéricos.
5. **CTA**: Há um único CTA de baixa fricção?

=== OUTPUT ===
Refine o conteúdo e produza a MESMA estrutura JSON. 
- Se o gancho está fraco, REESCREVA-O.
- Se a prova é vaga, ADICIONE nomes de máquinas específicas.
- Se o tom é vendedor demais, torne mais ENGENHEIRO-para-ENGENHEIRO.
- MANTENHA TODO TEXTO EM PORTUGUÊS.
`;

      const critiqueUserPrompt = `Aqui está o conteúdo rascunho produzido pelo Copywriter:
${JSON.stringify(resultCarousels)}

Critique e REFINE este rascunho usando seu checklist.
Foque pesadamente no GANCHO (Slide 1) e PROVA (Especificidades técnicas).
Retorne o objeto JSON refinado (array de carrosséis).
IMPORTANTE: Mantenha todo texto em Português Brasileiro.`;

       try {
         const critiqueRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: TEXT_MODEL,
              messages: [
                { role: "system", content: critiqueSystemPrompt },
                { role: "user", content: critiqueUserPrompt }
              ],
               // We reuse the same tool definition to force structured output
               tools: tools,
               tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
            }),
         });

         if (!critiqueRes.ok) {
           if (critiqueRes.status === 429 || critiqueRes.status === 402) {
             console.warn(`Critique API rate limit/payment issue: ${critiqueRes.status}`);
           } else {
             console.warn(`Critique API error: ${critiqueRes.status}`);
           }
         }
         
         const critiqueData = await critiqueRes.json();
         const refinedToolCall = critiqueData.choices?.[0]?.message?.tool_calls?.[0];
         
         if (refinedToolCall) {
            const refinedArgs = JSON.parse(refinedToolCall.function.arguments);
            const refinedCarousels = isBatch ? refinedArgs.carousels : [refinedArgs];
            if (refinedCarousels && refinedCarousels.length > 0) {
               console.log("✅ Content refined by Analyst Agent.");
               resultCarousels = refinedCarousels;
            }
         }
       } catch (e) {
         console.warn("⚠️ Analyst Agent critique failed, using original draft:", e);
       }
    }

    // Process Images for ALL carousels
    // Fix: Explicitly type carousel as any to allow adding imageUrls
    for (const carousel of (resultCarousels as any[])) {
      if (!carousel) continue;

      const processedSlides = [];
      const slidesToProcess = format === "single-image" && carousel.slides?.length > 0 ? [carousel.slides[0]] : (carousel.slides || []);

      for (const slide of slidesToProcess) {
        let imageUrl = "";

        // 1. Try Asset - use file_path directly (already contains full URL)
        if (slide.backgroundType === "asset" && slide.assetId) {
          const { data: assetData } = await supabase.from("content_assets").select("file_path, filename").eq("id", slide.assetId).single();
          if (assetData) {
            // Use file_path if available (full URL), otherwise fallback to constructing URL
            if (assetData.file_path) {
              imageUrl = assetData.file_path;
            } else {
              const { data: publicUrlData } = supabase.storage.from("content-assets").getPublicUrl(assetData.filename);
              imageUrl = publicUrlData.publicUrl;
            }
          }
        }

        // 2. Generate if needed
        if (!imageUrl && wantImages && (slide.backgroundType === "generate" || !slide.assetId)) {
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
                      { role: "system", content: "Você é um designer profissional de dispositivos médicos. Crie slides de LinkedIn premium com texto integrado ('burned-in'). NUNCA inclua prefixos como 'HEADLINE:', 'CONTEXT:', 'VISUAL:' na imagem. Use fonte Inter Bold para títulos." },
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

          try {
            // Premium prompt structure with full Brand Book compliance
            const logoPosition = slide.logoPosition || 'top-right';
            
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
- Sophisticated depth with layered transparencies

**VISUAL ELEMENTS TO USE**:
- Medical precision imagery (CNCs, implants, cleanrooms)
- Subtle metallic titanium textures when appropriate
- NEVER use generic human faces or obvious stock photos
- Focus on machinery, products, precision, technology

=== VISUAL DESCRIPTION FOR THIS SLIDE ===
${slide.imageGenerationPrompt || "Professional medical manufacturing scene featuring precision CNC machining, cleanroom environment, high-tech medical devices. Magazine editorial aesthetic, sophisticated lighting."}`;

            // Handling Text Placement Strategy
            if (slide.textPlacement === "burned_in") {
              imagePrompt += `

=== TEXT TO RENDER (BURNED-IN MODE) ===
Render this headline in LARGE, BOLD, WHITE, centered Inter font:
"${slide.headline}"

${slide.body ? `Smaller subtext below headline (max 2 lines, Inter SemiBold):
"${slide.body.split(' ').slice(0, 15).join(' ')}${slide.body.split(' ').length > 15 ? '...' : ''}"` : ""}

Text must be CRYSTAL CLEAR with high contrast against dark background.`;
            } else {
              imagePrompt += `

=== CLEAN MODE (NO TEXT) ===
Create a premium visual background WITHOUT any rendered text.
Abstract professional background, subtle medical textures, ready for text overlay.
Focus on atmosphere, lighting, and brand color palette.`;
            }

            imagePrompt += `

=== CRITICAL RULES - MUST FOLLOW ===
1. NEVER write "HEADLINE:", "CONTEXT:", "VISUAL:", "DESCRIPTION:" or ANY label/prefix in the image
2. NEVER draw or create logos - leave EMPTY SPACE at ${logoPosition} corner for logo overlay
3. NEVER draw or create ISO badges - will be overlaid separately
4. Text must be CRYSTAL CLEAR, LEGIBLE, professional Inter font
5. Premium editorial style, NOT generic or salesy
6. Use brand color palette CONSISTENTLY throughout
7. High contrast between text and background always`;

            // Note: Logo and ISO badge will be overlaid via image editing in next step
            // Do NOT ask AI to draw them - we use real assets

            // Generate base image with retry logic
            const imgRes = await generateImageWithRetry(imagePrompt);
            
            if (imgRes) {
              const imgData = await imgRes.json();
              let baseImageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
              
              // Overlay real logo via image editing if showLogo is true and we have the asset
              if (baseImageUrl && slide.showLogo && companyAssets) {
                const logoAsset = companyAssets.find((a: any) => a.type === 'logo' || a.type === 'lifetrek_logo');
                if (logoAsset?.url) {
                  try {
                    const logoPos = slide.logoPosition || 'top-right';
                    console.log(`Overlaying real logo at ${logoPos}...`);
                    const overlayRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                      method: "POST",
                      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
                      body: JSON.stringify({
                        model: IMAGE_MODEL,
                        messages: [{
                          role: "user",
                          content: [
                            { type: "text", text: `You are a professional graphic designer. Overlay this company logo onto the slide image.

CRITICAL RULES:
- Place logo in the ${logoPos} corner of the image
- Size: approximately 8-10% of image width
- Keep the logo EXACTLY as provided (colors, proportions, quality)
- DO NOT distort, redraw, or modify the logo in any way
- DO NOT alter the rest of the slide image
- Maintain professional, clean appearance
- Ensure logo has good visibility against the background` },
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
                  } catch (logoErr) {
                    console.warn("Logo overlay failed, using base image:", logoErr);
                  }
                }
              }

              // Overlay ISO Badge if requested
              if (baseImageUrl && slide.showISOBadge && companyAssets) {
                const isoAsset = companyAssets.find((a: any) => a.type === 'iso_badge');
                if (isoAsset?.url) {
                  try {
                    console.log(`Overlaying ISO 13485 badge...`);
                    const isoOverlayRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                      method: "POST",
                      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
                      body: JSON.stringify({
                        model: IMAGE_MODEL,
                        messages: [{
                          role: "user",
                          content: [
                            { type: "text", text: `You are a professional graphic designer. Overlay this ISO certification badge onto the slide image.

CRITICAL RULES:
- Place badge in the bottom-left corner of the image (opposite to logo)
- Size: approximately 6-8% of image width (smaller than logo)
- Keep the badge EXACTLY as provided (colors, text, proportions)
- DO NOT distort, redraw, or modify the badge in any way
- DO NOT alter the rest of the slide image
- Ensure badge has good visibility but is not distracting
- Professional, subtle integration` },
                            { type: "image_url", image_url: { url: baseImageUrl } },
                            { type: "image_url", image_url: { url: isoAsset.url } }
                          ]
                        }],
                        modalities: ["image", "text"]
                      }),
                    });
                    
                    if (isoOverlayRes.ok) {
                      const isoData = await isoOverlayRes.json();
                      const isoOverlayedUrl = isoData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
                      if (isoOverlayedUrl) {
                        baseImageUrl = isoOverlayedUrl;
                        console.log("✅ ISO badge overlay successful");
                      }
                    }
                  } catch (isoErr) {
                    console.warn("ISO badge overlay failed, continuing:", isoErr);
                  }
                }
              }
              
              // Upload base64 image to Storage to avoid storing in DB
              if (baseImageUrl && baseImageUrl.startsWith('data:image')) {
                try {
                  const base64Data = baseImageUrl.split(',')[1];
                  const imageBytes = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
                  const fileName = `carousel-${Date.now()}-slide-${processedSlides.length + 1}.png`;
                  
                  const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('carousel-images')
                    .upload(fileName, imageBytes, {
                      contentType: 'image/png',
                      upsert: false
                    });
                  
                  if (!uploadError && uploadData) {
                    const { data: publicUrlData } = supabase.storage
                      .from('carousel-images')
                      .getPublicUrl(fileName);
                    imageUrl = publicUrlData.publicUrl;
                    console.log(`✅ Uploaded image to Storage: ${fileName}`);
                  } else {
                    console.warn("Failed to upload to Storage, keeping base64:", uploadError?.message);
                    imageUrl = baseImageUrl;
                  }
                } catch (uploadErr) {
                  console.warn("Storage upload error, keeping base64:", uploadErr);
                  imageUrl = baseImageUrl;
                }
              } else {
                imageUrl = baseImageUrl;
              }
            } else {
              console.warn("All image generation attempts failed for this slide");
            }
          } catch (e) {
            console.error("Image gen error", e);
          }
        }

        processedSlides.push({ ...slide, imageUrl });
      }
      carousel.slides = processedSlides;
      carousel.imageUrls = processedSlides.map((s: any) => s.imageUrl || "");
    }

    // --- SAVE TO DATABASE ---
    console.log("Saving generated carousels to database...");
    
    // Normalize to array for processing
    const carouselsToSave = (Array.isArray(resultCarousels) ? resultCarousels : [resultCarousels]).filter(Boolean);

    for (const carousel of (carouselsToSave as any[])) {
       try {
          // Extract admin_user_id from auth header
          const authHeader = req.headers.get("Authorization");
          let adminUserId = '00000000-0000-0000-0000-000000000000';
          
          if (authHeader) {
            const token = authHeader.replace("Bearer ", "");
            const { data: { user } } = await supabase.auth.getUser(token);
            if (user?.id) {
              adminUserId = user.id;
            }
          }

          // 1. Insert into linkedin_carousels with ALL required fields
          const { data: insertedCarousel, error: insertError } = await supabase
            .from("linkedin_carousels")
            .insert({
              admin_user_id: adminUserId,
              topic: carousel.topic || topic,
              target_audience: carousel.targetAudience || targetAudience,
              pain_point: carousel.painPoint || painPoint || null,
              desired_outcome: carousel.desiredOutcome || desiredOutcome || null,
              proof_points: carousel.proofPoints || proofPoints || null,
              cta_action: carousel.ctaAction || ctaAction || null,
              caption: carousel.caption || '',
              slides: carousel.slides || [],
              image_urls: carousel.imageUrls || carousel.slides?.map((s: any) => s.imageUrl).filter(Boolean) || [],
              status: 'draft',
              format: format || 'carousel',
              generation_settings: {
                mode,
                wantImages,
                numberOfCarousels,
                model: TEXT_MODEL,
                imageModel: IMAGE_MODEL
              }
            })
            .select("id")
            .single();

          if (insertError) {
            console.error("Failed to insert carousel into DB:", insertError);
          } else {
            console.log("✅ Saved carousel to DB:", insertedCarousel.id);
            // Add ID to the returned object so the client knows it
            carousel.id = insertedCarousel.id;
             
             // 2. Log generation event
            await supabase.from("linkedin_generation_logs").insert({
                admin_user_id: (await supabase.auth.getUser()).data.user?.id || '00000000-0000-0000-0000-000000000000', // Fallback if anon
                carousel_id: insertedCarousel.id,
                input_params: { topic, targetAudience, painPoint, desiredOutcome, mode },
                final_output: carousel,
                model_used: TEXT_MODEL
            });
          }

       } catch (dbError) {
         console.error("Database save error:", dbError);
       }
    }

    return new Response(
      JSON.stringify(isBatch ? { carousels: resultCarousels } : { carousel: resultCarousels[0] }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Edge function error:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      timestamp: new Date().toISOString()
    });
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An internal error occurred",
        details: "Check edge function logs for more information"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
