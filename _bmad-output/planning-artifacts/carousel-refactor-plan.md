# Carousel Generation Refactor - Implementation Plan

**Date**: January 14, 2026
**Status**: Ready for Review
**Based On**: Comparative Analysis + Code Review
**Goal**: Port LifetrekMirror's proven approach to Lifetrek-App

---

## Executive Summary

This plan refactors the Lifetrek-App carousel generation system by adopting the **proven multi-agent architecture** from LifetrekMirror while preserving the valuable BMAD infrastructure for future use cases.

**Key Changes**:
1. Replace broken Satori pipeline with AI-native text rendering
2. Implement Strategist → Copywriter → Designer → Brand Analyst agent flow
3. Add RAG asset retrieval (search before generate)
4. Remove unnecessary async complexity for carousel generation
5. Fix critical issues (mock data, disabled features)

**Success Criteria**:
- ✅ 99%+ generation success rate (like Mirror)
- ✅ All text rendered properly in images
- ✅ Real asset usage before AI fallback
- ✅ No mock data in production
- ✅ Clean, maintainable codebase

---

## Phase 1: Critical Fixes (Week 1)

### 1.1 Remove Mock Data & Restore Real LLM

**Current State**: Function returns hardcoded slides (line 352-364)

**Actions**:
```typescript
// BEFORE (BROKEN):
console.log("⚠️ Using MOCK Text Generation");
carousel = {
  topic,
  caption: "Generated Caption...",
  slides: [/* hardcoded */]
};

// AFTER (FIXED):
const textResponse = await generateCarouselText({
  topic,
  targetAudience,
  painPoint,
  desiredOutcome,
  profileType
});
carousel = textResponse.carousel;
```

**Implementation**:
- Create `generateCarouselText()` function
- Use Gemini 2.5 Flash (fast, cheap) for text generation
- Implement proper error handling
- Add response validation

**Files Changed**:
- [supabase/functions/generate-linkedin-carousel/index.ts](supabase/functions/generate-linkedin-carousel/index.ts)

**Acceptance Criteria**:
- [ ] No mock data returned
- [ ] Real LLM responses
- [ ] Proper error messages if LLM fails
- [ ] Test with multiple topics

---

### 1.2 Fix Image Generation: Remove "No Text" Restriction

**Current State**: AI forbidden from rendering text (line 372)

**Actions**:
```typescript
// BEFORE (WRONG ASSUMPTION):
const imageSystemPrompt = `CRITICAL RULE: DO NOT GENERATE ANY TEXT...`;

// AFTER (AI-NATIVE):
const imageSystemPrompt = `You are an expert visual designer for Lifetrek Medical.
Generate professional carousel slides with text burned directly into the image.

BRAND GUIDELINES:
- Primary Color: #004F8F (Corporate Blue)
- Accent Color: #1A7A3E (Innovation Green) - use sparingly
- Typography: Bold, high-contrast text
- Style: Premium medical device aesthetic

CRITICAL: Render the following text CLEARLY and LEGIBLY:
Headline: "${slide.headline}"
Body: "${slide.body}"

TEXT RENDERING RULES:
1. White text on dark background for maximum contrast
2. Large, bold headline (top 25% of image)
3. Body text below, readable at small sizes
4. Logo "LM" in bottom right corner
5. Clean, professional layout`;
```

**Implementation**:
- Switch from Vertex AI Imagen to Gemini 3 Pro Image (supports text better)
- Use detailed prompts with exact text to render
- Remove Satori dependency completely
- Test text rendering quality

**Files Changed**:
- [supabase/functions/generate-linkedin-carousel/index.ts](supabase/functions/generate-linkedin-carousel/index.ts)

**Acceptance Criteria**:
- [ ] Text visible and legible in all generated images
- [ ] No Satori calls
- [ ] Brand colors applied correctly
- [ ] Professional appearance

---

### 1.3 Remove Broken Satori Code

