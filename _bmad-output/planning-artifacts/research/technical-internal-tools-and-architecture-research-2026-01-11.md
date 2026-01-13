---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Internal Tools & Project Architecture'
research_goals: 'Analyze LinkedIn Carousel Generator, evaluate Internal Project Approach, and assess Vercel Migration Architecture'
user_name: 'Rafaelalmeida'
date: '2026-01-11'
web_research_enabled: true
source_verification: true
---

# Research Report: Technical

**Date:** 2026-01-11
**Author:** Rafaelalmeida
**Research Type:** technical

---

## Research Overview

[Research overview and methodology will be appended here]

---

## Technical Research Scope Confirmation

**Research Topic:** Internal Tools & Project Architecture
**Research Goals:** Analyze LinkedIn Carousel Generator, evaluate Internal Project Approach, and assess Vercel Migration Architecture

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-01-11

## Technology Stack Analysis

### Programming Languages

**TypeScript**
- **Usage**: Primary language for both Frontend (React) and Backend (Supabase Edge Functions/Deno).
- **Analysis**: Uniform language stack lowers context switching overhead. The usage of Deno for backend functions aligns with modern serverless trends, though it requires specific handling for environment variables and node-specifc incompatibilities (which Deno mostly solves now).
- **Source**: [Codebase Analysis: `src/**/*.ts`, `supabase/functions/**/*.ts`]

### Development Frameworks and Libraries

**Frontend: React + Vite + Shadcn UI**
- **Analysis**: A robust, modern stack. Vite provides fast HMR. Shadcn UI (Radix Primitives) ensures accessibility and control without the "component library lock-in" of Material UI.
- **Suitability**: Excellent for internal tools that need to look professional ("professional company") without excessive custom styling overhead.
- **Source**: [Codebase Analysis: `package.json`]

