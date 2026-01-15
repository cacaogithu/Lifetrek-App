---
stepsCompleted: ['step-01-validate-prerequisites']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
---

# Lifetrek-App - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for Lifetrek-App, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: The system must provide an Async Job Engine with a centralized `jobs` table storing status, payload, result, and error logs.
FR2: The system must include a `worker-dispatcher` mechanism (Database Webhooks) to trigger Python Cloud Run services.
FR3: The system must handle multiple simultaneous jobs without race conditions (Job Concurrency).
FR4: The system must persist failed job payloads to allow for "Retry" action without data re-entry.
FR5: The system must support "Sequences" (multi-job batches like "First 3 Posts") and Persona-based tone injection for Content Generation.
FR6: Backend workers must be able to query `products` table and `storage` buckets for Asset Retrieval (RAG).
FR7: The system must integrate with Image Generation APIs (Vertex/Nano Banana) using *Reference Images* to support product fidelity.
FR8: The system must support multi-stage stateful jobs (Research -> Strategy -> Write -> Image) for the Blog Pipeline.
FR9: The system must support Hybrid Execution of Python-based scripts (`rank_leads.py`, `enrich_leads_unipile.py`) on Cloud Run alongside TypeScript Edge Functions.
FR10: The system must track lead engagement signals to update Lead Scores.
FR11: The system must implement a Lead Scoring algorithm to rank leads for the Sales Engineer dashboard.
FR12: The system must preserve existing "Ownership Rules" and "Heatmap Categories" logic.
FR13: The system must provide an Admin Dashboard with a "Job Monitor" audit log view.
FR14: The system must provide a "Retry" action in the Admin Dashboard for failed jobs.
FR15: The system must enforce Cost Guardrails (daily spend/job quota limits).
FR16: The system must send "Away" email/Slack notifications for completed long-running batch jobs.
FR17: The system must enforce "Draft-Only" status for all AI-generated content (no auto-publish).
FR18: The system must (in Phase 2) support Human Simulation (Jitter, Active Hours, Daily Limits, Weekly Cap) for LinkedIn Outreach.
FR19: The system must provide a Lead Dashboard to visualize high-score leads for Sales Engineers.
FR20: The system must provide a conversational interface for brainstorming content strategy (topics, angles, audience) for both Blog Posts and Social Media (LinkedIn/Instagram) before generation.

### NonFunctional Requirements

NFR1: Job Enqueue API latency must be < 500ms.
NFR2: Realtime UI feedback ("Job Started/Completed") must appear within 2 seconds of state change.
NFR3: The Async architecture must guarantee 0% timeout errors for the user.
NFR4: The system must support recovery of failed jobs via payload persistence.
NFR5: Access to the `jobs` table must be restricted via strict Row Level Security (RLS).
NFR6: Backend workers must execute with Service Role access but validate the effective `user_id`.
NFR7: New features must be implemented in strictly defined Feature Modules (Modular Monolith).
NFR8: The system must use a "cookie-cutter" pattern for adding new AI tools to ensure Scalable Architecture.
NFR9: The system must provide full observability (Audit Log) of all jobs.
NFR10: Carousel Generation Success Rate must be >= 99%.

### Additional Requirements

From Architecture:
- Technical Requirement: Implement Hybrid Microservices (Next.js + Python Cloud Run).
- Technical Requirement: Implement `jobs` table with `checkpoint_data` JSON structure for stateful/resumable jobs.
- Technical Requirement: Provision `jobs` table to support `type: 'incoming_webhook'` for future Phase 2 use.
- Technical Requirement: Separate Content Generation (System 1) from LinkedIn Automation (System 2, Future).

From UX Design:
- UX Requirement: "Zero Frozen Waits" - background all long-running tasks.
- UX Requirement: "Transparent Progress" via Realtime UI updates (Queued -> Processing -> Done) and Global Toast Notifications.
- UX Requirement: "Job History" sidebar/list for visualizing parallel tasks.

### FR Coverage Map

| Epic | Functional Requirements |
| :--- | :--- |
| **Epic-1: Hybrid Infrastructure** | FR1, FR2, FR3, NFR3, NFR5, NFR6 |
| **Epic-2: Deep Research & Blog Agent** | FR6, FR8, FR9, FR20, NFR8 |
| **Epic-3: Async Job Engine & UI** | FR4, FR13, FR14, FR16, NFR1, NFR2, NFR4, NFR9 |
| **Epic-4: Lead Scoring & Dashboard** | FR10, FR11, FR12, FR19 |
| **Epic-5: Orchestrator Chat Interface** | FR1, FR6, FR20, NFR8 |
| **Epic-6: Multi-Platform Content Generation** | FR5, FR6, FR7, FR17, FR20, NFR8, NFR10 |
| **Epic-7: Carousel Refactor (Mirror Approach)** | FR5, FR6, FR7, FR17, NFR10 |

