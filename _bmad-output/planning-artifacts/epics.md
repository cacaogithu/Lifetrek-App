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
| **Epic-2: Deep Research & Blog Agent** | FR6, FR8, FR9, NFR8 |
| **Epic-3: Async Job Engine & UI** | FR4, FR13, FR14, FR16, NFR1, NFR2, NFR4, NFR9 |
| **Epic-4: Lead Scoring & Dashboard** | FR10, FR11, FR12, FR19 |

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

### Epic-3: Async Job Engine & Admin UI
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