**Current State**: Satori imported but disabled (line 441)

**Actions**:
- Delete `generateTextSlideWithSatori()` function (lines 12-225)
- Remove Satori/Resvg imports
- Remove branding overlay loop (lines 459-470)
- Clean up package.json dependencies

**Files Changed**:
- [supabase/functions/generate-linkedin-carousel/index.ts](supabase/functions/generate-linkedin-carousel/index.ts)
- `package.json` or `import_map.json`

**Acceptance Criteria**:
- [ ] No Satori references
- [ ] No "Satori disabled" logs
- [ ] Cleaner, simpler codebase
- [ ] Reduced function cold start time

---

## Phase 2: Multi-Agent Architecture (Week 2)

### 2.1 Create Agent Orchestrator

**New File**: `supabase/functions/generate-linkedin-carousel/agents.ts`

**Implementation**:
```typescript
// Agent Orchestrator
export async function generateCarouselWithAgents(params: CarouselParams) {
  const context = await gatherContext(params);

  // Agent 1: Strategist
  const strategy = await strategistAgent(context);

  // Agent 2: Copywriter
  const copy = await copywriterAgent(strategy, context);

  // Agent 3: Designer
  const images = await designerAgent(copy.slides, context);

  // Agent 4: Brand Analyst (Quality Control)
  const review = await brandAnalystAgent(copy, images, context);

  if (review.needsRegeneration) {
    // Regenerate specific slides based on feedback
    return regenerateFailedSlides(review.feedback);
  }

  return {
    slides: copy.slides,
    images: images,
    caption: copy.caption,
    quality_score: review.score
  };
}
```

**Agents**:

#### Strategist Agent
**Role**: Content planning and structure
```typescript
async function strategistAgent(context: Context) {
  const prompt = `You are a LinkedIn content strategist for ${context.company}.

Given:
- Topic: ${context.topic}
- Audience: ${context.targetAudience}
- Pain Point: ${context.painPoint}

Create a carousel STRATEGY:
1. Hook approach (what grabs attention?)
2. Content flow (what order tells the story?)
3. Proof placement (where to show credibility?)
4. CTA design (what action to drive?)

Return: JSON strategy object`;

  return await callLLM('gemini-2.5-flash', prompt);
}
```

#### Copywriter Agent
**Role**: Write compelling text based on strategy
```typescript
async function copywriterAgent(strategy: Strategy, context: Context) {
  const prompt = `You are an expert B2B copywriter following Alex Hormozi's framework.

Strategy: ${JSON.stringify(strategy)}
Voice: ${context.profileType === 'company' ? 'We' : 'I'}
Tone: ${context.profileType === 'company' ? 'Authoritative' : 'Persuasive'}

Write 5-7 carousel slides:
- Hook: Callout + Implied Value (5-8 words headline)
- Content: Proof-heavy, specific (20-30 words body)
- CTA: Low-friction action

Return: Array of {type, headline, body}`;

  return await callLLM('gemini-2.5-flash', prompt);
}
```

#### Designer Agent
**Role**: Create visuals (search assets first, generate if needed)
```typescript
async function designerAgent(slides: Slide[], context: Context) {
  const images = [];

  for (const slide of slides) {
    // 1. Try to find real company asset
    const asset = await searchCompanyAssets(slide.headline, context);

    if (asset) {
      console.log(`✅ Using real asset: ${asset.path}`);
      images.push(asset.url);
    } else {
      // 2. Fallback to AI generation
      console.log(`🎨 Generating AI image for: ${slide.headline}`);
      const image = await generateImage(slide, context);
      images.push(image);
    }
  }

  return images;
}

async function searchCompanyAssets(query: string, context: Context) {
  // Search products table
  const products = await supabase
    .from('products')
    .select('images')
    .textSearch('name', query)
    .limit(3);

  // Search storage buckets
  const { data: files } = await supabase.storage
    .from('assets')
    .list('facility', { search: query });

  return products[0]?.images[0] || files[0];
}
```

