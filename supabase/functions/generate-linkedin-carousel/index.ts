// @ts-ignore
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
// @ts-ignore
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

// Helper to send SSE events
function sendSSE(controller: ReadableStreamDefaultController, event: string, data: any) {
  const encoder = new TextEncoder();
  controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
}

// Streaming generation handler
async function handleStreamingGeneration(req: Request, params: any) {
  const { topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, format, wantImages, numberOfCarousels, isBatch } = params;
  
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const TEXT_MODEL = "google/gemini-2.5-flash";
  const IMAGE_MODEL = "google/gemini-3-pro-image-preview";

  if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ error: "Missing configuration" }), { 
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } 
    });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Send initial step
        sendSSE(controller, "step", { step: "strategist", status: "active", message: "Strategist escrevendo..." });

        // Fetch assets
        const { data: assets } = await supabase.from("content_assets").select("id, filename, category, tags").limit(50);
        const assetsContext = assets?.map((a: any) => {
          const category = a.category || "general";
          const tags = Array.isArray(a.tags) ? a.tags.join(", ") : "none";
          return `- [${category.toUpperCase()}] ID: ${a.id} (Tags: ${tags}, Filename: ${a.filename})`;
        }).join("\n") || "No assets available.";

        const SYSTEM_PROMPT = constructSystemPrompt(assetsContext);
        const userPrompt = constructUserPrompt(topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, isBatch, numberOfCarousels);
        const tools = getTools(isBatch);

        // === STRATEGIST with streaming ===
        const strategistStartTime = Date.now();
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: TEXT_MODEL,
            messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userPrompt }],
            tools, tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
            stream: true
          }),
        });

        if (!response.ok || !response.body) {
          sendSSE(controller, "error", { error: `API error: ${response.status}` });
          controller.close();
          return;
        }

        // Parse streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let toolCallArgs = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          let newlineIndex: number;
          while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
            let line = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 1);
            if (line.endsWith("\r")) line = line.slice(0, -1);
            if (!line.startsWith("data: ") || line.trim() === "") continue;
            const jsonStr = line.slice(6).trim();
            if (jsonStr === "[DONE]") break;

            try {
              const parsed = JSON.parse(jsonStr);
              const delta = parsed.choices?.[0]?.delta;
              if (delta?.tool_calls?.[0]?.function?.arguments) {
                toolCallArgs += delta.tool_calls[0].function.arguments;
                // Send preview of what's being written
                if (toolCallArgs.length > 50 && toolCallArgs.length % 100 < 10) {
                  // Extract a preview headline if possible
                  const headlineMatch = toolCallArgs.match(/"headline"\s*:\s*"([^"]+)"/);
                  if (headlineMatch) {
                    sendSSE(controller, "preview", { agent: "strategist", content: headlineMatch[1] });
                  }
                }
              }
            } catch { /* continue */ }
          }
        }

        const strategistTime = Date.now() - strategistStartTime;
        sendSSE(controller, "step", { step: "strategist", status: "done", timeMs: strategistTime });

        // Parse strategist result
        let resultCarousels: any[];
        try {
          const args = JSON.parse(toolCallArgs);
          resultCarousels = isBatch ? args.carousels : [args];
        } catch (e) {
          sendSSE(controller, "error", { error: "Failed to parse strategist output" });
          controller.close();
          return;
        }

        // Build a human-readable summary of the strategist's work
        const strategistSummary = resultCarousels.map((c: any, idx: number) => {
          const slides = c.slides || [];
          const slidesSummary = slides.map((s: any, si: number) => 
            `  Slide ${si + 1} (${s.type}): "${s.headline}"`
          ).join("\n");
          return `Carousel ${idx + 1}: "${c.topic}"\n${slidesSummary}`;
        }).join("\n\n");

        // Send strategist full output
        sendSSE(controller, "strategist_result", { 
          carousels: resultCarousels,
          preview: resultCarousels[0]?.slides?.[0]?.headline || "",
          fullOutput: `📝 ESTRATÉGIA GERADA (${(strategistTime / 1000).toFixed(1)}s)\n\n${strategistSummary}`
        });

        // === ANALYST (Critique) ===
        sendSSE(controller, "step", { step: "analyst", status: "active", message: "Analyst revisando..." });

        const critiqueSystemPrompt = `You are the Copywriter / Brand & Quality Analyst for Lifetrek Medical.
Mission: Review drafts to ensure On-brand voice, Technical credibility, Strategic alignment, AND polish the copy for maximum engagement.
=== YOUR JOB ===
1. Refine headlines for punch and clarity
2. Tighten body copy - remove fluff, add specifics
3. Ensure proof points are concrete (machines, certifications, numbers)
4. Make CTAs irresistible but low-friction
=== CHECKLIST ===
1. **Avatar & Problem**: Is the avatar clearly identified (Callout)? Is ONE main problem addressed?
2. **Hook**: Does slide 1 follow the "Callout + Payoff" formula?
3. **Proof**: Are specific machines (Citizen M32) or standards (ISO 13485) used?
4. **CTA**: Single, low-friction CTA?
=== OUTPUT ===
Refine and return the SAME JSON structure with improved copy.`;

        const critiqueUserPrompt = `Draft: ${JSON.stringify(resultCarousels)}\nCritique and refine using checklist.`;

        const analystStartTime = Date.now();
        const critiqueRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: TEXT_MODEL,
            messages: [{ role: "system", content: critiqueSystemPrompt }, { role: "user", content: critiqueUserPrompt }],
            tools, tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
            stream: true
          }),
        });

        if (critiqueRes.ok && critiqueRes.body) {
          const cReader = critiqueRes.body.getReader();
          let cBuffer = "";
          let cToolArgs = "";

          while (true) {
            const { done, value } = await cReader.read();
            if (done) break;
            cBuffer += decoder.decode(value, { stream: true });

            let idx: number;
            while ((idx = cBuffer.indexOf("\n")) !== -1) {
              let line = cBuffer.slice(0, idx);
              cBuffer = cBuffer.slice(idx + 1);
              if (line.endsWith("\r")) line = line.slice(0, -1);
              if (!line.startsWith("data: ")) continue;
              const jsonStr = line.slice(6).trim();
              if (jsonStr === "[DONE]") break;
              try {
                const parsed = JSON.parse(jsonStr);
                const delta = parsed.choices?.[0]?.delta;
                if (delta?.tool_calls?.[0]?.function?.arguments) {
                  cToolArgs += delta.tool_calls[0].function.arguments;
                  if (cToolArgs.length > 50 && cToolArgs.length % 100 < 10) {
                    const headlineMatch = cToolArgs.match(/"headline"\s*:\s*"([^"]+)"/);
                    if (headlineMatch) {
                      sendSSE(controller, "preview", { agent: "analyst", content: headlineMatch[1] });
                    }
                  }
                }
              } catch { /* continue */ }
            }
          }

          try {
            const refinedArgs = JSON.parse(cToolArgs);
            const refined = isBatch ? refinedArgs.carousels : [refinedArgs];
            if (refined?.length > 0) resultCarousels = refined;
          } catch { /* use original */ }
        }

        const analystTime = Date.now() - analystStartTime;
        sendSSE(controller, "step", { step: "analyst", status: "done", timeMs: analystTime });

        // Build copywriter summary showing the refinements
        const copywriterSummary = resultCarousels.map((c: any, idx: number) => {
          const slides = c.slides || [];
          return slides.map((s: any, si: number) => 
            `Slide ${si + 1} (${s.type}):\n  📌 "${s.headline}"\n  ${s.body.substring(0, 150)}${s.body.length > 150 ? '...' : ''}`
          ).join("\n\n");
        }).join("\n\n---\n\n");

        sendSSE(controller, "analyst_result", { 
          carousels: resultCarousels,
          fullOutput: `✍️ COPY REFINADA (${(analystTime / 1000).toFixed(1)}s)\n\n${copywriterSummary}`
        });

        // === IMAGE GENERATION ===
        if (wantImages) {
          sendSSE(controller, "step", { step: "images", status: "active", message: "Gerando imagens..." });

          interface SlideTask { carouselIndex: number; slideIndex: number; slide: any; }
          const tasks: SlideTask[] = [];
          resultCarousels.forEach((c: any, ci: number) => {
            c?.slides?.forEach((s: any, si: number) => tasks.push({ carouselIndex: ci, slideIndex: si, slide: s }));
          });

          let completed = 0;
          const CONCURRENCY = 5;

          for (let i = 0; i < tasks.length; i += CONCURRENCY) {
            const batch = tasks.slice(i, i + CONCURRENCY);
            const results = await Promise.allSettled(batch.map(async (task) => {
              if (task.slide.backgroundType !== "generate") return { ...task, imageUrl: "" };

              // Build a prompt that burns text INTO the image
              const slideType = task.slide.type === "hook" ? "HOOK" : task.slide.type === "cta" ? "CTA" : "CONTEÚDO";
              const burnedInPrompt = `
Create a professional LinkedIn carousel slide image with TEXT BURNED IN.
Format: 1080x1080 square image.
Brand: Lifetrek Medical (precision medical manufacturing).
Colors: Deep blue background (#003052), white text, green accent (#228B22).

SLIDE TYPE: ${slideType}
HEADLINE (must appear prominently in image): "${task.slide.headline}"
BODY TEXT (smaller, below headline): "${task.slide.body}"

LAYOUT REQUIREMENTS:
- Deep blue gradient background (#003052 to #004080)
- Top left: Small "LM" logo in white box
- Top right: Badge saying "${slideType}" in green
- Center: Large, bold white headline text
- Below headline: Green accent line/bar
- Below line: Body text in white (smaller)
- Bottom: "Lifetrek Medical | lifetrek-medical.com" footer

TYPOGRAPHY:
- Headline: Bold sans-serif, large (like 48-60pt equivalent)
- Body: Regular weight, medium size (like 18-24pt equivalent)
- All text must be CLEARLY READABLE

STYLE: Clean, corporate, medical B2B aesthetic. Premium LinkedIn carousel look.
The text MUST be part of the image, not overlaid.`.trim();

              const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
                method: "POST",
                headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
                body: JSON.stringify({
                  model: IMAGE_MODEL,
                  messages: [
                    { role: "user", content: burnedInPrompt }
                  ],
                  modalities: ["image", "text"]
                }),
              });

              if (!imgRes.ok) {
                console.error("Image generation failed:", imgRes.status, await imgRes.text());
                return { ...task, imageUrl: "" };
              }
              const data = await imgRes.json();
              return { ...task, imageUrl: data.choices?.[0]?.message?.images?.[0]?.image_url?.url || "" };
            }));

            results.forEach((r) => {
              if (r.status === "fulfilled" && r.value.imageUrl) {
                resultCarousels[r.value.carouselIndex].slides[r.value.slideIndex].imageUrl = r.value.imageUrl;
                resultCarousels[r.value.carouselIndex].slides[r.value.slideIndex].textPlacement = "burned_in";
              }
              completed++;
            });

            sendSSE(controller, "image_progress", { completed, total: tasks.length });
          }

          resultCarousels.forEach((c: any) => {
            c.imageUrls = c.slides?.map((s: any) => s.imageUrl || "") || [];
          });

          sendSSE(controller, "step", { step: "images", status: "done" });
        }

        // Final result
        const final = isBatch ? { carousels: resultCarousels } : resultCarousels[0];
        sendSSE(controller, "complete", final);
        controller.close();

      } catch (error: any) {
        console.error("Streaming error:", error);
        sendSSE(controller, "error", { error: error.message || "Generation failed" });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }
  });
}


serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // --- CONSTANTS ---
  const TEXT_MODEL = "google/gemini-2.5-flash";
  const IMAGE_MODEL = "google/gemini-3-pro-image-preview";

  try {
    const {
      topic,
      targetAudience,
      painPoint,
      desiredOutcome,
      proofPoints,
      ctaAction,
      format = "carousel",
      wantImages = true,
      numberOfCarousels = 1,
      mode = "generate",
      headline,
      body: slideBody,
      imagePrompt,
      stream = false
    } = await req.json();

    const isBatch = (numberOfCarousels > 1) || (mode === 'plan');

    console.log("Generating LinkedIn content:", { topic, mode, isBatch, stream });

    // --- STREAMING MODE ---
    if (stream && mode !== "image_only" && mode !== "plan") {
      return handleStreamingGeneration(req, {
        topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction,
        format, wantImages, numberOfCarousels, isBatch
      });
    }

    // --- HANDLE IMAGE ONLY MODE ---
    if (mode === "image_only") {
         const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
         if (!LOVABLE_API_KEY) throw new Error("Missing Lovable Key");

         const burnedInPrompt = `
Create a professional LinkedIn carousel slide image with TEXT BURNED IN.
Format: 1080x1080 square image.
Brand: Lifetrek Medical (precision medical manufacturing).
Colors: Deep blue background (#003052), white text, green accent (#228B22).

HEADLINE (must appear prominently in image): "${headline}"
BODY TEXT (smaller, below headline): "${slideBody}"

LAYOUT REQUIREMENTS:
- Deep blue gradient background (#003052 to #004080)
- Top left: Small "LM" logo in white box
- Center: Large, bold white headline text
- Below headline: Green accent line/bar
- Below line: Body text in white (smaller)
- Bottom: "Lifetrek Medical | lifetrek-medical.com" footer

TYPOGRAPHY:
- Headline: Bold sans-serif, large (like 48-60pt equivalent)
- Body: Regular weight, medium size (like 18-24pt equivalent)
- All text must be CLEARLY READABLE

STYLE: Clean, corporate, medical B2B aesthetic. Premium LinkedIn carousel look.
The text MUST be part of the image, not overlaid.`.trim();

        const imgRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
            model: IMAGE_MODEL,
            messages: [
                { role: "user", content: burnedInPrompt }
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

    // Fetch available assets
    const { data: assets, error: assetsError } = await supabase
      .from("content_assets")
      .select("id, filename, category, tags")
      .limit(50);

    if (assetsError) {
      console.warn("Could not fetch assets (non-fatal):", assetsError.message, assetsError.code);
    }

    const assetsContext = assets?.map((a: any) => {
      const category = a.category || "general";
      const tags = Array.isArray(a.tags) ? a.tags.join(", ") : "none";
      return `- [${category.toUpperCase()}] ID: ${a.id} (Tags: ${tags}, Filename: ${a.filename})`;
    }).join("\n") || "No assets available. AI will generate all images.";

    const SYSTEM_PROMPT = constructSystemPrompt(assetsContext);
    let userPrompt = constructUserPrompt(topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, isBatch, numberOfCarousels);
    
    if (mode === 'plan') {
        userPrompt += "\n\nIMPORTANT: The user wants to see 3 DISTINCT STRATEGIC ANGLES/PLANS for this topic. Generate 3 variants (Batch Mode) so the user can choose the best one. Focus on the HEADLINES and HOOKS differentiation.";
    }

    const tools = getTools(isBatch);

    // === STRATEGIST AGENT ===
    const strategistStartTime = Date.now();
    console.log("📝 [STRATEGIST] Starting content generation...");
    console.log(`📝 [STRATEGIST] Topic: "${topic}", Audience: "${targetAudience}", Mode: ${mode}`);

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

    const strategistTime = Date.now() - strategistStartTime;

    if (!response.ok) {
      console.error(`❌ [STRATEGIST] API error: ${response.status}`);
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

    let resultCarousels = isBatch ? args.carousels : [args];
    if (!resultCarousels) resultCarousels = [];

    console.log(`⏱️ [STRATEGIST] Response received in ${strategistTime}ms`);
    console.log(`📄 [STRATEGIST] Generated ${resultCarousels.length} carousel(s) with ${resultCarousels[0]?.slides?.length || 0} slides each`);
    if (resultCarousels[0]?.slides?.[0]) {
      console.log(`📄 [STRATEGIST] Hook headline: "${resultCarousels[0].slides[0].headline?.substring(0, 50)}..."`);
    }

    if (mode === 'plan') {
         console.log(`✅ [PLAN MODE] Returning ${resultCarousels.length} strategy options (no images/critique)`);
         return new Response(
            JSON.stringify({ carousels: resultCarousels, mode: 'plan_results' }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }

    // --- CRITIQUE LOOP (BRAND ANALYST) ---
    if (LOVABLE_API_KEY !== "mock-key-for-testing" && mode !== "image_only") {
      const analystStartTime = Date.now();
      console.log("🧐 [ANALYST] Starting brand review...");
      console.log(`🧐 [ANALYST] Reviewing ${resultCarousels.length} carousel(s) against Brand Book checklist`);
      
      const critiqueSystemPrompt = `You are the Brand & Quality Analyst for Lifetrek Medical.
Mission: Review drafts to ensure On-brand voice, Technical credibility, and Strategic alignment.

=== CHECKLIST ===
1. **Avatar & Problem**: Is the avatar clearly identified (Callout)? Is ONE main problem addressed?
2. **Value**: Is the "dream outcome" (safer launches, fewer NCs) obvious?
3. **Hook**: Does slide 1 follow the "Callout + Payoff" formula? (e.g. "Orthopedic OEMs: ...")
4. **Proof**: Are specific machines (Citizen M32) or standards (ISO 13485) used as proof? No generic claims.
5. **CTA**: Is there a single, low-friction CTA?

=== OUTPUT ===
Refine the content and output the SAME JSON structure. 
- If the hook is weak, REWRITE IT.
- If the proof is vague, ADD specific machine names.
- If the tone is salesy, make it more ENGINEER-to-ENGINEER.
`;

      const critiqueUserPrompt = `Here is the draft content produced by the Copywriter:
${JSON.stringify(resultCarousels)}

Critique and REFINE this draft using your checklist.
Focus heavily on the HOOK (Slide 1) and PROOF (Technical specificities).
Return the refined JSON object (carousels array).`;

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
               tools: tools,
               tool_choice: { type: "function", function: { name: isBatch ? "create_batch_carousels" : "create_carousel" } },
            }),
         });

         const analystTime = Date.now() - analystStartTime;

         if (!critiqueRes.ok) {
           if (critiqueRes.status === 429 || critiqueRes.status === 402) {
             console.warn(`❌ [ANALYST] Rate limit/payment issue: ${critiqueRes.status}`);
           } else {
             console.warn(`❌ [ANALYST] API error: ${critiqueRes.status}`);
           }
         }
         
         const critiqueData = await critiqueRes.json();
         const refinedToolCall = critiqueData.choices?.[0]?.message?.tool_calls?.[0];
         
         if (refinedToolCall) {
            const refinedArgs = JSON.parse(refinedToolCall.function.arguments);
            const refinedCarousels = isBatch ? refinedArgs.carousels : [refinedArgs];
            if (refinedCarousels && refinedCarousels.length > 0) {
               const originalHook = resultCarousels[0]?.slides?.[0]?.headline || "";
               const refinedHook = refinedCarousels[0]?.slides?.[0]?.headline || "";
               const hookChanged = originalHook !== refinedHook;
               
               console.log(`⏱️ [ANALYST] Response received in ${analystTime}ms`);
               console.log(`✅ [ANALYST] Content refined. Changes:`);
               if (hookChanged) {
                 console.log(`   - Hook REWRITTEN: "${originalHook.substring(0, 40)}..." → "${refinedHook.substring(0, 40)}..."`);
               } else {
                 console.log(`   - Hook unchanged (already strong)`);
               }
               
               resultCarousels = refinedCarousels;
            }
         } else {
           console.log(`⏱️ [ANALYST] Response received in ${analystTime}ms (no changes)`);
         }
       } catch (e) {
         console.warn("⚠️ [ANALYST] Critique failed, using original draft:", e);
       }
    }

    // === PARALLEL IMAGE PROCESSING ===
    console.log(`🖼️ Starting parallel image processing for ${resultCarousels.length} carousels...`);
    const imageStartTime = Date.now();

    async function generateSlideImage(slide: any): Promise<string> {
      // 1. Try Asset first
      if (slide.backgroundType === "asset" && slide.assetId) {
        try {
          const { data: assetData } = await supabase.from("content_assets").select("filename").eq("id", slide.assetId).single();
          if (assetData) {
            const { data: publicUrlData } = supabase.storage.from("content-assets").getPublicUrl(assetData.filename);
            if (publicUrlData?.publicUrl) {
              console.log(`✅ Using asset for slide: ${slide.headline?.substring(0, 25)}...`);
              return publicUrlData.publicUrl;
            }
          }
        } catch (e) {
          console.warn(`Asset fetch failed for ${slide.assetId}:`, e);
        }
      }

      // 2. Generate new image if needed
      if (!wantImages || (slide.backgroundType !== "generate" && slide.assetId)) {
        return "";
      }

      const basePrompt = slide.imageGenerationPrompt || `Professional medical manufacturing scene for: ${slide.headline}`;
      const fullPrompt = `${basePrompt}
STYLE: Photorealistic, professional, ISO 13485 medical manufacturing aesthetic.
COMPOSITION: Clean, modern, high-end industrial photography.
LIGHTING: Soft studio lighting, highlight precision equipment.`;

      const maxRetries = 2;
      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
          console.log(`🖼️ Generating image for: ${slide.headline?.substring(0, 30)}... (attempt ${attempt + 1})`);
          
          const imgResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
            body: JSON.stringify({
              model: IMAGE_MODEL,
              messages: [
                { role: "system", content: "You are a professional medical equipment photographer and designer." },
                { role: "user", content: fullPrompt }
              ],
              modalities: ["image", "text"]
            }),
          });
          
          if (!imgResponse.ok) {
            console.warn(`Image API returned ${imgResponse.status}`);
            continue;
          }
          
          const imgData = await imgResponse.json();
          const imageUrl = imgData.choices?.[0]?.message?.images?.[0]?.image_url?.url || "";
          
          if (imageUrl) {
            console.log(`✅ Image generated for: ${slide.headline?.substring(0, 25)}...`);
            return imageUrl;
          }
        } catch (e) {
          console.error(`Image gen attempt ${attempt + 1} failed:`, e);
          if (attempt < maxRetries) {
            await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
          }
        }
      }
      return "";
    }

    // Collect all slides needing processing
    interface SlideTask {
      carouselIndex: number;
      slideIndex: number;
      slide: any;
    }
    
    const allSlideTasks: SlideTask[] = [];
    (resultCarousels as any[]).forEach((carousel, carouselIndex) => {
      if (!carousel?.slides) return;
      const slidesToProcess = format === "single-image" ? [carousel.slides[0]] : carousel.slides;
      slidesToProcess.forEach((slide: any, slideIndex: number) => {
        if (slide) {
          allSlideTasks.push({ carouselIndex, slideIndex, slide });
        }
      });
    });

    console.log(`📊 Total slides to process: ${allSlideTasks.length}`);

    // Process in parallel batches (concurrency limit = 5)
    const CONCURRENCY_LIMIT = 5;
    const imageResults: { carouselIndex: number; slideIndex: number; imageUrl: string }[] = [];

    for (let i = 0; i < allSlideTasks.length; i += CONCURRENCY_LIMIT) {
      const batch = allSlideTasks.slice(i, i + CONCURRENCY_LIMIT);
      console.log(`⚡ Processing batch ${Math.floor(i / CONCURRENCY_LIMIT) + 1}/${Math.ceil(allSlideTasks.length / CONCURRENCY_LIMIT)} (${batch.length} images)`);
      
      const batchPromises = batch.map(async (task) => {
        const imageUrl = await generateSlideImage(task.slide);
        return { carouselIndex: task.carouselIndex, slideIndex: task.slideIndex, imageUrl };
      });

      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, idx) => {
        if (result.status === "fulfilled") {
          imageResults.push(result.value);
        } else {
          console.error(`Slide image failed:`, result.reason);
          imageResults.push({
            carouselIndex: batch[idx].carouselIndex,
            slideIndex: batch[idx].slideIndex,
            imageUrl: ""
          });
        }
      });
    }

    // Assign images back to carousels
    imageResults.forEach(({ carouselIndex, slideIndex, imageUrl }) => {
      if (resultCarousels[carouselIndex]?.slides?.[slideIndex]) {
        resultCarousels[carouselIndex].slides[slideIndex].imageUrl = imageUrl;
      }
    });

    // Build imageUrls array for each carousel
    resultCarousels.forEach((carousel: any) => {
      if (carousel?.slides) {
        carousel.imageUrls = carousel.slides.map((s: any) => s.imageUrl || "");
      }
    });

    const imageTime = Date.now() - imageStartTime;
    const successCount = imageResults.filter(r => r.imageUrl).length;
    console.log(`🖼️ Image processing complete in ${imageTime}ms (${successCount}/${allSlideTasks.length} successful)`);

    // Return response
    const finalResponse = isBatch 
      ? { carousels: resultCarousels }
      : resultCarousels[0];

    console.log(`✅ LinkedIn content generated successfully`);

    return new Response(
      JSON.stringify(finalResponse),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error generating LinkedIn content:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Failed to generate content" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
