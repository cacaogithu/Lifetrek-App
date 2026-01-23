// Story 7.2: Multi-Agent Pipeline Implementation
// Strategist → Copywriter → Designer → Brand Analyst

import { SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CarouselParams,
  CarouselStrategy,
  CarouselCopy,
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

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
const TEXT_MODEL = "google/gemini-2.0-flash-001";
const IMAGE_MODEL = "stabilityai/stable-diffusion-xl-base-1.0";

async function callOpenRouter(
  messages: { role: string; content: string }[],
  temperature: number = 0.7
): Promise<string> {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "HTTP-Referer": "https://lifetrek.app",
      "X-Title": "Lifetrek App",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: TEXT_MODEL,
      messages: messages,
      temperature: temperature,
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenRouter Error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callOpenRouterImage(prompt: string): Promise<string | null> {
  try {
    const response = await fetch("https://openrouter.ai/api/v1/images/generations", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://lifetrek.app",
        "X-Title": "Lifetrek App",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: IMAGE_MODEL,
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`OpenRouter Image Error: ${response.status} - ${errorText}`);
      return null;
    }

    const data = await response.json();
    return data.data?.[0]?.url || null; // standard OpenAI format
  } catch (error) {
    console.warn("OpenRouter Image Call Failed:", error);
    return null;
  }
}

/**
 * Agent 1: Strategist
 * Plans the carousel structure and narrative arc
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
    }
  }

  const researchLevel = params.researchLevel || 'light';
  let researchContext = "";

  if (researchLevel !== 'none') {
    try {
      const researchQuery = `${params.topic} trends and statistics for ${params.targetAudience} in medical device manufacturing ${new Date().getFullYear()}`;
      const maxResearchTime = researchLevel === 'deep' ? 15000 : 10000;
      const researchResults = await deepResearch(researchQuery, maxResearchTime);

      if (researchResults) {
        researchContext = `\n\n**Current Industry Research** (use to inform strategy):
${researchResults}

Use these insights to create a timely, relevant carousel that addresses current trends.`;
      }
    } catch (error) {
      console.warn("⚠️ Could not complete research:", error);
    }
  }

  const systemPrompt = `You are a LinkedIn carousel strategy expert for ${brand.companyName}.
${similarCarouselsContext}${researchContext}

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
- Output ONLY valid JSON.`;

  try {
    const response = await callOpenRouter([
      { role: "system", content: systemPrompt },
      { role: "user", content: `Create strategy for topic: ${params.topic}` }
    ]);

    // Sometimes models wrap JSON in markdown blocks
    const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '');
    const strategy = extractJSON(cleanResponse);

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
 */
export async function copywriterAgent(
  params: CarouselParams,
  strategy: CarouselStrategy
): Promise<CarouselCopy> {
  const startTime = Date.now();
  console.log("✍️ Copywriter Agent: Writing carousel copy...");

  const brand = getBrandGuidelines(params.profileType);

  const prompt = `You are an expert LinkedIn copywriter for ${brand.companyName}.

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

**Output Format** (JSON only):
{
  "topic": "${params.topic}",
  "caption": "LinkedIn post caption (2-3 sentences, engaging, with 3-5 relevant hashtags)",
  "slides": [
    { "type": "hook", "headline": "...", "body": "..." },
    { "type": "content", "headline": "...", "body": "..." },
    { "type": "cta", "headline": "...", "body": "..." }
  ]
}`;

  try {
    const response = await callOpenRouter([
      { role: "user", content: prompt }
    ]);

    const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '');
    const copy: CarouselCopy = extractJSON(cleanResponse);

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
 * MODIFIED: Uses OpenRouter (Stable Diffusion) for image generation.
 */
export async function designerAgent(
  supabase: SupabaseClient,
  params: CarouselParams,
  copy: CarouselCopy
): Promise<GeneratedImage[]> {
  const startTime = Date.now();
  console.log("🎨 Designer Agent: Creating visual assets via OpenRouter...");

  const images: GeneratedImage[] = [];

  for (let i = 0; i < copy.slides.length; i++) {
    const slide = copy.slides[i];

    // 1. Search for real assets
    try {
      const assetQuery = slide.headline.split(' ').slice(0, 3).join(' ');
      const realAsset = await searchCompanyAssets(supabase, assetQuery);

      if (realAsset) {
        images.push({
          slide_index: i,
          image_url: realAsset.url,
          asset_source: 'real',
          asset_url: realAsset.url
        });
        console.log(`✅ Designer: Using real asset for slide ${i + 1}`);
        continue;
      }
    } catch (e) {
      console.warn("Asset search failed", e);
    }

    // 2. Generate AI Image via OpenRouter
    const imagePrompt = `Professional corporate illustration, medical device manufacturing context. ${slide.headline} - ${slide.body}. High quality, photorealistic, 4k.`;

    console.log(`🎨 Designer: Generating image for slide ${i + 1} with OpenRouter...`);
    const imageUrl = await callOpenRouterImage(imagePrompt);

    if (imageUrl) {
      images.push({
        slide_index: i,
        image_url: imageUrl,
        asset_source: 'ai-generated'
      });
      console.log(`✅ Designer: Generated AI image for slide ${i + 1}`);
    } else {
      console.warn(`⚠️ Designer: Failed to generate image for slide ${i + 1}, using placeholder.`);
      images.push({
        slide_index: i,
        image_url: "https://placehold.co/1080x1080/004F8F/FFFFFF?text=Image+Generation+Failed",
        asset_source: 'ai-generated'
      });
    }
  }

  return images;
}

/**
 * Agent 4: Brand Analyst
 * Reviews output quality and decides if regeneration is needed
 */
export async function brandAnalystAgent(
  copy: CarouselCopy,
  images: GeneratedImage[]
): Promise<QualityReview> {
  const startTime = Date.now();
  console.log("🔍 Brand Analyst: Reviewing carousel quality...");

  const brand = getBrandGuidelines();

  const prompt = `You are a strict brand quality analyst for ${brand.companyName}.

**Task**: Review this LinkedIn carousel.
**Content**: ${copy.topic} / ${copy.caption}
**Slides**: ${copy.slides.map(s => `[${s.type}] ${s.headline}`).join(', ')}

**Criteria**:
- Clarity & Value
- Engagement Potential
- Brand Alignment

**Output JSON**:
{
  "overall_score": 85,
  "feedback": "Assessment...",
  "needs_regeneration": false,
  "issues": [],
  "strengths": []
}`;

  try {
    const response = await callOpenRouter([
      { role: "user", content: prompt }
    ]);

    const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '');
    const review: QualityReview = extractJSON(cleanResponse);

    if (typeof review.overall_score !== 'number') review.overall_score = 75;
    review.needs_regeneration = review.overall_score < 70;

    console.log(`✅ Brand Analyst: Score ${review.overall_score}/100 in ${Date.now() - startTime}ms`);
    return review;

  } catch (error: unknown) {
    console.error("❌ Brand Analyst Error:", error);
    return {
      overall_score: 75,
      feedback: "Review failed, defaulting to passing score.",
      needs_regeneration: false,
      issues: ["Reviewer error"],
      strengths: ["Content generated"]
    };
  }
}