#### Brand Analyst Agent
**Role**: Quality control and critique
```typescript
async function brandAnalystAgent(copy: Copy, images: string[], context: Context) {
  const prompt = `You are a senior brand analyst for ${context.company}.

Review this carousel:
Slides: ${JSON.stringify(copy.slides)}
Images: ${images.length} generated

CHECK:
1. Brand voice consistency (${context.profileType})
2. Message clarity (Can target audience understand?)
3. Visual quality (Professional appearance?)
4. Call-to-action strength (Will they act?)

Return: {
  approved: boolean,
  score: number (0-100),
  feedback: string[],
  slides_to_regenerate: number[]
}`;

  return await callLLM('gemini-2.5-flash', prompt);
}
```

**Files Created**:
- `supabase/functions/generate-linkedin-carousel/agents.ts`
- `supabase/functions/generate-linkedin-carousel/agent_tools.ts` (search, LLM calls)

**Acceptance Criteria**:
- [ ] All 4 agents implemented
- [ ] Agents coordinate properly
- [ ] Quality critique loop works
- [ ] Failed slides regenerated automatically

---

### 2.2 Implement RAG Asset Retrieval

**Goal**: Search real photos before generating AI images

**Implementation**:
```typescript
// In agent_tools.ts
export async function searchCompanyAssets(
  query: string,
  category?: 'products' | 'facility' | 'team'
): Promise<Asset | null> {

  // 1. Vector search in products table (if pgvector enabled)
  const products = await supabase.rpc('match_products', {
    query_text: query,
    match_threshold: 0.7,
    match_count: 3
  });

  // 2. Search storage buckets by metadata
  const { data: facilityImages } = await supabase.storage
    .from('assets')
    .list('facility', {
      search: query,
      sortBy: { column: 'name', order: 'asc' }
    });

  // 3. Rank results by relevance
  const candidates = [
    ...products.map(p => ({ url: p.image_url, score: p.similarity, type: 'product' })),
    ...facilityImages.map(f => ({ url: getPublicUrl(f.name), score: 0.5, type: 'facility' }))
  ].sort((a, b) => b.score - a.score);

  return candidates[0] || null;
}
```

**Database Changes** (if needed):
```sql
-- Enable pgvector for semantic search
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS name_embedding vector(1536);

-- Create index for fast similarity search
CREATE INDEX IF NOT EXISTS products_name_embedding_idx
  ON products USING ivfflat (name_embedding vector_cosine_ops);
```

**Files Changed**:
- `supabase/functions/generate-linkedin-carousel/agent_tools.ts`
- `supabase/migrations/` (new migration for pgvector)

**Acceptance Criteria**:
- [ ] Asset search works for products
- [ ] Facility images discoverable
- [ ] Fallback to AI when no asset found
- [ ] Logs show search → generate decisions

---

## Phase 3: Simplify & Clean (Week 2)

### 3.1 Remove Async Job Mode for Carousels

**Rationale**: Carousel generation is fast (< 10s), doesn't need job queue

**Actions**:
- Remove job_id handling (lines 244-276)
- Remove job status updates
- Keep sync execution only
- Preserve async infrastructure for LinkedIn automation (Phase 2)

**Files Changed**:
- [supabase/functions/generate-linkedin-carousel/index.ts](supabase/functions/generate-linkedin-carousel/index.ts)

**Acceptance Criteria**:
- [ ] Function runs synchronously
- [ ] Response returns immediately
- [ ] Simpler error handling
- [ ] ~50 lines of code removed

---

### 3.2 Consolidate Error Handling

**Current State**: Errors returned as strings, inconsistent types

