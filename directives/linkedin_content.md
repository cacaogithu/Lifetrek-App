# LinkedIn Content Generation

## Goal

Generate high-quality, on-brand LinkedIn carousel posts using AI to create engaging B2B content for Lifetrek Medical's social media strategy.

## Inputs

**Required:**
- `topic` - Content topic or theme (e.g., "Spinal Screw Machining")
- `targetAudience` - Target audience (e.g., "Manufacturing Engineers")

**Optional:**
- `painPoint` - Customer pain point to address
- `desiredOutcome` - Desired customer outcome
- `proofPoints` - Proof points (e.g., "ISO 13485 Certified")
- `ctaAction` - Call to action (e.g., "Book Demo")
- `mode` - "plan" or "generate" (default: "generate")
- `numberOfCarousels` - Number of variants to generate (1-3)

## Tools/Edge Functions

### Supabase Edge Function

**Location:** `supabase/functions/generate-linkedin-carousel/`

**Files:**
- `index.ts` - Main function entry point
- `functions_logic.ts` - Business logic (prompts, LLM invocation)

**Endpoint:**
```
POST https://[PROJECT_REF].supabase.co/functions/v1/generate-linkedin-carousel
```

### Frontend Component

**Location:** `src/pages/LinkedInCarousel.tsx`

Features:
- Input form for carousel parameters
- Mode selection (Plan vs Generate)
- Preview carousel slides
- Download as PDF
- Asset library integration

## Outputs

### JSON Response

```json
{
  "carousels": [
    {
      "topic": "string",
      "targetAudience": "string",
      "slides": [
        {
          "slideNumber": 1,
          "headline": "Hook/Attention Grabber",
          "body": "< 15 words",
          "designNotes": "Visual suggestions",
          "imagePrompt": "Image generation prompt"
        }
      ],
      "caption": "Long-form LinkedIn post text"
    }
  ]
}
```

### Deliverables

- **PDF Export** - Carousel slides as downloadable PDF
- **Slide Previews** - Visual preview in browser
- **Post Caption** - Copy-paste ready LinkedIn caption

## Brand Guidelines Integration

### Knowledge Base

**Brand Documents** (injected into system prompt):
- `docs/brand/BRAND_BOOK.md` - Complete brand guidelines
- `docs/brand/COMPANY_CONTEXT.md` - Company capabilities
- `docs/guides/LINKEDIN_BEST_PRACTICES.md` - LinkedIn best practices
- `docs/brand/BRAND_QUICK_REFERENCE.md` - Quick brand reference

### Design Specifications

**Typography:**
- Font: Inter (Bold)
- Title Size: 48px
- Body Size: 24px

**Colors:**
- Primary: High-Contrast Black/White
- Accent: #00A4BD (Teal)
- Background: White with subtle texture

**Layout:**
- First slide: Hook + visual
- Middle slides: Body content (< 15 words per slide)
- Last slide: CTA + logo

## Process Flow

### 1. Plan Mode (Strategy Selection)

User provides **generic theme** (e.g., "Spinal Screws"):

1. AI analyzes company capabilities from brand docs
2. Generates **3 distinct strategic angles:**
   - Angle 1: Myth-Busting approach
   - Angle 2: Deep Dive (machine/standard focus)
   - Angle 3: Social Proof/Case Study

3. User selects preferred angle
4. Proceeds to Generate mode with chosen angle

### 2. Generate Mode (Content Creation)

User provides **specific brief** or selected angle:

1. AI constructs prompts using:
   - System prompt (brand + knowledge base)
   - User prompt (topic + parameters)

2. Calls Perplexity API (`sonar-pro` model)

3. Receives JSON with carousel data

4. Frontend renders preview

5. User downloads PDF or copies caption

### 3. Asset Integration workflow (Optional)

1. User uploads product images to Asset Library
2. Images stored in Supabase Storage
3. AI receives image context in system prompt
4. Generates content that references available assets

## Edge Cases & Learnings

### API Limits

**Perplexity API:**
- Rate limit: ~50 requests/minute
- Response time: 5-15 seconds
- Max tokens: 4096

**Solution:**
- Show loading state in UI
- Implement retry logic with exponential backoff
- Cache generated carousels

### Content Quality

**Too Generic:**
- Problem: AI generates bland, corporate content
- Solution: Include specific proof points and pain points in prompt
- Use Plan mode to explore angles first

**Off-Brand:**
- Problem: Content doesn't match brand voice
- Solution: Ensure brand docs are current in system prompt
- Review and iterate on prompts in `functions_logic.ts`

**Formatting Issues:**
- Problem: Body text exceeds 15-word limit
- Solution: Explicitly enforce word limit in system prompt
- Post-process to truncate if needed

### Image Generation

**Image Prompts:**
- AI generates `imagePrompt` for each slide
- Can be used with DALL-E, Midjourney, or other tools
- Include brand colors and style in prompts

**Current Limitation:**
- No automatic image generation (manual for now)
- Asset library provides pre-approved images

## Environment Variables

Required in `supabase/functions/.env`:
```bash
PERPLEXITY_API_KEY=your_key_here
```

## Common Errors

**401 Unauthorized:**
- Check Supabase anon key in frontend
- Verify function JWT verification settings

**500 Internal Server Error:**
- Check function logs: `supabase functions logs generate-linkedin-carousel`
- Verify Perplexity API key is valid
- Check JSON parsing in response

**Timeout:**
- Perplexity API taking too long
- Increase function timeout in `supabase/functions/generate-linkedin-carousel/index.ts`

## Testing

**Local Development:**
```bash
# Serve function locally
supabase functions serve generate-linkedin-carousel

# Test with curl
curl -X POST http://localhost:54321/functions/v1/generate-linkedin-carousel \
  -H "Content-Type: application/json" \
  -d '{"topic": "Test", "targetAudience": "Engineers"}'
```

**Production Testing:**
- Use frontend UI at `/linkedin-carousel`
- Test Plan mode with generic topics
- Test Generate mode with specific briefs
- Validate PDF export and caption copy

## Maintenance Notes

**Weekly:**
- Review generated content quality
- Update brand docs if voice changes
- Monitor Perplexity API usage/costs

**Monthly:**
- Review and update LinkedIn best practices
- Add new proof points to brand context
- Update design specifications if needed

**When Brand Changes:**
- Update `docs/brand/BRAND_BOOK.md`
- Update system prompt in `functions_logic.ts`
- Test with sample carousels to verify
- Document changes in this directive