## Epic List

### Epic-1: Core Hybrid Infrastructure
**Goal:** Establish the foundational Hybrid Microservices architecture connecting Next.js (Supabase) with the new Python Cloud Run service.
**Value:** Enables "Deep Research" and complex Python agents while keeping the UI fast and responsive.

**Stories:**
1.  **Story-1.1:** Setup Hybrid Monorepo & Python Service
2.  **Story-1.2:** Implement Async Job Queue (Webhooks)
3.  **Story-1.3:** Setup Cloud Run Deployment Pipeline
4.  **Story-1.4:** Configure Supabase <-> Google Auth (Secret Manager)

### Epic-2: Deep Research & Blog Agent
**Goal:** Migrate and enhance the Content Generation capabilities using the new Python backend.
**Value:** Provides high-quality, researched content that drives engagement (the core product value).

**Stories:**
1.  **Story-2.1:** Implement "Deep Research" Tool (LangChain/Python)
2.  **Story-2.2:** Build Blog Generation State Machine
3.  **Story-2.3:** Implement RAG Asset Retrieval (pgvector)
4.  **Story-2.4:** Build Agent Evaluation Pipeline
#### Story-2.5: Blog Brainstorming Interface Integration
**Acceptance Criteria:**
- [ ] Blog generation pipeline accepts "brainstorming_session_id" from Chat Orchestrator.
- [ ] Users can brainstorm "Blog Topics", "Content Angles", and "Target Audience" in chat before generating.
- [ ] Selected brainstorming output (e.g., "The Contrarian Angle") is passed to the Strategist Agent as context.
- [ ] "Generate Blog" action in Chat UI triggers the Epic-2 async job with this context.

**Technical Details:**
- Integration: Pass `chat_history` summary or structured `brainstorming_result` in Job Payload.
- Update `BlogState` in `blog_agent.py` to include `brainstorming_context`.

**Dependencies:** Epic-5 (Orchestrator)

**Estimated Effort:** 2 days

---

### Epic-3: Async Job Engine & Admin UI### Epic-3: Async Job Engine & Admin UI
**Goal:** Provide visibility and control over the background work.
**Value:** Trust. Users need to know their "magic button" click is actually doing something.

**Stories:**
1.  **Story-3.1:** Create `jobs` Schema & RLS Policies
2.  **Story-3.2:** Build "Job Monitor" Admin Dashboard
3.  **Story-3.3:** Implement "Retry" Logic for Failed Jobs
4.  **Story-3.4:** Add Realtime Toast Notifications

### Epic-4: Lead Scoring Ecosystem
**Goal:** Enhance the "Lead Gen" part of the flywheel.
**Value:** Helps sales engineers focus on the right people.

**Stories:**
1.  **Story-4.1:** Migrate Lead Scoring Scripts to Python Service
2.  **Story-4.2:** Build Sales Engineer Dashboard
3.  **Story-4.3:** Implement Engagement Signal Tracking

---

### Epic-5: Content Orchestrator Chat Interface
**Goal:** Enable users to brainstorm and refine content ideas through a conversational interface before generating final content, providing a creative collaboration layer.

**Value:** Marketing teams need an interactive way to explore content strategies and iterate on ideas before committing to production. This reduces wasted generation cycles and improves content quality through AI-assisted ideation.

**Functional Requirements:** FR1, FR6, NFR8

**Dependencies:** Epic-1 (Hybrid Infrastructure), Epic-2 (Deep Research for RAG)

**Stories:**
1.  **Story-5.1:** Conversational Orchestrator Agent (3 days)
2.  **Story-5.2:** Knowledge Base Integration for Orchestrator (4 days)
3.  **Story-5.3:** Handoff to Generation Agents (5 days)
4.  **Story-5.4:** Conversation Templates and Shortcuts (3 days)

**Success Metrics:**
- Adoption Rate: 60% of users try chat interface in first month
- Iteration Reduction: 30% fewer regeneration requests
- Time to First Draft: 40% faster from idea to generated content
- User Satisfaction: NPS > 8 for chat experience