**After**:
```typescript
// Standardized error type
type GenerationError = {
  stage: 'text' | 'image' | 'review' | 'upload';
  slide_index?: number;
  message: string;
  retryable: boolean;
};

// Centralized error handler
function handleGenerationError(error: unknown, stage: string): GenerationError {
  if (error instanceof VertexAIError) {
    return {
      stage,
      message: error.message,
      retryable: error.code === 429 || error.code === 503
    };
  }
  // ... other error types
}
```

**Files Changed**:
- [supabase/functions/generate-linkedin-carousel/index.ts](supabase/functions/generate-linkedin-carousel/index.ts)

**Acceptance Criteria**:
- [ ] All errors properly typed
- [ ] Consistent error format
- [ ] No error strings in image arrays
- [ ] Clear retry guidance

---

### 3.3 Extract Google Drive Upload to Separate Function

**Current State**: Hidden side effect in main flow

**After**:
```typescript
// New file: supabase/functions/_shared/drive-uploader.ts
export async function uploadCarouselToDrive(
  carousel: Carousel,
  imageUrls: string[]
): Promise<{ folder_id: string; file_urls: string[] }> {
  const folderId = await createCarouselFolder(carousel.topic);

  const uploads = await Promise.all(
    imageUrls.map((url, i) => uploadImage(url, i, folderId))
  );

  return {
    folder_id: folderId,
    file_urls: uploads
  };
}
```

**Usage**:
```typescript
// In main function
const result = await generateCarouselWithAgents(params);

// Optional upload (based on config)
if (shouldUploadToDrive) {
  const driveLinks = await uploadCarouselToDrive(result.carousel, result.images);
  result.drive_folder = driveLinks.folder_id;
}
```

**Files Created**:
- `supabase/functions/_shared/drive-uploader.ts`

**Files Changed**:
- [supabase/functions/generate-linkedin-carousel/index.ts](supabase/functions/generate-linkedin-carousel/index.ts)

**Acceptance Criteria**:
- [ ] Upload is explicit, not hidden
- [ ] Can be disabled easily
- [ ] Proper error handling
- [ ] Documented in function interface

---

## Phase 4: Configuration & Observability (Week 3)

### 4.1 Extract Brand Guidelines to Config

**Create**: `supabase/functions/_shared/brand-config.ts`

```typescript
export const BRAND_GUIDELINES = {
  lifetrek: {
    name: "Lifetrek Medical",
    colors: {
      primary: "#004F8F",
      accent: "#1A7A3E",
      backgrounds: ["#FFFFFF", "#F5F5F5", "#003D75"]
    },
    typography: {
      headline: "Inter Bold",
      body: "Inter Regular"
    },
    logo_url: "https://[...]/logo.png",
    tone: {
      company: "Professional, innovative, and reliable",
      salesperson: "Persuasive, direct, high-energy"
    },
    visual_style: "Premium medical device aesthetic, clean and minimalist"
  }
};

export function getBrandPrompt(company: string, profileType: string) {
  const brand = BRAND_GUIDELINES[company];
  return `
BRAND GUIDELINES for ${brand.name}:
- Primary Color: ${brand.colors.primary}
- Accent Color: ${brand.colors.accent}
- Tone: ${brand.tone[profileType]}
- Visual Style: ${brand.visual_style}
  `.trim();
}
```

**Files Changed**:
- All agent prompts to use `getBrandPrompt()`

**Acceptance Criteria**:
- [ ] No hardcoded brand values in prompts
- [ ] Easy to add new clients
- [ ] Centralized brand source of truth

---

### 4.2 Add Proper Logging & Metrics

