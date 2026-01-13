---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-10-nonfunctional']
inputDocuments:
  - _bmad-output/planning-artifacts/research/technical-internal-tools-and-architecture-research-2026-01-11.md
  - _bmad-output/project-knowledge/api-contracts.md
  - _bmad-output/project-knowledge/component-inventory.md
  - _bmad-output/project-knowledge/development-guide.md
  - _bmad-output/project-knowledge/index.md
  - _bmad-output/project-knowledge/project-overview.md
  - _bmad-output/project-knowledge/source-tree-analysis.md
workflowType: 'prd'
classification:
  projectType: "internal_tools"
  domain: "marketing_sales_automation"
  complexity: "medium"
  projectContext: "brownfield"
status: "final"
--

# Product Requirements Document - Lifetrek-App

**Author:** Rafael
**Date:** 2026-01-11

## Success Criteria

### User Success

*   **Zero "Frozen" Waits**: User never waits on a blocking spinner for > 2 seconds. All long-running tasks are backgrounded.
*   **Transparent Progress**: User always knows the state of a job (Pending, Processing, Done) via Realtime UI updates.
*   **Reliable Generation**: User gains confidence that "Generate" button always results in an outcome (Success or explicit Error), never a silent timeout.

### Business Success

*   **Operational Reliability**: Reduce fail rate of AI automations from ~20% (estimated timeout risk) to < 1%.
*   **Scalable Architecture**: Establish a "cookie-cutter" pattern for adding new AI tools (Instagram, Email) without re-inventing the wheel.
*   **Professional Tooling**: Elevate the internal tool suite to a "Product Quality" standard, reducing internal friction for the marketing team.

### Technical Success

*   **Architecture Compliance**: Implementation of `jobs` table, Async Workers, and Realtime subscriptions.
*   **Performance**: Job enqueue API latency < 500ms.
*   **Observability**: Full audit log of all jobs in the `jobs` table (who started it, parameters, result).

### Measurable Outcomes

*   **Carousel Generation Success Rate**: >= 99%.
*   **Average Job Enqueue Time**: < 500ms.

## Product Scope

### MVP - Minimum Viable Product

*   **Infrastructure**:
    *   `jobs` table with RLS and Realtime enabled.
    *   `worker-dispatcher` mechanism (Database Webhook or similar).
    *   `linkedin-carousel-worker` Edge Function (refactored from current sync function).
*   **Frontend**:
    *   "Job History" View in Admin Sidebar.
    *   Toast Notifications for "Job Started" and "Job Completed".
    *   Update "Generate Carousel" button to trigger Async Job instead of Sync implementation.
    *   **Blog Generator UI**: Integrate the Blog Generation pipeline (Perplexity -> Gemini) into the Async UI.
    *   **Leads Dashboard**: UI for triggering Lead Enrichment (`enrich_leads_unipile.py`) and Scoring (`rank_leads.py`) jobs.

### Growth Features (Post-MVP)
*   **Hybrid Python Workers**: Support for running Python-based automations (Unipile scripts) within the same Async infrastructure.

*   **Retry Mechanism**: "Retry" button in UI for failed jobs.
*   **Scheduled Jobs**: "Post at [Date/Time]" functionality using `pg_cron`.
*   **Multi-Agent Workflows**: Chained jobs (e.g., Blog -> generate -> auto-create LinkedIn Post).

## Vision (Future)

### Phase 2: LinkedIn Outreach & Inbox (Next Sprint)
*   **Unified Inbox**: Aggregating messages from LinkedIn (via Unipile) into the internal tool.
*   **Outreach Automation**: Automated connection requests and follow-ups based on "Lead Score".
*   **Two-Way Sync**: Handling incoming webhooks/polling for message replies, not just outgoing jobs.

## User Journeys

### 1. The "Set-and-Forget" Creator (Primary - Success Path)
*   **Persona:** Sarah (Marketing Lead).
*   **Goal:** Create next week's LinkedIn content without being blocked.
*   **Story:** Sarah opens the "Carousel Generator". She selects the "Company Page" profile. She fills in the topic "Medical Device Regulations". Instead of waiting 60s looking at a spinner, she clicks "Generate" and immediately sees a "Job Started" notification. She navigates away to the Leads page to checks some contacts. 45 seconds later, a subtle "Toast" pops up: "Carousel 'Medical Device Regulations' is ready". She clicks it, jumps back to the result, reviews the copy, and hits "Schedule".
*   **Key Requirement:** Non-blocking async queue + Global Toast Notifications.

### 2. The "Batch Processor" (Primary - Efficiency)
*   **Persona:** Sarah (Marketing Lead).
*   **Goal:** Generate content for 3 different personas simultaneously.
*   **Story:** Sarah wants to dominate the feed. She opens the generator and fires off a "Technical Deep Dive" for the Engineering Lead persona. Immediately after, she switches to "Sales Personality" and fires off a "Customer Success Story". She sees 2 "Processing" jobs in the sidebar. She doesn't wait for either. She goes to grab coffee. When she returns, both jobs are marked "Complete" in the history.
*   **Key Requirement:** Job Concurrency and "Job History" sidebar/list.