---

### Epic-6: Multi-Platform Content Generation
**Goal:** Extend content generation beyond LinkedIn carousels to Instagram posts and future platforms, with reusable agent architecture and platform-specific formatters.

**Value:** Marketing teams need consistent brand messaging across multiple social platforms. A unified generation system with platform adapters ensures quality and efficiency without duplicating agent logic.

**Functional Requirements:** FR5, FR6, FR7, FR17, NFR8, NFR10

**Dependencies:** Epic-1 (Hybrid Infrastructure), Epic-2 (Deep Research), Epic-5 (Orchestrator - optional)

**Stories:**
1.  **Story-6.1:** Platform-Agnostic Agent Architecture (5 days)
2.  **Story-6.2:** LinkedIn Carousel Generator - Refactor with Mirror Pattern (8 days)
3.  **Story-6.3:** Instagram Post Generator (4 days)
4.  **Story-6.4:** Instagram Stories & Reels Generator - Phase 2 (10 days - deferred)
5.  **Story-6.5:** Platform Extension Framework "Cookie-Cutter" (3 days)

**Success Metrics:**
- Platform Coverage: LinkedIn + Instagram in Phase 1
- Reusability: 80% code shared across platforms
- Generation Success Rate: 99%+ across all platforms
- Time to Add Platform: < 2 days using framework

---

### Epic-7: Carousel Refactor - Mirror Approach on Edge Functions
**Goal:** Replace the broken carousel implementation with LifetrekMirror's proven multi-agent architecture while preserving BMAD infrastructure for future use cases.

**Value:** Current carousel generation is 70% disabled with Satori broken and mock data in production. Adopting the working Mirror approach restores functionality while maintaining architectural integrity for future LinkedIn automation.

**Functional Requirements:** FR5, FR6, FR7, FR17, NFR10

**Dependencies:** Epic-1 (Uses Edge Functions)

**Note:** This epic overlaps with Story 6.2 and can be implemented as part of Epic-6 or tracked separately for refactor focus.

**Stories:**
1.  **Story-7.1:** Remove Broken Satori Pipeline (1 day)
2.  **Story-7.2:** Implement Multi-Agent Pipeline (5 days)
3.  **Story-7.3:** AI-Native Text Rendering (3 days)
4.  **Story-7.4:** RAG Asset Retrieval Before Generation (3 days)
5.  **Story-7.5:** Remove Mock Data and Restore Real LLM (2 days)
6.  **Story-7.6:** Consolidate Error Handling (2 days)
7.  **Story-7.7:** Semantic Search with pgvector - Phase 2 (4 days - deferred)
8.  **Story-7.8:** Observability and Metrics (2 days)
9.  **Story-7.9:** Database Schema Updates (1 day)

**Success Metrics:**
- Success Rate: 99%+ generation success (from ~60% currently)
- Text Legibility: 100% of generated images have readable text
- Asset Reuse: 30%+ slides use real company assets
- Quality Score: Average 75+ from Brand Analyst
- No Mock Data: 0 instances of hardcoded content
- Code Simplicity: 40% reduction in lines of code

---

## Epic Dependencies

```
Epic-1 (Hybrid Infrastructure) - Foundation
  ↓
Epic-2 (Deep Research & Blog) - AI capabilities
  ↓
Epic-5 (Orchestrator Chat) - User experience layer
  ↓
Epic-6 (Multi-Platform) - Content generation
  ├─ Story 6.1 (Core Agents)
  ├─ Story 6.2 (LinkedIn Refactor) ←→ Epic-7 (Carousel Refactor)
  ├─ Story 6.3 (Instagram)
  └─ Story 6.5 (Framework)

Epic-7 (Carousel Refactor) - Can merge with Story 6.2
  All stories flow sequentially: 7.1 → 7.2 → 7.3 → 7.4 → 7.5
  Parallel: 7.6, 7.8 (alongside 7.2+)
  Early: 7.9 (schema updates)
  Phase 2: 7.7 (pgvector semantic search)

Epic-3 (Async Jobs) - Parallel development
Epic-4 (Lead Scoring) - Parallel development
```

---

## Implementation Timeline (Epics 5-7)

### Weeks 1-2: Carousel Foundation
- **Epic-7, Story 7.1, 7.9:** Clean up broken Satori, schema updates
- **Epic-7, Story 7.2:** Multi-agent pipeline (Strategist → Copywriter → Designer → Brand Analyst)