**Implementation**:
```typescript
// In agents.ts
export async function generateCarouselWithAgents(params: CarouselParams) {
  const startTime = Date.now();
  const metrics = {
    strategy_time: 0,
    copywriting_time: 0,
    design_time: 0,
    review_time: 0,
    assets_used: 0,
    assets_generated: 0,
    regenerations: 0
  };

  try {
    // Track each stage...
    const strategyStart = Date.now();
    const strategy = await strategistAgent(context);
    metrics.strategy_time = Date.now() - strategyStart;

    // ... similar for other stages

    console.log("📊 Generation Metrics:", {
      total_time: Date.now() - startTime,
      ...metrics,
      success_rate: ((metrics.assets_used + metrics.assets_generated) / slides.length) * 100
    });

    return result;
  } catch (error) {
    console.error("❌ Generation Failed:", {
      error: error.message,
      stage: currentStage,
      time_elapsed: Date.now() - startTime
    });
    throw error;
  }
}
```

**Acceptance Criteria**:
- [ ] Timing for each agent stage
- [ ] Success/failure rates logged
- [ ] Asset usage vs generation tracked
- [ ] Easy debugging from logs

---

## Phase 5: Testing & Validation (Week 3)

### 5.1 Integration Tests

**Create**: `supabase/functions/generate-linkedin-carousel/test.ts`

```typescript
Deno.test("Carousel Generation - Full Flow", async () => {
  const result = await generateCarouselWithAgents({
    topic: "CNC Precision Manufacturing",
    targetAudience: "Medical Device R&D Teams",
    painPoint: "Long lead times for prototype parts",
    profileType: "company"
  });

  assert(result.slides.length >= 5, "Should have at least 5 slides");
  assert(result.slides.length <= 7, "Should have at most 7 slides");
  assert(result.images.length === result.slides.length, "Image count matches slides");
  assert(result.quality_score >= 70, "Quality score should be 70+");
  assert(!result.images.some(img => img.startsWith("ERROR")), "No error images");
});

Deno.test("Designer Agent - Asset Search First", async () => {
  const slide = { headline: "CNC Machine", body: "Precision manufacturing" };
  const image = await designerAgent([slide], mockContext);

  // Should find real facility photo of CNC machine
  assert(image[0].includes("storage"), "Should use real asset from storage");
});

Deno.test("Brand Analyst - Quality Control", async () => {
  const badCopy = {
    slides: [
      { headline: "Buy Now!!!", body: "Click here for deals!" } // Spammy
    ]
  };

  const review = await brandAnalystAgent(badCopy, ["image.png"], mockContext);
  assert(review.approved === false, "Should reject spammy copy");
  assert(review.feedback.length > 0, "Should provide feedback");
});
```

**Run**:
```bash
deno test supabase/functions/generate-linkedin-carousel/
```

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Real API integration tested
- [ ] Edge cases covered
- [ ] No mock data in tests

---

### 5.2 Manual Testing Checklist

**Test Cases**:

1. **Company Profile - Visual Style**
   - Topic: "ISO 13485 Certified Manufacturing"
   - Expected: Professional, branded images, "we" voice

2. **Salesperson Profile - Text-Heavy**
   - Topic: "Cut Your Prototype Costs by 40%"
   - Expected: Persuasive, "I" voice, results-focused

3. **Asset Reuse**
   - Topic: "Our Clean Room Facility"
   - Expected: Real facility photos used, minimal AI generation

4. **Error Recovery**
   - Simulate API failures
   - Expected: Graceful degradation, clear error messages

5. **Quality Control**
   - Intentionally bad input
   - Expected: Brand Analyst catches and triggers regeneration

**Acceptance Criteria**:
- [ ] All test cases documented
- [ ] Results logged with screenshots
- [ ] Success rate >= 99%
- [ ] No production bugs found

---

## Migration Strategy

### Cutover Plan

**Option A: Hard Cutover** (Recommended)
1. Deploy new agent-based function to staging
2. Run parallel testing for 1 week
3. Compare output quality with old function
4. Switch production traffic to new function
5. Keep old function as backup for 1 month

**Option B: Gradual Rollout**
1. Feature flag: `use_agent_based_generation`
2. Enable for 10% of users
3. Monitor metrics (success rate, quality scores)
4. Increase to 50%, then 100%
5. Remove old function after 2 months

**Recommended**: Option A (quality improvement justifies clean break)

