---
stepsCompleted: []
inputDocuments:
  - _bmad-output/planning-artifacts/epics.md
  - _bmad-output/planning-artifacts/technical-google-cloud-agent-tools-research-2026-01-14.md
---

# User Stories - Implementation Ready

## Epic-1: Core Hybrid Infrastructure

### Story-1.1: Setup Hybrid Monorepo & Python Service
**As a** Developer
**I want** a structured Monorepo with a dedicated Python Agent service
**So that** I can build advanced AI features in Python while keeping the Next.js frontend clean.

**Acceptance Criteria:**
- [ ] Repo structure includes `apps/web` (Next.js) and `apps/agent-service` (Python).
- [ ] `apps/agent-service` is initialized with FastAPI and Poetry/pip.
- [ ] Dockerfile created for `apps/agent-service` using multi-stage build (slim base).
- [ ] Local development script runs both services concurrently (Next.js on 3000, FastAPI on 8000).
- [ ] CI/CD pipeline (Cloud Build) builds and pushes the Python container.

### Story-1.2: Implement Async Job Queue (Webhooks)
**As a** System Architect
**I want** a reliable mechanism to trigger Python jobs from Supabase
**So that** long-running AI tasks don't block the UI or time out.

**Acceptance Criteria:**
- [ ] `job_queue` table created in Supabase (id, type, payload, status, result).
- [ ] Database Webhook configured to POST to `apps/agent-service/webhook` on INSERT.
- [ ] Python service validates the Webhook signature (security).
- [ ] Python service spawns a background task (asyncio) to process the job.
- [ ] Python service updates the `job_queue` row with `status='completed'` and `result`.

### Story-1.3: Configure Supabase <-> Google Auth
**As a** Security Engineer
**I want** to securely manage credentials between Google Cloud and Supabase
**So that** the Agent can access the database without hardcoded keys.

**Acceptance Criteria:**
- [ ] Google Secret Manager stores `SUPABASE_SERVICE_ROLE_KEY` and `DB_PASSWORD`.
- [ ] Cloud Run Service Account has `secretmanager.secretAccessor` role.
- [ ] Python service retrieves secrets at startup / runtime.
- [ ] Python service connects to Supabase Postgres using `psycopg2` / `vecs`.

## Epic-2: Deep Research & Blog Agent

### Story-2.1: Implement "Deep Research" Tool
**As a** Content Creator
**I want** the AI to research a topic before writing
**So that** my content is factual and high-quality.

**Acceptance Criteria:**
- [ ] `research_tool` Python function implemented using Google Search API (or Serper).
- [ ] LangChain Agent configured to use the research tool.
- [ ] Agent accepts a "Topic" and returns a "Research Summary" with citations.
- [ ] Output is structured (JSON) and stored in the job result.

### Story-2.2: Implement RAG Asset Retrieval
**As a** Brand Manager
**I want** the AI to use my previous posts and uploaded assets
**So that** the new content sounds like me.

**Acceptance Criteria:**
- [ ] `pgvector` extension enabled in Supabase.
- [ ] `retrieval_tool` Python function queries the vector store for similar chunks.
- [ ] Python script provided to "Index" existing content into the vector store.
- [ ] Agent prompt includes retrieved context (RAG pattern).

## Epic-3: Async Job Engine & Admin UI

### Story-3.1: Build "Job Monitor" Dashboard
**As a** Admin
**I want** to see the status of all background jobs
**So that** I can debug failures and ensure the system is working.

**Acceptance Criteria:**
- [ ] New Admin Page: `/admin/jobs`.
- [ ] Table view of `job_queue` (REALTIME subscription).
- [ ] Columns: Time, Type, Status (Badge), Duration.
- [ ] "View Details" modal shows the JSON payload and result.
- [ ] "Retry" button resubmits a failed job.

### Story-3.2: Add Realtime Notifications
**As a** User
**I want** to know when my content is ready
**So that** I don't have to refresh the page.

**Acceptance Criteria:**
- [ ] Global Toaster component subscribed to `job_queue` changes for current user.
- [ ] Toast appears on `status='completed'`: "Your Blog Post is ready!".
- [ ] Toast links to the result (e.g., the generated post).