### Weeks 3-4: Carousel Completion
- **Epic-7, Stories 7.3, 7.4, 7.5:** AI-native rendering, RAG, real LLM
- **Epic-7, Stories 7.6, 7.8:** Error handling, observability

### Week 5: Multi-Platform Foundation
- **Epic-6, Story 6.1:** Platform-agnostic core agents
- Epic-7 validation and production testing

### Weeks 6-7: Orchestrator Chat
- **Epic-5, Story 5.1:** Conversational orchestrator agent
- **Epic-5, Story 5.2:** Knowledge base integration (RAG)

### Week 8: Instagram & Integration
- **Epic-6, Story 6.3:** Instagram post generator
- **Epic-5, Story 5.3:** Chat → Generation handoff

### Weeks 9-10: Polish & Documentation
- **Epic-5, Story 5.4:** Conversation templates
- **Epic-6, Story 6.5:** Platform extension framework documentation
- **Epic-7, Story 7.7:** pgvector semantic search (optional Phase 2)

**Total Timeline:** 10 weeks (2.5 months) for Epics 5-7 complete implementation

---

## Detailed Story Specifications

### Epic-5: Content Orchestrator Chat Interface

#### Story-5.1: Conversational Orchestrator Agent
**Acceptance Criteria:**
- [ ] Chat interface accepts natural language input about content goals
- [ ] Orchestrator maintains conversation context across multiple turns
- [ ] Agent can ask clarifying questions (target audience, pain points, goals)
- [ ] Conversation history stored in `chat_history` table
- [ ] User can switch between brainstorming and generation modes
- [ ] Orchestrator suggests content types based on goals

**Technical Details:**
- Model: Gemini 2.5 Flash
- Database: Extend `chat_history` table with `conversation_type: 'content_planning'`
- Edge Function: `/supabase/functions/chat/index.ts` (extend existing)

**Estimated Effort:** 3 days

---

#### Story-5.2: Knowledge Base Integration for Orchestrator
**Acceptance Criteria:**
- [ ] Orchestrator can search `product_catalog` for product references
- [ ] Orchestrator can query `linkedin_carousels` for previous content themes
- [ ] Integration with `storage.buckets` to find brand assets
- [ ] Search results inform content suggestions
- [ ] RAG context included in orchestrator responses
- [ ] Asset URLs returned for preview

**Technical Details:**
- RAG Pattern: Similar to Epic-2's asset retrieval
- Tables: `product_catalog`, `linkedin_carousels`, `storage.objects`
- Search: Text search first, pgvector semantic (Phase 2)

**Dependencies:** Story 5.1

**Estimated Effort:** 4 days

---

#### Story-5.3: Handoff to Generation Agents
**Acceptance Criteria:**
- [ ] "Generate" command triggers appropriate content agent
- [ ] Chat context passed to generation function
- [ ] User can specify platform (LinkedIn, Instagram, blog)
- [ ] Generation parameters pre-filled from conversation
- [ ] User can review/edit parameters before generation
- [ ] Generated content returned in chat with preview
- [ ] Option to iterate within same conversation

**Technical Details:**
- Pattern: Orchestrator → Platform Router → Specific Generator
- Context Passing: Extract structured params from conversation
- Job Queue: Use Epic-3 async engine for long-running jobs

**Dependencies:** Stories 5.1, 5.2, Epic-6 (Generators)

**Estimated Effort:** 5 days

---

#### Story-5.4: Conversation Templates and Shortcuts
**Acceptance Criteria:**
- [ ] Template: "Product Launch" with guided flow
- [ ] Template: "Thought Leadership" for educational content
- [ ] Template: "Case Study" for customer success stories
- [ ] Templates include suggested questions
- [ ] Users can customize or start from scratch
- [ ] Template metadata stored in `app_config`
- [ ] Analytics on template usage

**Technical Details:**
- Storage: JSON templates in `app_config` table
- UI: Template selector at conversation start

**Dependencies:** Story 5.1

**Estimated Effort:** 3 days

---

### Epic-6: Multi-Platform Content Generation

#### Story-6.1: Platform-Agnostic Agent Architecture
**Acceptance Criteria:**
- [ ] Core agents (Strategist, Copywriter, Brand Analyst) work across platforms
- [ ] Platform adapters handle format-specific requirements
- [ ] Shared RAG asset retrieval
- [ ] Unified brand guidelines configuration
- [ ] Agents output platform-agnostic content
- [ ] Platform formatters transform to specific requirements