---

### Rollback Plan

If new implementation fails:
1. Revert Edge Function deployment
2. Old function still exists (no deletion)
3. Expected downtime: < 5 minutes
4. Communication: "Temporary issue, investigating"

---

## Success Metrics

### KPIs to Track

| Metric | Current (Broken) | Target (After Refactor) |
|:-------|:----------------|:------------------------|
| **Success Rate** | Unknown (~60%?) | >= 99% |
| **Text Rendering** | ❌ Broken | ✅ 100% legible |
| **Asset Reuse** | 0% | >= 30% |
| **Generation Time** | Unknown | < 15 seconds |
| **Quality Score** | N/A | >= 75/100 |
| **Error Rate** | High | < 1% |
| **Code Maintainability** | Low (disabled code) | High (clean agents) |

### How to Measure

```typescript
// Add to function response
return {
  carousel: result,
  metrics: {
    total_time_ms: elapsed,
    success_rate: (successful_slides / total_slides) * 100,
    assets_used: assets_count,
    assets_generated: ai_count,
    quality_score: brand_analyst_score,
    errors: error_list
  }
};
```

**Dashboard**: Create Grafana dashboard tracking these metrics over time

---

## Estimated Effort

| Phase | Tasks | Effort | Dependencies |
|:------|:------|:-------|:-------------|
| **Phase 1** | Critical Fixes | 3 days | None |
| **Phase 2** | Multi-Agent | 5 days | Phase 1 |
| **Phase 3** | Simplify | 2 days | Phase 2 |
| **Phase 4** | Config & Observability | 2 days | Phase 3 |
| **Phase 5** | Testing & Validation | 3 days | Phase 4 |
| **Total** | | **15 days** (3 weeks) | |

**Team**: 1 developer full-time

---

## Risks & Mitigations

### Risk 1: Gemini API Quota/Cost
**Mitigation**:
- Use Gemini 2.5 Flash (cheap) for text
- Cache brand guidelines
- Monitor spend daily

### Risk 2: Asset Search Quality
**Mitigation**:
- Start with simple keyword search
- Add pgvector semantic search in Phase 2
- Manual asset tagging if needed

### Risk 3: Quality Regression
**Mitigation**:
- Parallel testing with old function
- A/B test with users
- Keep rollback plan ready

### Risk 4: Integration with Existing Features
**Mitigation**:
- Maintain same API interface
- Test with frontend early
- Staged rollout

---

## Post-Implementation

### Documentation Updates Needed

1. **Technical Docs**:
   - Update architecture document with new agent flow
   - Document decision to use AI-native text rendering
   - Add lessons learned section

2. **Developer Guides**:
   - How to add new agents
   - How to modify brand guidelines
   - How to debug generation failures

3. **User Guides**:
   - Updated carousel generation workflow
   - New quality control features
   - Asset reuse capabilities

### Knowledge Transfer

1. Create video walkthrough of new architecture
2. Document all agent prompts and reasoning
3. Write case study comparing old vs new approach
4. Present findings to team

---

## Conclusion

This refactor transforms the carousel generation system from a **broken, over-engineered pipeline** to a **simple, effective multi-agent system** based on proven architecture from LifetrekMirror.

**Key Improvements**:
- ✅ Working text rendering (AI-native)
- ✅ Real asset usage (RAG search)
- ✅ Quality control (Brand Analyst)
- ✅ Maintainable codebase (clean agents)
- ✅ No mock data (real production system)

**Preserved for Future**:
- BMAD architecture for LinkedIn automation (Phase 2)
- Async job infrastructure for long-running tasks
- Governance and safety frameworks

**Next Step**: Review this plan, approve, and begin Phase 1 implementation.

---

**Approval Sign-off**:
- [ ] Technical Review (Architecture)
- [ ] Product Review (Features)
- [ ] Security Review (Data handling)
- [ ] Ready to Implement