### 3. The "First Impression" Campaign (Flexible Generation)
*   **Persona:** Sarah (Marketing Lead).
*   **Goal:** Launch a new Instagram/LinkedIn presence with a specific "Introductory Sequence".
*   **Story:** Sarah is onboarding a new Sales Engineer, "Mike". She doesn't just want one random post. She selects the "New Profile Launch" template in the generator. She requests the "First 3 Posts" (Intro, Expertise, Personal Story). The system queues 3 separate generation jobs, tagged as a sequence. She reviews them as a cohesive "Series" to ensure the narrative flows from post 1 to 3.
*   **Key Requirement:** "Multi-Job" or "Batch" generation capability (Sequence/Template support).

### 4. The "Morning Hunt" (Sales Engineer)
*   **Persona:** Mike (Sales Engineer).
*   **Goal:** Identify high-value prospects to contact first thing in the morning.
*   **Story:** Mike logs in at 9 AM with his coffee. He goes straight to his "Dashboard". He sees a list of "Top Leads" sorted by "Engagement Score" (calculated from their interaction with the company's LinkedIn content and website visits). He clicks the top lead, "Dr. Smith", reviews the insights gathered by the system, and initiates a call or email directly from the dashboard.
*   **Key Requirement:** Lead Scoring/Dashboard features (and integration between Content engagement and Lead scoring).

### 5. The "Error Recovery" (Admin/Dev)
*   **Persona:** Rafael (Dev/Admin).
*   **Goal:** Debug a failed generation.
*   **Story:** A job fails due to an OpenAI API outage. Sarah complains "it didn't work". Rafael checks the "Jobs" table in the Admin panel. He sees the status `failed` and the error `503 Service Unavailable`. Instead of asking Sarah to re-type her prompt, he simply clicks "Retry" on the failed job. The system re-queues it with the original payload. It succeeds this time.
*   **Key Requirement:** Job Persistence (saving payload) and "Retry" action.

### 6. The "AI Designer" (System Agent Story)
*   **Persona:** AI Agent (Background Worker).
*   **Goal:** Create a "Product Showcase" carousel consistent with Brand Identity.
*   **Story:** A "Product Showcase" job is triggered.
    1.  **Search**: The Agent searches the internal `products` database for high-quality images of "Machinery X".
    2.  **Asset Retrieval**: It retrieves the vector Logo and Brand Colors from the `brand_assets` bucket.
    3.  **Synthesis**: It constructs a rigorous prompt for the Design API (Nano Banana/Vertex), passing the valid Product Image as a *Reference Image* to ensure accuracy.
    4.  **Generation**: It instructs the design model to "Place product X on a branded background, apply the logo in the top-right, and overlay the text 'Precision Engineering'".
    5.  **Result**: The carousel matches the *actual* product, not a hallucination.
*   **Key Requirement:** RAG (Retrieval) from Database, Asset Management, and Multi-modal Image Generation (Image-to-Image / Reference Images).

### 7. The "Thought Leader" (Long-Running Blog)
*   **Persona:** Sarah (Marketing Lead).
*   **Goal:** Publish a comprehensive, fact-checked technical article on "ISO 13485 Compliance".
*   **Story:** Sarah inputs the topic. The system starts a "Deep Research" job (Perplexity). It takes 2 minutes. She doesn't wait. The system then triggers a "Strategy" agent (Gemini), then a "Writer" agent, and finally an "Image Generator". 15 minutes later, Sarah gets a notification: "Blog Draft Ready". She sees the full article with citations, SEO meta-tags, and a generated banner image.
*   **Key Requirement:** Multi-stage Orchestration (Workflow State Management) & Long-running task support (>5 mins).

### 8. The "Data Enricher" (Leads Ecosystem)
*   **Persona:** Mike (Sales Engineer) or Admin.
*   **Goal:** Enrich a new batch of 500 uploaded leads.
*   **Story:** Mike uploads a CSV of cold leads. He clicks "Enrich & Score". The system spins up the Python enrichment worker. He sees a progress bar moving: "Enriched 12/500...". He closes the tab. The job continues running. When he returns 2 hours later, all 500 leads have LinkedIn profiles found, Decision Makers identified, and are sorted by "Warmth" score.
*   **Key Requirement:** Large Batch Processing & Progress Tracking for very long jobs.

### 9. The "Relationship Builder" (Phase 2 - Future)
*   **Persona:** Vanessa (Sales Lead).
*   **Goal:** Manage replies from the "Introductory Sequence" without leaving the internal tool.
*   **Story:** Vanessa logs in and sees a "Inbox" tab with a badge "5 New Replies". She opens it. It aggregates messages from her LinkedIn. She sees a reply from Dr. Smith: "Interested, tell me more." She types a reply, uses an "AI Refine" button to polish the tone, and hits "Send". The system queues a background job to send the message via Unipile.
*   **Key Requirement:** Two-Way Sync (Ingestion), Conversation State Management, and Realtime Messaging UI.

### Journey Requirements Summary
*   **Async Job Infrastructure**: Essential for Sarah's non-blocking flows.
*   **Job History/Sidebar**: Visualizing parallel tasks.
*   **Templating/Batching**: Support for "Sequences" (first 3 posts).
*   **Lead Dashboard**: Visualization of High-Score Leads (Sales Engineer flow).
*   **Retry Capability**: Admin tools for reliability.
## Domain-Specific Requirements (Functional)

### 1. Async Job Engine (Core Domain)
*   **Jobs Table**: Centralized `jobs` table to store `status`, `payload` (prompt, params), `result` (URLs), and `error` logs.
*   **Worker Dispatcher**: Robust trigger mechanism (Database Webhooks -> Edge Function) to ensure immediate processing.
*   **Concurrency**: Handling multiple simultaneous jobs without race conditions (e.g. Sarah's batch processing).
*   **Persistence**: Failed jobs must persist their input payload to allow for "Retry" without data re-entry.

### 2. Content Generation Service (AI)
*   **Template Engine**: Support for "Sequences" (e.g. 3 linked posts) and Persona-based tone injection.
*   **Asset Retrieval (RAG)**: Workers must be able to query the `products` table and `storage` buckets to find real Product Images and Brand Assets (Logos) to use as reference inputs.
*   **Reference Image Support**: Integration with Image Generation APIs (Vertex/Nano Banana) that support *Reference Images* to ensure product fidelity (preventing hallucinations).
*   **Blog Pipeline**: Support for multi-stage jobs (Research -> Strategy -> Write -> Image) as seen in the `generate-blog-post` function.

### 3. Lead Scoring & Enrichment Ecosystem
*   **Hybrid Execution**: Ability to trigger and monitor Python-based scripts (`rank_leads.py`, `enrich_leads_unipile.py`) alongside TypeScript Edge Functions.
*   **Engagement Tracking**: Track internal signals (if available) or external webhook data to update Lead Scores.
*   **Score Calculation**: Algorithm that ranks leads for the Sales Engineer dashboard.
*   **Logic Preservation**: Must preserve existing "Ownership Rules" (e.g. `MARCIO` vs `VANESSA` product lists) and "Heatmap Categories" currently defined in `rank_leads.py`.

### 4. Admin Dashboard
*   **Job Monitor**: Audit log view of all system activity.
*   **Retry Action**: "One-click" recovery for failed jobs.

### 5. Safety & Governance (Critical)
*   **Cost Guardrails**: System checks a daily "Spend Limit" or "Job Quota" before enqueuing new AI jobs to prevent runaway costs ($ Limit/Day).
*   **"Away" Notifications**: Long-running batch jobs (e.g. Lead Enrichment) must send an email/Slack notification upon completion.
*   **"Draft-Only" Enforcement**: AI Agents strictly forbidden from setting content status to `published`. All AI-generated content defaults to `draft` requiring human approval.
*   **Human Simulation (Outreach)**:
    *   **Variable Intervals (Jitter)**: Operations must not run on rigid cron schedules (e.g. exactly 9:00). Must enforce randomized delays (e.g. `30 mins ± 15 mins`).
    *   **Active Hours**: Hard enforcement of **09:00 - 21:00** (Timezone aware). No actions outside this window.
    *   **Dynamic Daily Limits**: The daily cap is not static (e.g. 40). It must be randomized each day (e.g. `random(20, 40)`) to ensure the account looks organic.
    *   **Weekly Hard Cap**: Strict stop at **150 actions/week**.

## Non-Functional Requirements

### Performance
*   **Job Enqueue Latency**: The API endpoint to submit a job must respond in **< 500ms** to ensure the UI feels responsive.
*   **Realtime Feedback**: "Job Started/Completed" events must appear in the UI within **2 seconds** of the state change.

### Reliability
*   **Zero-Timeout Promise**: The Async architecture must guarantee **0% timeout errors** for the user (even if the worker fails, the web request succeeds).
*   **Recovery**: The system must persist job payloads so that any failed job can be "Retried" without data loss.

### Security
*   **Row Level Security (RLS)**: Strict RLS on the `jobs` table ensures users can only view/manage their own jobs.
*   **Worker Context**: Backend workers must execute with Service Role access but validate the effective `user_id` for all operations.

### Maintainability
*   **Modular Monolith**: New features must be implemented in strictly defined Feature Modules (e.g., `src/features/content-automation`) to prevent codebase tangling.