**Technical Details:**
```
Architecture:
Orchestrator → Core Agents → Platform Adapter → Formatter → Output

Files:
- /supabase/functions/_shared/agents/strategist.ts
- /supabase/functions/_shared/agents/copywriter.ts
- /supabase/functions/_shared/agents/brand_analyst.ts
- /supabase/functions/_shared/agents/agent_tools.ts (RAG)
- linkedin_adapter.ts, instagram_adapter.ts
```

**Estimated Effort:** 5 days

---

#### Story-6.2: LinkedIn Carousel Generator (Refactor with Mirror Pattern)
**Acceptance Criteria:**
- [ ] Remove broken Satori pipeline
- [ ] Implement Strategist → Copywriter → Designer → Brand Analyst flow
- [ ] Support conversational brainstorming inputs from Orchestrator (FR20)
- [ ] Use Gemini 3 Pro Image for text-in-image
- [ ] Designer searches assets before AI generation
- [ ] Brand Analyst reviews and triggers regeneration if needed
- [ ] 99%+ generation success rate
- [ ] All text clearly visible
- [ ] No mock data in responses
- [ ] Saved to `linkedin_carousels` table

**Technical Details:**
- Remove: Satori, Resvg, local Sharp scripts
- Add: Multi-agent pipeline from Mirror
- Models: Gemini 2.5 Flash (text), Gemini 3 Pro Image (images)
- RAG: Search `product_catalog`, `storage.objects`

**Dependencies:** Story 6.1 (or can implement core agents here first)

**Estimated Effort:** 8 days

---

#### Story-6.3: Instagram Post Generator
**Acceptance Criteria:**
- [ ] Accepts topic, target audience, pain point
- [ ] Support conversational brainstorming inputs from Orchestrator (FR20)
- [ ] Uses same Strategist and Copywriter agents
- [ ] Instagram adapter formats for 1080x1080 or 1080x1350
- [ ] Caption optimized for Instagram (hashtags, emojis)
- [ ] Designer uses Instagram aesthetic
- [ ] Brand guidelines applied
- [ ] Saved to `instagram_posts` table
- [ ] Integration with orchestrator chat

**Technical Details:**
- New Table: `instagram_posts`
```sql
create table instagram_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  topic text,
  caption text,
  image_url text,
  hashtags text[],
  status text default 'draft',
  created_at timestamptz default now()
);
```
- Edge Function: `/supabase/functions/generate-instagram-post/index.ts`
- Formatter: `instagram_formatter.ts`

**Dependencies:** Story 6.1

**Estimated Effort:** 4 days

---

#### Story-6.5: Platform Extension Framework
**Acceptance Criteria:**
- [ ] Documentation: "Adding a New Platform Guide"
- [ ] Platform adapter template with clear interfaces
- [ ] Checklist for platform requirements
- [ ] Code generator script (optional)
- [ ] Example: Add Twitter/X in < 2 days
- [ ] All platforms use same core agents
- [ ] Migration template for new platform tables

**Technical Details:**
- Documentation: `/docs/platform-extension-guide.md`
- Templates: `platform_adapter_template.ts`, `platform_formatter_template.ts`
- Validation: Add Twitter/X as proof of concept

**Dependencies:** Stories 6.1, 6.2, 6.3

**Estimated Effort:** 3 days

---

### Epic-7: Carousel Refactor - Mirror Approach

#### Story-7.1: Remove Broken Satori Pipeline
**Acceptance Criteria:**
- [ ] Delete `generateTextSlideWithSatori()` function
- [ ] Remove all Satori and Resvg imports
- [ ] Remove branding overlay loop
- [ ] Clean up package.json dependencies
- [ ] No "Satori disabled" logs
- [ ] Reduced cold start time

**Technical Details:**
- Files: `/supabase/functions/generate-linkedin-carousel/index.ts`
- Lines Removed: ~200+ lines

**Estimated Effort:** 1 day

---

#### Story-7.2: Implement Multi-Agent Pipeline
**Acceptance Criteria:**
- [ ] Strategist agent plans 5-7 slide structure
- [ ] Copywriter writes headlines and body
- [ ] Designer searches assets, generates AI images
- [ ] Brand Analyst reviews output (quality threshold 70%)
- [ ] All agents use Gemini 2.5 Flash for reasoning
- [ ] Agent coordination using function calling
- [ ] Error handling at each stage
- [ ] Metrics tracking (time, success rates)

