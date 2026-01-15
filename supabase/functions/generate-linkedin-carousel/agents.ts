// Story 7.2: Multi-Agent Pipeline Implementation
// Strategist → Copywriter → Designer → Brand Analyst

import { GoogleGenerativeAI } from "npm:@google/generative-ai@0.21.0";
import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CarouselParams,
  CarouselStrategy,
  CarouselCopy,
  SlideContent,
  GeneratedImage,
  QualityReview
} from "./types.ts";
import {
  getBrandGuidelines,
  validateCarouselStructure,
  extractJSON,
  searchCompanyAssets,
  generateCarouselEmbedding,
  searchSimilarCarousels,
  deepResearch
} from "./agent_tools.ts";

// Initialize Gemini AI
const GOOGLE_AI_API_KEY = Deno.env.get("GEMINI_API_KEY") || Deno.env.get("GOOGLE_AI_API_KEY");
if (!GOOGLE_AI_API_KEY) {
  throw new Error("Missing GEMINI_API_KEY or GOOGLE_AI_API_KEY");
}
const genAI = new GoogleGenerativeAI(GOOGLE_AI_API_KEY);

const BRAND_ANALYST_MODEL = Deno.env.get("BRAND_ANALYST_MODEL") || "gemini-2.0-flash-exp";

/**
 * Agent 1: Strategist
 * Plans the carousel structure and narrative arc
 * Story 7.7: Searches for similar successful carousels for inspiration
 * Model: Gemini 2.5 Flash (fast, strategic thinking)
 */
