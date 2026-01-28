# Story 7.1: Remove Broken Satori Pipeline

**Epic**: Epic-7: Carousel Refactor - Mirror Approach on Edge Functions
**Status**: In Progress
**Priority**: Critical
**Estimated Effort**: 1 day
**Dependencies**: None (prerequisite for other stories)

---

## Description

Clean up the disabled Satori code, remove broken text overlay logic, and simplify the image generation flow. This is a prerequisite for implementing the multi-agent pipeline with AI-native text rendering.

---

## Context

**Current Problem**:
- Satori text rendering is disabled (line 441: "Satori disabled. Returning raw background.")
- ~200+ lines of unused/broken code
- Imports for Satori and Resvg that aren't used properly
- Branding overlay loop that doesn't work
- Increased cold start time due to unnecessary dependencies

**From Code Review** (Issue #1):
> "The text overlay system using Satori was implemented but is effectively disabled. The function still imports and attempts to use Satori (lines 202-219) but immediately returns the raw background without applying it properly."

---

## Acceptance Criteria

### Must Have
- [ ] Delete `generateTextSlideWithSatori()` function (lines 12-225)
- [ ] Remove all Satori imports (`import satori from "satori"`)
- [ ] Remove all Resvg imports (`import { Resvg } from "@resvg/resvg-js"`)
- [ ] Remove branding overlay loop (lines 459-470)
- [ ] Clean up `deno.json` or `import_map.json` dependencies
- [ ] No "Satori disabled" console logs in output
- [ ] Function cold start time reduced (baseline measurement)
- [ ] All existing tests still pass (if any)

### Should Have
- [ ] Document removed functionality in commit message
- [ ] Verify no other Edge Functions depend on removed code
- [ ] Confirm reduced function size (measure before/after)

### Nice to Have
- [ ] Add TODO comments for future AI-native text rendering implementation
- [ ] Create backup branch before deletion

---

## Technical Details

### Files to Modify

**Primary File**: [`supabase/functions/generate-linkedin-carousel/index.ts`](supabase/functions/generate-linkedin-carousel/index.ts)

**Lines to Remove**:
- Lines 12-225: Entire `generateTextSlideWithSatori()` function
- Lines 202-219: Satori imports and setup
- Lines 459-470: Branding overlay loop
- Line 441: "Satori disabled" log

**Dependencies to Remove** (from `deno.json` or `import_map.json`):
```json
{
  "satori": "https://esm.sh/satori@0.10.9",
  "@resvg/resvg-js": "https://esm.sh/@resvg/resvg-js@2.4.1"
}
```

### Code References

**Before** (lines 12-30, excerpt):
```typescript
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

async function generateTextSlideWithSatori(
  headline: string,
  body: string,
  bgImageDataUrl: string
): Promise<string> {
  // ~200 lines of broken text rendering...
}
```

**After**:
```typescript
// Function removed - will be replaced with AI-native text rendering
// in Story 7.3 (Gemini 3 Pro Image)
```

---

## Implementation Plan

### Step 1: Backup Current State
```bash
git checkout -b feature/story-7.1-remove-satori
git add .
git commit -m "Backup before removing Satori pipeline"
```

### Step 2: Remove Satori Function
1. Open [`supabase/functions/generate-linkedin-carousel/index.ts`](supabase/functions/generate-linkedin-carousel/index.ts)
2. Delete lines 12-225 (entire `generateTextSlideWithSatori` function)
3. Remove all references to this function
4. Remove Satori/Resvg imports

### Step 3: Remove Branding Overlay Loop
1. Find the branding overlay loop (lines 459-470)
2. Remove or comment out with TODO for future implementation
3. Simplify image URL handling

### Step 4: Clean Dependencies
1. Check `deno.json` or `import_map.json`
2. Remove Satori and Resvg dependencies
3. Verify no other functions import these

### Step 5: Test
```bash
# Test the Edge Function locally
supabase functions serve generate-linkedin-carousel

# Send test request
curl -X POST http://localhost:54321/functions/v1/generate-linkedin-carousel \
  -H "Content-Type: application/json" \
  -d '{"topic": "Test", "targetAudience": "Engineers", "format": "carousel"}'
```

### Step 6: Commit
```bash
git add .
git commit -m "Story 7.1: Remove broken Satori pipeline

- Deleted generateTextSlideWithSatori() function (~200 lines)
- Removed Satori and Resvg imports
- Removed branding overlay loop
- Cleaned up dependencies
- Reduced function cold start time
- Preparation for AI-native text rendering (Story 7.3)

Refs: Epic-7, Issue #1 from code review"
```

---

## Testing Strategy

### Manual Testing
1. **Test carousel generation** with existing functionality
2. **Verify error handling** - should fail gracefully if text rendering attempted
3. **Check logs** - no "Satori disabled" messages
4. **Measure cold start** - compare before/after times

### Expected Behavior
- Function should still accept requests
- Image generation should still work (background images)
- Text overlay functionality will be broken (expected - will be fixed in Story 7.3)
- No crashes or exceptions from removed code

---

## Success Metrics

- **Lines of Code Removed**: ~200+ lines
- **Cold Start Improvement**: Target 10-20% faster
- **Dependencies Removed**: 2 (Satori, Resvg)
- **Function Size**: Reduced from 553 lines to ~350 lines
- **Build Time**: Faster deployment

---

## Risks and Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Breaking existing functionality | Low | High | Test thoroughly before committing |
| Other functions depend on Satori | Low | Medium | Search codebase for Satori imports |
| Lost functionality hard to restore | Low | Low | Keep backup branch, git history |

---

## Follow-up Stories

After completing this story:
- **Story 7.2**: Implement Multi-Agent Pipeline (depends on clean slate)
- **Story 7.3**: AI-Native Text Rendering (replaces removed Satori)
- **Story 7.9**: Database Schema Updates (can be done in parallel)

---

## Notes

- This is a **destructive change** but necessary to clean up technical debt
- The removed Satori code was never fully functional (disabled at line 441)
- AI-native text rendering (Story 7.3) will provide superior results
- LifetrekMirror proves AI-native approach works better than programmatic compositing

---

## Definition of Done

- [ ] All acceptance criteria met
- [ ] Code committed to feature branch
- [ ] Manual testing completed successfully
- [ ] No "Satori disabled" logs in output
- [ ] Function cold start time measured and improved
- [ ] Ready for Story 7.2 (Multi-Agent Pipeline)