**Technical Details:**
- New Files: `agents.ts`, `agent_tools.ts`
- Pattern: Same as Mirror, adapted for Deno
- Models: Gemini 2.5 Flash, Gemini 3 Pro Image

**Dependencies:** Story 7.1

**Estimated Effort:** 5 days

---

#### Story-7.3: AI-Native Text Rendering
**Acceptance Criteria:**
- [ ] Remove "NO TEXT" restriction
- [ ] Include headline/body in image generation prompt
- [ ] Brand guidelines in system prompt
- [ ] Text rendered by AI (no compositing)
- [ ] All images have clear, legible text
- [ ] Logo placement specified in prompt
- [ ] Text readable at small sizes

**Technical Details:**
- Model: Gemini 3 Pro Image
- Prompt Template includes brand colors, typography, layout

**Dependencies:** Story 7.2

**Estimated Effort:** 3 days

---

#### Story-7.4: RAG Asset Retrieval Before Generation
**Acceptance Criteria:**
- [ ] Designer searches `product_catalog`
- [ ] Designer searches `storage.objects` for facility/team photos
- [ ] Text-based search using keywords
- [ ] If asset found (relevance > 70%), use real photo
- [ ] Fallback to AI generation
- [ ] Logs show "Using real asset" vs "Generating AI"
- [ ] Target: 30%+ slides use real assets

**Technical Details:**
```typescript
async function searchCompanyAssets(query: string) {
  // 1. Search products table
  const products = await supabase
    .from('product_catalog')
    .select('image_url, name')
    .textSearch('name', query)
    .limit(3);

  // 2. Search storage buckets
  const { data: files } = await supabase.storage
    .from('assets')
    .list('facility', { search: query });

  return products[0]?.image_url || getPublicUrl(files[0]);
}
```

**Dependencies:** Story 7.2

**Estimated Effort:** 3 days

---

#### Story-7.5: Remove Mock Data and Restore Real LLM
**Acceptance Criteria:**
- [ ] No mock data in production
- [ ] Real LLM calls to Gemini 2.5 Flash
- [ ] Error handling if LLM fails
- [ ] Response validation (JSON schema)
- [ ] Test with diverse topics
- [ ] Generated carousels match user's topic
- [ ] No hardcoded mock text

**Technical Details:**
- Remove: Lines 352-364 (MOCK TEXT GENERATION)
- Add: Proper Copywriter agent LLM calls

**Dependencies:** Story 7.2

**Estimated Effort:** 2 days

---

#### Story-7.6: Consolidate Error Handling
**Acceptance Criteria:**
- [ ] All errors properly typed
- [ ] Consistent error format
- [ ] Centralized error handler
- [ ] Errors include stage info
- [ ] Retryable vs non-retryable classification
- [ ] User-friendly error messages
- [ ] No silent failures

**Technical Details:**
```typescript
type GenerationError = {
  stage: 'strategy' | 'copy' | 'design' | 'review';
  slide_index?: number;
  message: string;
  retryable: boolean;
  code?: string;
};
```

**Dependencies:** Story 7.2

**Estimated Effort:** 2 days

---

#### Story-7.8: Observability and Metrics
**Acceptance Criteria:**
- [ ] Timing for each agent stage logged
- [ ] Success/failure rates tracked
- [ ] Asset usage vs AI generation ratio
- [ ] Quality scores from Brand Analyst
- [ ] Metrics dashboard
- [ ] Alerts for success rate < 95%
- [ ] Metadata saved to `linkedin_carousels`

**Technical Details:**
- Metrics: `strategy_time_ms`, `copywriting_time_ms`, `design_time_ms`, `review_time_ms`, `assets_used_count`, `quality_score`
- Storage: JSON column `generation_metadata`

**Dependencies:** Story 7.2

**Estimated Effort:** 2 days

---

#### Story-7.9: Database Schema Updates
**Acceptance Criteria:**
- [ ] Add `generation_metadata` JSONB column
- [ ] Add `quality_score` numeric column
- [ ] Add `assets_used` text[] column
- [ ] Add `regeneration_count` integer column
- [ ] Migration preserves existing data
- [ ] Indexes for analytics queries

**Technical Details:**
```sql
alter table linkedin_carousels
  add column generation_metadata jsonb default '{}'::jsonb,
  add column quality_score numeric,
  add column assets_used text[],
  add column regeneration_count integer default 0;

create index idx_carousels_quality on linkedin_carousels(quality_score);
```

**Estimated Effort:** 1 day
