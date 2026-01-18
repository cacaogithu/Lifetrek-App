import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { uploadFileToDrive, getConfig, createFolder } from "../_shared/google-drive.ts";

// Story 7.2: Multi-Agent Pipeline
import { strategistAgent, copywriterAgent, designerAgent, brandAnalystAgent } from "./agents.ts";
import { CarouselParams, AgentMetrics } from "./types.ts";
// Story 7.7: Vector embeddings for learning loop
import { generateCarouselEmbedding } from "./agent_tools.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Story 7.3: ✅ Implemented AI-native text rendering with Imagen 3
// Story 7.1: ✅ Removed broken Satori pipeline - text rendered directly by AI model


serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Setup Supabase Client
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseKey);


  try {
    const requestBody = await req.json();
    let { topic, targetAudience, painPoint, desiredOutcome, proofPoints, ctaAction, format = "carousel", profileType = "company", style = "visual", researchLevel = "light", action, existingSlides } = requestBody;

    let jobId = requestBody.job_id;
    let job: any = null;

    // ASYNC JOB MODE CHECK
    if (jobId) {
      console.log(`Processing Async Job: ${jobId}`);

      const { data: jobData, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();

      job = jobData;

      if (jobError || !job) {
        throw new Error(`Job ${jobId} not found: ${jobError?.message}`);
      }

      console.log(`Job Topic: ${job.payload?.topic}`);

      await supabase.from('jobs').update({
        status: 'processing',
        started_at: new Date().toISOString()
      }).eq('id', jobId);

      const payload = job.payload;
      topic = payload.topic;
      targetAudience = payload.targetAudience;
      painPoint = payload.painPoint;
      desiredOutcome = payload.desiredOutcome;
      proofPoints = payload.proofPoints;
      ctaAction = payload.ctaAction;
      format = payload.format || "carousel";
      profileType = payload.profileType || "company";
      style = payload.style || "visual"; // Default to old style
      researchLevel = payload.researchLevel || "light"; // Default to light research
      action = payload.action;
      existingSlides = payload.existingSlides;
    }

    console.log("Processing LinkedIn content request:", { topic, action, profileType, style, researchLevel, mode: jobId ? 'ASYNC' : 'SYNC' });

    // const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    // if (!GEMINI_API_KEY) {
    //   throw new Error("GEMINI_API_KEY not configured");
    // }

    const GCP_PROJECT_ID = await getConfig("GCP_PROJECT_ID");
    const GCP_REGION = await getConfig("GCP_REGION");
    const VERTEX_API_KEY = Deno.env.get("VERTEX_API_KEY") || await getConfig("VERTEX_API_KEY");

    if (!GCP_PROJECT_ID || !GCP_REGION || !VERTEX_API_KEY) {
      console.error("Missing GCP/Vertex configuration", { GCP_PROJECT_ID, GCP_REGION, hasVertexKey: !!VERTEX_API_KEY });
    }

    // Context definitions based on profile type
    const contexts = {
      company: {
        role: "authoritative industry leader",
        tone: "professional, innovative, and reliable",
        pronoun: "we",
        perspective: "As a leader in medical manufacturing...",
        imageStyle: "Corporate, clean, highly engineered, official branding elements."
      },
      salesperson: {
        role: "growth-focused medical device sales expert",
        tone: "persuasive, direct, high-energy, and sales-driven",
        pronoun: "I",
        perspective: "I help manufacturers cut costs and scale faster. Here is the deal...",
        imageStyle: "Dynamic, business-focused, less abstract, more 'results-oriented' visuals (charts, handshakes, clear value prop overlays)."
      }
    };

    const ctx = contexts[profileType as keyof typeof contexts] || contexts.company;

    let carousel: any = {};
    let pipelineStartTime = Date.now();

    // Prepare parameters for agents
    const agentParams: CarouselParams = {
      topic,
      targetAudience,
      painPoint,
      desiredOutcome,
      proofPoints,
      ctaAction,
      profileType,
      style,
      researchLevel
    };

    // Initialize metrics
    const reviewerModel = Deno.env.get("BRAND_ANALYST_MODEL") || "gemini-2.0-flash-exp";
    let metrics: Partial<AgentMetrics> = {
      model_versions: {
        strategist: "gemini-2.0-flash-exp",
        copywriter: "gemini-2.0-flash-exp",
        designer: "imagen-3.0-generate-001", // Story 7.3: Upgraded to Imagen 3 with text rendering
        reviewer: reviewerModel // Fixed: Using same model as Brand Analyst
      }
    };

    if (action === "regenerate_images" && existingSlides) {
      console.log("Regenerating images for existing slides...");
      carousel = {
        topic,
        slides: existingSlides
      };
      // Regenerate mode: skip text generation agents
      metrics.model_versions!.strategist = "n/a";
      metrics.model_versions!.copywriter = "n/a";
      metrics.strategy_time_ms = 0;
      metrics.copywriting_time_ms = 0;
    } else {
      // Story 7.2: Multi-Agent Pipeline - Strategist → Copywriter
      console.log("🚀 Multi-Agent Pipeline: Starting carousel generation...");

      // Agent 1: Strategist (Story 7.7: passes supabase for similar carousel search)
      const strategyStartTime = Date.now();
      const strategy = await strategistAgent(agentParams, supabase);
      metrics.strategy_time_ms = Date.now() - strategyStartTime;

      // Agent 2: Copywriter
      const copyStartTime = Date.now();
      carousel = await copywriterAgent(agentParams, strategy);
      metrics.copywriting_time_ms = Date.now() - copyStartTime;

      console.log(`✅ Multi-Agent Pipeline: Generated ${carousel.slides.length} slides in ${Date.now() - pipelineStartTime}ms`);
    }

    // --- Agent 3: Designer - Image Generation with RAG Asset Retrieval ---
    const designStartTime = Date.now();

    const generatedImages = await designerAgent(supabase, agentParams, carousel);
    metrics.design_time_ms = Date.now() - designStartTime;

    // Extract image URLs for backward compatibility
    const imageUrls = generatedImages.map(img => img.image_url);

    const imageUrls_OLD: string[] = [];
    const slidesToGenerate = format === "single-image" ? [carousel.slides[0]] : carousel.slides;

    // Old image generation logic removed - now using Designer agent above
    // Story 7.3: ✅ Designer agent uses Imagen 3 for AI-native text rendering
    // No separate branding overlay needed - text, logo, colors rendered in single step

    // Track asset usage
    const validAiImages = generatedImages.filter(
      img => img.asset_source === 'ai-generated' && img.image_url && !img.image_url.startsWith("ERROR")
    );
    const imageErrors = generatedImages
      .filter(img => img.image_url?.startsWith("ERROR"))
      .map((img) => ({
        slide_index: img.slide_index,
        error: img.image_url
      }));

    metrics.assets_used_count = generatedImages.filter(img => img.asset_source === 'real').length;
    metrics.assets_generated_count = validAiImages.length;

    // NEW: Gracefully handle quota/generation errors
    if (imageErrors.length > 0) {
      console.warn(`⚠️ ${imageErrors.length} slide images failed generation. Continuing with available assets.`);
    }

    // --- Agent 4: Brand Analyst - Quality Review ---
    const reviewStartTime = Date.now();
    const qualityReview = await brandAnalystAgent(carousel, generatedImages);
    metrics.review_time_ms = Date.now() - reviewStartTime;

    metrics.total_time_ms = Date.now() - (pipelineStartTime || Date.now());
    metrics.regeneration_count = 0; // First attempt

    // Story 7.7: Generate embedding for successful carousels (learning loop)
    let carouselEmbedding: number[] | null = null;
    const reviewScore = typeof qualityReview.overall_score === "number"
      ? qualityReview.overall_score
      : Number(qualityReview.overall_score);
    const embeddingEligible = Number.isFinite(reviewScore) && reviewScore >= 70;

    if (embeddingEligible) {
      try {
        console.log("🔢 Generating embedding for successful carousel (quality >= 70)...");
        carouselEmbedding = await generateCarouselEmbedding(carousel.topic, carousel.slides);
        if (carouselEmbedding) {
          console.log(`✅ Generated ${carouselEmbedding.length}d embedding for learning loop`);
        } else {
          console.warn("⚠️ Embedding generation returned null (check API key/config)");
        }
      } catch (error) {
        console.warn("⚠️ Failed to generate embedding (non-critical):", error);
      }
    }

    console.log(`🏁 Multi-Agent Pipeline Complete:
  ├─ Strategy: ${metrics.strategy_time_ms || 0}ms
  ├─ Copywriting: ${metrics.copywriting_time_ms || 0}ms
  ├─ Design: ${metrics.design_time_ms}ms (${metrics.assets_used_count} real assets, ${metrics.assets_generated_count} AI-generated)
  ├─ Review: ${metrics.review_time_ms}ms
  └─ Total: ${metrics.total_time_ms}ms

  Quality Score: ${qualityReview.overall_score}/100 ${qualityReview.needs_regeneration ? '(NEEDS REGENERATION)' : '✅ (APPROVED)'}
  Feedback: ${qualityReview.feedback}`);

    // --- Google Drive Upload Logic ---
    const GOOGLE_DRIVE_FOLDER_ID = await getConfig("GOOGLE_DRIVE_FOLDER_ID");

    if (GOOGLE_DRIVE_FOLDER_ID) {
      console.log("📂 Uploading images to Google Drive...");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const cleanTopic = topic.replace(/[^a-zA-Z0-9]/g, "_").substring(0, 30);

      // Create a subfolder for this specific post
      const subFolderName = `${timestamp}_${cleanTopic}`;
      const postFolderId = await createFolder(subFolderName, GOOGLE_DRIVE_FOLDER_ID);

      const targetFolderId = postFolderId || GOOGLE_DRIVE_FOLDER_ID; // Fallback to root if folder creation fails

      // NEW: Upload a text file with the slides content and caption
      try {
        const slidesText = carousel.slides.map((s: any, i: number) => `--- SLIDE ${i + 1} ---\nTITLE: ${s.title || ''}\nCONTENT: ${s.content || ''}\n${s.footer ? `FOOTER: ${s.footer}` : ''}`).join('\n\n');
        const fullText = `TOPIC: ${topic}\n\nCAPTION:\n${carousel.caption}\n\nSLIDES CONTENT:\n${slidesText}`;
        const textBytes = new TextEncoder().encode(fullText);
        await uploadFileToDrive("slides.txt", textBytes, targetFolderId, "text/plain");
        console.log("✅ Uploaded slides.txt to Drive");
      } catch (textError) {
        console.error("Failed to upload slides.txt to Drive:", textError);
      }

      // We need to fetch the image data again to upload it, or decode the base64
      // Since we have the base64 string, we can convert it to a Blob
      await Promise.all(imageUrls.map(async (dataUrl, index) => {
        if (!dataUrl) return;

        // Skip error messages
        if (dataUrl.startsWith("ERROR")) {
          console.warn(`⚠️ Skipping upload for slide ${index + 1} due to generation error: ${dataUrl}`);
          return;
        }

        try {
          // dataUrl is "data:image/png;base64,..."
          const base64Data = dataUrl.split(",")[1];
          const binaryString = atob(base64Data);
          const len = binaryString.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const filename = `slide_${index + 1}.png`;
          await uploadFileToDrive(filename, bytes, targetFolderId);
        } catch (e) {
          console.error(`Failed to prepare upload for slide ${index + 1}:`, e);
        }
      }));
    } else {
      console.warn("⚠️ GOOGLE_DRIVE_FOLDER_ID not set. Skipping Drive upload.");
    }

    console.log(`Content generation complete: ${imageUrls.length} images generated`);

    // Collect asset URLs for metadata
    const assets_used = generatedImages
      .filter(img => img.asset_source === 'real' && img.asset_url)
      .map(img => img.asset_url!);

    // Story 7.2 & 7.8: Include metadata and quality score in response
    // Story 7.7: Include embedding for learning loop
    const result = {
      carousel: { ...carousel, format, imageUrls },
      metadata: {
        generation_metadata: metrics,
        quality_score: qualityReview.overall_score,
        quality_feedback: qualityReview.feedback,
        assets_used: assets_used,
        regeneration_count: 0,
        content_embedding: carouselEmbedding // Story 7.7: For saving to vector store
      },
      debug: {
        imageCount: imageUrls.length,
        realAssets: metrics.assets_used_count,
        aiGenerated: metrics.assets_generated_count,
        imageErrors
      }
    };

    if (jobId) {
      // Story 7.2: Save to linkedin_carousels autonomously (worker-side)
      // This ensures posts appear in Content Approval even if user navigates away
      try {
        const userId = job?.user_id || (await supabase.auth.getUser())?.data?.user?.id;
        if (!userId) {
          console.warn("No user_id found for carousel save, skipping autonomous save.");
          return;
        }

        const insertData = {
          admin_user_id: userId,
          user_id: userId, // Set both for compatibility
          profile_type: profileType,
          topic: topic,
          target_audience: targetAudience,
          pain_point: painPoint,
          desired_outcome: desiredOutcome,
          proof_points: proofPoints,
          cta_action: ctaAction,
          slides: carousel.slides as any,
          caption: carousel.caption,
          format: format,
          image_urls: imageUrls,
          status: 'pending_approval',
          quality_score: qualityReview.overall_score,
          generation_metadata: metrics,
          assets_used: assets_used,
          regeneration_count: 0,
          generation_settings: {
            model: metrics.model_versions?.copywriter || "gemini-2.0-flash-exp",
            timestamp: new Date().toISOString(),
            quality_score: qualityReview.overall_score,
            metrics: metrics
          }
        };

        const { data: carouselRecord, error: insertError } = await supabase
          .from("linkedin_carousels")
          .insert([insertData])
          .select()
          .single();

        if (insertError) {
          console.error("Error inserting into linkedin_carousels:", insertError);
          // NEW: Save the insertion error to the job record so we can see it in Job Monitor
          await supabase.from('jobs').update({
            error: `Carousel Save Error: ${insertError.message} (${insertError.code})`,
            checkpoint_data: { insert_failed: true, insert_error: insertError, insert_payload: insertData }
          }).eq('id', jobId);
        } else {
          console.log(`✅ Saved carousel ${carouselRecord.id} to database`);

          // Add embedding if available
          if (carouselEmbedding && carouselRecord.id) {
            await supabase.from('carousel_embeddings').insert({
              carousel_id: carouselRecord.id,
              embedding: carouselEmbedding,
              topic: topic
            });
          }
        }
      } catch (saveError) {
        console.error("Critical error in autonomous save:", saveError);
        const errorMsg = saveError instanceof Error ? saveError.message : "Unknown error";
        await supabase.from('jobs').update({
          error: `Autonomous Save Critical Error: ${errorMsg}`
        }).eq('id', jobId);
      }

      await supabase.from('jobs').update({
        status: 'completed',
        result: result,
        completed_at: new Date().toISOString()
      }).eq('id', jobId);
      return new Response("Job Completed", { status: 200 });
    }

    return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });

  } catch (error) {
    console.error("Error in generate-linkedin-carousel:", error);
    const errorMsg = error instanceof Error ? error.message : "Unknown error";

    if (jobId) {
      await supabase.from('jobs').update({
        status: 'failed',
        error: errorMsg,
        completed_at: new Date().toISOString()
      }).eq('id', jobId);
      return new Response(`Job Failed: ${errorMsg}`, { status: 500 });
    }

    return new Response(JSON.stringify({ error: errorMsg }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});