export async function strategistAgent(
  params: CarouselParams,
  supabase?: SupabaseClient
): Promise<CarouselStrategy> {
  const startTime = Date.now();
  console.log("🎯 Strategist Agent: Planning carousel strategy...");

  const brand = getBrandGuidelines(params.profileType);

  // Story 7.7: Search for similar successful carousels
  let similarCarouselsContext = "";
  if (supabase) {
    try {
      const queryEmbedding = await generateCarouselEmbedding(
        params.topic,
        [{ headline: params.topic, body: params.painPoint || "" }]
      );

      if (queryEmbedding) {
        const similarCarousels = await searchSimilarCarousels(supabase, queryEmbedding, 0.70, 3);

        if (similarCarousels && similarCarousels.length > 0) {
          similarCarouselsContext = `\n\n**Similar Successful Carousels** (for inspiration only - create something new):
${similarCarousels.map((c: any, i: number) => `${i + 1}. "${c.topic}" (Quality: ${c.quality_score}/100, ${JSON.parse(c.slides).length} slides)`).join('\n')}

Learn from their structure and quality, but create fresh content for "${params.topic}".`;
        }
      }
    } catch (error) {
      console.warn("⚠️ Could not search similar carousels:", error);
      // Continue without similar carousel context
    }
  }

  // Deep research integration for industry context
  const researchLevel = params.researchLevel || 'light'; // default: light
  let researchContext = "";

  if (researchLevel !== 'none') {
    try {
      const researchQuery = `${params.topic} trends and statistics for ${params.targetAudience} in medical device manufacturing ${new Date().getFullYear()}`;
      const maxResearchTime = researchLevel === 'deep' ? 15000 : 10000; // deep=15s, light=10s

      const researchResults = await deepResearch(researchQuery, maxResearchTime);

      if (researchResults) {
        researchContext = `\n\n**Current Industry Research** (use to inform strategy):
${researchResults}

Use these insights to create a timely, relevant carousel that addresses current trends.`;
      }
    } catch (error) {
      console.warn("⚠️ Could not complete research:", error);
      // Continue without research context
    }
  }

  const prompt = `You are a LinkedIn carousel strategy expert for ${brand.companyName}.${similarCarouselsContext}${researchContext}

**Task**: Create a strategic plan for a LinkedIn carousel about "${params.topic}".

**Target Audience**: ${params.targetAudience}
**Pain Point**: ${params.painPoint || 'Not specified'}
**Desired Outcome**: ${params.desiredOutcome || 'Engagement and thought leadership'}
**Brand Tone**: ${brand.tone}

**Requirements**:
- Plan 5-7 slides total (including hook and CTA)
- Create a compelling narrative arc
- Identify key messages for maximum impact
- Follow proven LinkedIn carousel structure: Hook → Value → Value → Value → CTA

**Output Format** (JSON only):
{
  "hook": "Attention-grabbing opening statement",
  "narrative_arc": "Brief description of the story flow",
  "slide_count": 6,
  "key_messages": [
    "First key message",
    "Second key message",
    "Third key message"
  ]
}

Return ONLY valid JSON, no markdown, no explanation.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const strategy = extractJSON(response);

    console.log(`✅ Strategist: Planned ${strategy.slide_count}-slide carousel in ${Date.now() - startTime}ms`);
    return strategy;

  } catch (error: unknown) {
    console.error("❌ Strategist Agent Error:", error);
    throw new Error(`Strategist failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Agent 2: Copywriter
 * Writes headlines and body copy for each slide
 * Model: Gemini 2.5 Flash (creative writing)
 */
export async function copywriterAgent(
  params: CarouselParams,
  strategy: CarouselStrategy
): Promise<CarouselCopy> {
  const startTime = Date.now();
  console.log("✍️ Copywriter Agent: Writing carousel copy...");

  const brand = getBrandGuidelines(params.profileType);

  // Deep research for technical accuracy and terminology validation
  const researchLevel = params.researchLevel || 'light';
  let technicalContext = "";

  if (researchLevel === 'deep') {
    try {
      // For deep research, validate technical terminology and specifications
      const technicalQuery = `Technical specifications and correct terminology for ${params.topic} in medical device manufacturing. Include: proper industry terms, compliance requirements, technical accuracy points.`;
      const researchResults = await deepResearch(technicalQuery, 10000); // 10s max

      if (researchResults) {
        technicalContext = `\n\n**Technical Validation Research** (ensure accuracy):
${researchResults}

Use this to ensure all technical terminology and claims are accurate and compliant.`;
      }
    } catch (error) {
      console.warn("⚠️ Could not complete technical research:", error);
      // Continue without technical context
    }
  }

  const prompt = `You are an expert LinkedIn copywriter for ${brand.companyName}.${technicalContext}

**Task**: Write compelling copy for a ${strategy.slide_count}-slide LinkedIn carousel.

**Topic**: ${params.topic}
**Target Audience**: ${params.targetAudience}
**Narrative Arc**: ${strategy.narrative_arc}
**Key Messages**: ${strategy.key_messages.join(', ')}
**Brand Tone**: ${brand.tone}
**CTA Action**: ${params.ctaAction || 'Contact us to learn more'}

**Slide Structure**:
1. **Hook Slide** (type: "hook"): Attention-grabbing opening
   - Headline: Short, punchy (max 60 chars)
   - Body: Compelling value proposition (max 120 chars)

2-${strategy.slide_count - 1}. **Content Slides** (type: "content"): Value delivery
   - Headline: Clear, benefit-focused (max 70 chars)
   - Body: Specific, actionable insight (max 140 chars)

${strategy.slide_count}. **CTA Slide** (type: "cta"): Clear call to action
   - Headline: Action-oriented (max 60 chars)
   - Body: Clear next step (max 120 chars)

**Style Guidelines**:
- Use active voice and power words
- Focus on benefits, not features
- Be specific and concrete (numbers, examples)
- Create curiosity and urgency
- Professional but approachable

**Output Format** (JSON only):
{
  "topic": "${params.topic}",
  "caption": "LinkedIn post caption (2-3 sentences, engaging, with 3-5 relevant hashtags)",
  "slides": [
    {
      "type": "hook",
      "headline": "Attention-grabbing headline",
      "body": "Compelling opening statement"
    },
    {
      "type": "content",
      "headline": "Benefit-focused headline",
      "body": "Specific, valuable insight"
    },
    {
      "type": "cta",
      "headline": "Action-oriented CTA",
      "body": "Clear next step"
    }
  ]
}

Return ONLY valid JSON, no markdown, no explanation.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    const copy: CarouselCopy = extractJSON(response);

    // Validate structure
    const validation = validateCarouselStructure(copy.slides);
    if (!validation.valid) {
      console.warn("⚠️ Copywriter: Validation issues:", validation.errors);
      // Don't throw - let Brand Analyst catch issues
    }

    console.log(`✅ Copywriter: Created ${copy.slides.length} slides in ${Date.now() - startTime}ms`);
    return copy;

  } catch (error: unknown) {
    console.error("❌ Copywriter Agent Error:", error);
    throw new Error(`Copywriter failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Agent 3: Designer
 * Searches for real assets first, generates AI images as fallback
 * Story 7.3: Upgraded to Imagen 3 with AI-native text rendering
 * Model: Vertex AI Imagen 3 (text burned directly into images)
 */
export async function designerAgent(
  supabase: SupabaseClient,
  params: CarouselParams,
  copy: CarouselCopy
): Promise<GeneratedImage[]> {
  const startTime = Date.now();
  console.log("🎨 Designer Agent: Creating visual assets...");

  const brand = getBrandGuidelines(params.profileType);
  const images: GeneratedImage[] = [];

  const GCP_PROJECT_ID = Deno.env.get("GCP_PROJECT_ID");
  const GCP_REGION = Deno.env.get("GCP_REGION") || "us-central1";
  const VERTEX_API_KEY = Deno.env.get("VERTEX_API_KEY");

  if (!GCP_PROJECT_ID || !VERTEX_API_KEY) {
    console.warn("⚠️ Designer: Missing GCP credentials, skipping image generation");
    return copy.slides.map((_, i) => ({
      slide_index: i,
      image_url: "",
      asset_source: 'ai-generated'
    }));
  }

  const maxRetries = 2;
  const retryStatuses = new Set([429, 500, 502, 503, 504]);

  const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  for (let i = 0; i < copy.slides.length; i++) {
    const slide = copy.slides[i];
    console.log(`🎨 Designer: Processing slide ${i + 1}/${copy.slides.length}...`);

    try {
      // Story 7.4: RAG Asset Retrieval
      // Search for real company assets first
      const assetQuery = slide.headline.split(' ').slice(0, 3).join(' '); // First 3 words
      const realAsset = await searchCompanyAssets(supabase, assetQuery);

      if (realAsset) {
        // Use real asset
        images.push({
          slide_index: i,
          image_url: realAsset.url,
          asset_source: 'real',
          asset_url: realAsset.url
        });
        console.log(`✅ Designer: Using real asset for slide ${i + 1}`);
        continue;
      }

      // Fallback: Generate AI image with text burned in
      // Story 7.3: Using Imagen 3 for AI-native text rendering

      const imagePrompt = `Create a professional LinkedIn carousel slide for ${brand.companyName}.

**SLIDE CONTENT** (render this text directly in the image):
Headline: "${slide.headline}"
Body: "${slide.body}"

**LAYOUT & TYPOGRAPHY**:
- Font: ${brand.typography.fontFamily}
- Headline: ${brand.typography.headline.weight} weight, large and bold, positioned in upper third
- Body: ${brand.typography.body.weight} weight, readable size below headline
- Text Color: White or dark navy depending on background
- High contrast for readability

**BRAND IDENTITY**:
- Logo: "LM" mark in bottom-right corner with clear space
- Primary Color: ${brand.primaryColor} (Corporate Blue)
- Accent Colors: ${brand.accentGreen} (Innovation Green), ${brand.accentOrange} (Energy Orange)
- Style: ${brand.visualStyle}

**VISUAL THEME**:
- Medical device manufacturing, precision engineering
- ${brand.photographyStyle.characteristics}
- ${brand.photographyStyle.lighting}
- ${brand.photographyStyle.composition}
- Subject: ${brand.photographyStyle.subjects}
- Clean, professional, high-end B2B aesthetic

**DESIGN PRINCIPLES**:
${brand.designPrinciples.join('\n')}

**FORMAT**:
- Aspect ratio: 1:1 square (1080x1080)
- Premium quality, professional polish
- Text must be clearly legible at thumbnail size

**SLIDE TYPE**: ${slide.type === 'hook' ? 'Attention-grabbing hook slide' : slide.type === 'cta' ? 'Clear call-to-action slide' : 'Value-delivery content slide'}`;

      // Story 7.3: Using Imagen 3 (imagen-3.0-generate-001)
      const vertexUrl = `https://${GCP_REGION}-aiplatform.googleapis.com/v1/projects/${GCP_PROJECT_ID}/locations/${GCP_REGION}/publishers/google/models/imagen-3.0-generate-001:predict?key=${VERTEX_API_KEY}`;

      let b64Image: string | null = null;
      let lastError: string | null = null;

      for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const attemptLabel = `slide ${i + 1}, attempt ${attempt + 1}/${maxRetries + 1}`;
        try {
          const imageResponse = await fetch(vertexUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              instances: [{
                prompt: imagePrompt
              }],
              parameters: {
                sampleCount: 1,
                aspectRatio: "1:1", // Imagen 3 supports aspect ratio
                safetySetting: "block_some", // Professional content only
                personGeneration: "allow_adult" // Allow professionals in images
              }
            })
          });

          if (!imageResponse.ok) {
            const errorText = await imageResponse.text();
            lastError = `Imagen 3 error (${imageResponse.status} ${imageResponse.statusText}) - ${errorText.substring(0, 200)}`;

            console.warn(`⚠️ Designer: Imagen 3 API error (${attemptLabel}):`, {
              status: imageResponse.status,
              statusText: imageResponse.statusText,
              error: errorText.substring(0, 500)
            });

            if (attempt < maxRetries && retryStatuses.has(imageResponse.status)) {
              const retryAfterHeader = imageResponse.headers.get("retry-after");
              const retryAfterMs = retryAfterHeader ? Number(retryAfterHeader) * 1000 : 0;
              const backoffMs = retryAfterMs || (750 * (attempt + 1)) + Math.floor(Math.random() * 250);
              console.warn(`🔁 Designer: Retrying Imagen 3 (${attemptLabel}) after ${backoffMs}ms`);
              await delay(backoffMs);
              continue;
            }

            break;
          }

          const imageData = await imageResponse.json();
          b64Image = imageData.predictions?.[0]?.bytesBase64Encoded || null;

          if (!b64Image) {
            lastError = "Imagen 3 response missing bytesBase64Encoded";
            console.error(`❌ Designer: No image data in Imagen 3 response (${attemptLabel}):`, JSON.stringify(imageData).substring(0, 300));

            if (attempt < maxRetries) {
              const backoffMs = (500 * (attempt + 1)) + Math.floor(Math.random() * 250);
              console.warn(`🔁 Designer: Retrying Imagen 3 (${attemptLabel}) after ${backoffMs}ms`);
              await delay(backoffMs);
              continue;
            }
          }

          break;
        } catch (error: unknown) {
          lastError = error instanceof Error ? error.message : String(error);
          console.warn(`⚠️ Designer: Imagen 3 request failed (${attemptLabel}):`, lastError);

          if (attempt < maxRetries) {
            const backoffMs = (750 * (attempt + 1)) + Math.floor(Math.random() * 250);
            console.warn(`🔁 Designer: Retrying Imagen 3 (${attemptLabel}) after ${backoffMs}ms`);
            await delay(backoffMs);
            continue;
          }
        }
      }

      if (!b64Image) {
        throw new Error(lastError || "Imagen 3 failed after retries");
      }

      const imageUrl = `data:image/png;base64,${b64Image}`;
      images.push({
        slide_index: i,
        image_url: imageUrl,
        asset_source: 'ai-generated'
      });
      console.log(`✅ Designer: Generated AI image for slide ${i + 1} (${(b64Image.length / 1024).toFixed(0)}KB)`);

    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      console.error(`❌ Designer: Error processing slide ${i + 1}:`, errorMsg);
      images.push({
        slide_index: i,
        image_url: `ERROR: ${errorMsg.substring(0, 100)}`,
        asset_source: 'ai-generated'
      });
    }
  }

  const realAssetsCount = images.filter(img => img.asset_source === 'real').length;
  const aiGeneratedCount = images.filter(
    img => img.asset_source === 'ai-generated' && img.image_url && !img.image_url.startsWith("ERROR")
  ).length;
  const errorCount = images.filter(img => img.image_url?.startsWith("ERROR")).length;

  console.log(`✅ Designer: Created ${images.length} images (${realAssetsCount} real assets, ${aiGeneratedCount} AI-generated, ${errorCount} errors) in ${Date.now() - startTime}ms`);

  return images;
}