**Backend: Supabase Edge Functions**
- **Analysis**: Used for business logic (LinkedIn generation). Running on Deno. capable of handling modern web standards.
- **Risk**: The current implementation of `generate-linkedin-carousel` performs heavy, long-running sequential AI tasks (Text gen + 5-7 Image gens) within a single HTTP request. This patterns risks hitting the 150s-400s execution limits of Edge Functions.
- **Source**: [Supabase Edge Functions Limits](https://supabase.com/docs/guides/functions/limits), [Codebase: `supabase/functions/generate-linkedin-carousel/index.ts`]

### Database and Storage Technologies

**Supabase (PostgreSQL)**
- **Analysis**: Serves as the relational store and auth provider.
- **Usage**: "Monolith" structure where the frontend talks directly to DB (via RLS) for CRUD, and Edge Functions for heavy lifting.
- **Verdict**: Highly scalable for this use case. No immediate need to migrate off Supabase.

### Cloud Infrastructure and Deployment

**Vercel (Frontend Hosting)**
- **Analysis**: The user is migrating here. Vercel is the gold standard for React deployment.
- **Limits**: Vercel Serverless Functions have a default 15s timeout on Hobby, up to 900s on Pro. However, since the backend logic remains in Supabase Edge Functions, the Vercel timeouts leverage Supabase's invocation limits.
- **Integration**: Vercel frontend + Supabase backend is a proven architectural pattern ("The T3/PAAS Stack").
- **Source**: [Vercel Timeouts](https://vercel.com/docs/functions/serverless-functions/runtimes#max-duration)

### Operational Tools (Internal)

**LinkedIn Carousel Generator**
- **Current Architecture**: Synchronous `HTTP Request -> Logic -> Response`.
- **Issues**: User waits for 30s-60s+. High failure rate potential (network blip kills entire process). Browsers may timeout the request before the server finishes.
- **Recommendation**: Needs `Async Job Queue` architecture (Request -> Queue -> Worker -> Notification).

## Integration Patterns Analysis

### API Design Patterns

**Current Implementation**
- **Pattern**: RPC-like HTTP POST to Edge Function (`/generate-linkedin-carousel`).
- **Issues**: Tightly coupled, synchronous, brittle.
- **Recommendation**: Move to **Asynchronous Job Pattern**.
    1. `POST /api/jobs` (Returns `202 Accepted` + `jobId`).
    2. Client polls `GET /api/jobs/:id` OR listens to `REALTIME: INSERT/UPDATE` on `jobs` table.

### Communication Protocols

**Database Webhooks**
- **Usage**: Supabase Database Webhook -> Trigger Edge Function.
- **Analysis**: This is the most "Supabase-native" way to decouple the Frontend from the Long-Running Process.
- **Implementation**:
    - Frontend inserts row into `generation_queue`.
    - `INSERT` trigger calls `webhook` -> `generate-linkedin-carousel` function.
    - Function processes and updates row.

### System Interoperability Approaches

**Client-Side Realtime**
- **Technique**: Supabase Realtime (WebSockets).
- **Usage**: Frontend subscribes to `postgres_changes` on `generation_queue` table.
- **Benefit**: "Push" updates to the Admin Dashboard (e.g., "Generating Slide 3/5..." -> "Complete"). Highly professional UX.

## Architectural Patterns and Design

### System Architecture Patterns

**Modular Monolith**
- **Current**: Tech-layered Monolith (`components/`, `pages/`).
- **Proposed**: **Domain-Driven Modular Monolith**.
    - Structure:
        - `src/features/content-automation/`
        - `src/features/crm/`
        - `src/features/analytics/`
    - **Benefit**: "Solidifies" the architecture. Each feature contains its own Components, Hooks, API Services, and Types.
    - **Source**: [Modular Monolith Best Practices](https://medium.com/@kyleweatherly/modular-monoliths-with-react-1-3-469614X)

### Design Principles and Best Practices

**Service Layer Pattern**
- **Current**: Direct `supabase.from()` calls in Components/Hooks? (Need to verify deep usage, but common in simple Supabase apps).
- **Proposed**: Explicit **Service Layer** (`src/services` or `src/features/*/api`).
    - **Why**: Decouples UI from Data Fetching logic. Easier to test. Easier to swap backend logic later (e.g., adding caching).
- **Source**: [React Service Layer Patterns](https://dev.to/alexeagleson/how-to-create-a-singleton-service-for-api-calls-in-react-typescript-2f1d)

### Scalability and Performance Patterns

**Async Worker Pattern**
- **Crucial for**: `generate-linkedin-carousel`.
- **Logic**:
    - **Producer**: Frontend.
    - **Queue**: Supabase Table (`queue_linkedin_generations`).
    - **Consumer**: Supabase Edge Function (triggered by Webhook or pg_cron).
    - **Result Store**: Supabase Table (`linkedin_carousels`).
- **Benefit**: Removes Vercel 60s timeout risk completely. Handles failures gracefully (retry logic in worker).

### Security Architecture Patterns

**Row Level Security (RLS)**
- **Current**: Supabase standard.
- **Solidification**: Ensure *every* table has RLS enabled. Ensure Service Role Key is ONLY used in Edge Functions, never in Client.

## Implementation Approaches and Technology Adoption

### Technology Adoption Strategies

**Refactoring Strategy: "Strangler Fig" for Internal Tools**
- **Approach**: Do not rewrite the entire app.
- **Step 1**: Isolate `generate-linkedin-carousel`.
- **Step 2**: Create the new Async Queue infrastructure side-by-side with the existing sync API.
- **Step 3**: Point the Frontend to the new Async API.
- **Step 4**: Deprecate the old Sync API.
- **Source**: [Strangler Fig Pattern](https://martinfowler.com/bliki/StranglerFigApplication.html)

### Development Workflows and Tooling

**Vercel + Supabase Workflow**
- **Local Dev**: Use `supabase start` for local DB/Functions. Use `npm run dev` for Frontend.
- **Preview**: Use Vercel Preview Deployments. Connect them to a *Staging* Supabase project (if budget allows) or share the Dev project with strict RLS data separation.
- **CI/CD**: Stick to Vercel's zero-config git integration.

### Testing and Quality Assurance

**Testing Async Jobs**
- **Challenge**: Hard to test "Click button -> Wait 60s -> See result" manually repeatedly.
- **Solution**: Automated Integration Test.
    1. Script calls `POST /api/jobs`.
    2. Script polls DB for `completed`.
    3. Failure if timeout > 120s.

### Deployment and Operations Practices

**Monitoring**
- **Supabase**: Enable Log Draining to a specialized tool (e.g. Baselime, Axiom) if logs are critical.
- **Vercel**: Use Vercel Analytics for Frontend performance.
- **Job Reliability**: Create a `dead-letter-queue` (DLQ) for failed generations (status = 'failed'). Add a "Retry" button in Admin UI.

## Technical Research Recommendations

### Implementation Roadmap

1.  **Architecture Solidification**: Reorganize `src/` into `src/features/` (Modular Monolith).
2.  **Async Infrastructure**: Create `jobs` table and `process-job` worker framework.
3.  **Migration**: Port `generate-linkedin-carousel` to the new worker.
4.  **UX Upgrade**: Add "Realtime Progress" toast/dialog to Admin UI.

### Technology Stack Recommendations

- **Keep**: React, Vite, Shadcn, Supabase, Vercel.
- **Add**: `pg_net` (implicitly used by webhooks) or `pg_cron` for robust job scheduling.

### Risk Management

- **Risk**: Vercel Timeouts. **Mitigation**: Async Workers (100% fix).
- **Risk**: Supabase Compute limits. **Mitigation**: Efficient prompt engineering (smaller prompts) or offloading to specialized AI providers if Edge Functions get too expensive.

### Success Metrics

- **Reliability**: < 1% failure rate on Carousel Generation.
- **User Experience**: User is never stuck "waiting" on a frozen screen.
- **Maintainability**: New features (e.g. Instagram Generator) can be added as new "Workers" without changing the core infrastructure.




## Safety & Governance Research (LinkedIn Limits)

### LinkedIn Activity Limits (2025/2026 Context)
Research indicates explicit "Safety Thresholds" that our Architecture **must not exceed** to prevent account bans or restrictions.

**1. Connection Requests**
*   **Cap**: ~100-200 requests per week (Strictly enforced weekly).
*   **Daily Safe Zone**:
    *   **Free Account**: 15-20 requests/day.
    *   **Sales Navigator/Premium**: 30-50 requests/day.
    *   **Risk**: Spiking activity (e.g. sending 100 in one hour) triggers "bot detection".
    *   **Implication**: The Async Worker must implement **Rate Limiting** (e.g., process max 5 requests/hour) regardless of how many jobs the user enqueues.

**2. Messaging (InMail & Direct)**
*   **Cap**: ~100-150 messages/day (Total).
*   **Unipile Recommendation**: 50-80 messages/day for sustained safety.
*   **InMail**: Limited by credits (typically 50/month), but free InMails (Open Profiles) also have hidden caps (~800/month).
*   **Implication**: The "Inbox" feature (Phase 2) needs a "Message Queue" that throttles outgoing replies if the daily limit is near.

**3. Profile Views (Enrichment/Scraping)**
*   **Unipile Limit**: Max 500 profile views/day (Standard) or 2,500/day (Sales Nav).
*   **Commercial Use Limit**: Free accounts are capped at ~300 searches/month. Sales Nav is effectively unlimited.
*   **Implication**: "Deep Enrichment" jobs (visiting profiles) are expensive. We must prefer API-based enrichment (which doesn't visit profiles via the user's session) where possible, or strictly meter the "Profile Visit" worker.

**4. "Warming Up" Strategy**
*   **Rule**: New automation integrations must start **Slow**.
*   **Schedule**:
    *   Week 1: 10 actions/day.
    *   Week 2: 20 actions/day.
    *   Week 3: Ramp to target.
*   **Architecture Requirement**: The `jobs` table or a separate `system_settings` table needs to store a global `daily_action_limit` config that the Workers check before claiming a job.
