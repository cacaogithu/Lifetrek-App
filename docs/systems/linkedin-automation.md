# LinkedIn Automation System Manual

## Goal

Generate high-quality, on-brand LinkedIn carousel posts using AI to create engaging B2B content for Lifetrek Medical's social media strategy.

## Inputs

**Required:**
- `topic`: Content topic or theme (e.g., "Spinal Screw Machining")
- `targetAudience`: Target audience (e.g., "Manufacturing Engineers")

**Optional:**
- `painPoint`: Customer pain point to address
- `desiredOutcome`: Desired customer outcome
- `mode`: "plan" or "generate" (default: "generate")

## Tools & Components

### Supabase Edge Function
- **Endpoint**: `generate-linkedin-carousel`
- **Location**: `supabase/functions/generate-linkedin-carousel/`

### Frontend Component
- **Location**: `src/pages/LinkedInCarousel.tsx`
- **Features**: Input form, Preview, PDF Download.

## Process Flow

### 1. Plan Mode (Strategy Selection)
1. User provides a **generic theme**.
2. AI analyzes company capabilities and generates **3 strategic angles**.
3. User selects the preferred angle.

### 2. Generate Mode (Content Creation)
1. User provides a **specific brief** or uses the selected angle from Plan Mode.
2. AI constructs prompts using brand guidelines.
3. Calls Perplexity API to generate content.
4. Returns JSON with carousel structure.
5. Frontend renders preview for user to download/copy.

## Brand Guidelines Integration

The system automatically injects context from:
- `docs/brand/BRAND_BOOK.md`
- `docs/brand/COMPANY_CONTEXT.md`
- `docs/guides/LINKEDIN_BEST_PRACTICES.md`

## Troubleshooting

### API Limits
- **Perplexity API**: Has rate limits. If it fails, wait and try again.
- **Timeouts**: Generation can take 5-15 seconds.

### Content Quality
- **Too Generic**: Try adding specific proof points or pain points in the input.
- **Off-Brand**: Ensure brand docs are up to date.

### Common Errors
- **401 Unauthorized**: Check if you are logged in or if API keys are valid.
- **500 Internal Server Error**: Check function logs on Supabase dashboard.

## Development & Testing

**Local Development:**
```bash
supabase functions serve generate-linkedin-carousel
```