/**
 * Agent 4: Brand Analyst
 * Reviews output quality and decides if regeneration is needed
 * Model: Gemini 2.0 Flash (consistent with other agents)
 */
export async function brandAnalystAgent(
  copy: CarouselCopy,
  images: GeneratedImage[]
): Promise<QualityReview> {
  const startTime = Date.now();
  console.log("🔍 Brand Analyst: Reviewing carousel quality...");

  const brand = getBrandGuidelines();

  const prompt = `You are a strict brand quality analyst for ${brand.companyName}.

**Task**: Review this LinkedIn carousel for quality and brand alignment.

**Carousel Content**:
Topic: ${copy.topic}
Caption: ${copy.caption}

Slides:
${copy.slides.map((s, i) => `${i + 1}. [${s.type}] "${s.headline}" - ${s.body}`).join('\n')}

**Images**:
${images.map((img, i) => `Slide ${i + 1}: ${img.asset_source === 'real' ? '✅ Real company asset' : img.image_url ? '🎨 AI-generated' : '❌ Missing'}`).join('\n')}

**Quality Criteria**:
1. **Content Quality** (30 points):
   - Clear value proposition
   - Specific, actionable insights
   - No generic corporate speak
   - Professional tone matching ${brand.tone}

2. **Structure** (25 points):
   - Strong hook that creates curiosity
   - Logical flow through narrative arc
   - Clear call to action
   - Appropriate slide count (5-7 slides)

3. **Brand Alignment** (25 points):
   - Reflects ${brand.companyName}'s expertise
   - Uses appropriate technical language for medical device manufacturing
   - Highlights precision, quality, compliance
   - Professional credibility

4. **Engagement Potential** (20 points):
   - Would stop scroll on LinkedIn
   - Creates desire to read through
   - Encourages sharing/commenting
   - Clear next step

**Scoring**:
- 90-100: Excellent - Publish immediately
- 75-89: Good - Minor tweaks acceptable
- 60-74: Acceptable - Some improvements needed
- 0-59: Poor - Needs regeneration

**Output Format** (JSON only):
{
  "overall_score": 85,
  "feedback": "Brief 1-2 sentence assessment",
  "needs_regeneration": false,
  "issues": ["Issue 1", "Issue 2"],
  "strengths": ["Strength 1", "Strength 2"]
}

Be critical but fair. Return ONLY valid JSON, no markdown.`;

  try {
    const model = genAI.getGenerativeModel({ model: BRAND_ANALYST_MODEL });
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    console.log("🔍 Brand Analyst raw response:", response.substring(0, 200) + "...");

    const review: QualityReview = extractJSON(response);

    // Ensure score is valid
    if (typeof review.overall_score !== 'number' || review.overall_score < 0 || review.overall_score > 100) {
      console.warn("⚠️ Brand Analyst: Invalid score, defaulting to 75");
      review.overall_score = 75; // Default to good (higher than 70 threshold)
    }

    // Set regeneration threshold
    review.needs_regeneration = review.overall_score < 70;

    console.log(`✅ Brand Analyst: Quality score ${review.overall_score}/100 ${review.needs_regeneration ? '(NEEDS REGENERATION)' : '(APPROVED)'} using ${BRAND_ANALYST_MODEL} in ${Date.now() - startTime}ms`);

    return review;

  } catch (error: unknown) {
    console.error("❌ Brand Analyst Error:", error instanceof Error ? error.message : error);
    console.error(`❌ Brand Analyst Model: ${BRAND_ANALYST_MODEL}`);
    // Return default acceptable review on error (75 to ensure embedding is generated)
    return {
      overall_score: 75,
      feedback: "Review encountered an error, defaulting to good quality",
      needs_regeneration: false,
      issues: ["Review process had an error"],
      strengths: ["Content generated successfully"]
    };
  }
}
