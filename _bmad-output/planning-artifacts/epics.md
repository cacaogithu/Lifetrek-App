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
FR2: The system must include a `worker-dispatcher` mechanism (Database Webhooks or similar) to ensure immediately processing of jobs.
FR3: The system must handle multiple simultaneous jobs without race conditions (Job Concurrency).
FR4: The system must persist failed job payloads to allow for "Retry" action without data re-entry.
FR5: The system must support "Sequences" (multi-job batches like "First 3 Posts") and Persona-based tone injection for Content Generation.
FR6: Backend workers must be able to query `products` table and `storage` buckets for Asset Retrieval (RAG).
FR7: The system must integrate with Image Generation APIs (Vertex/Nano Banana) using *Reference Images* to support product fidelity.
FR8: The system must support multi-stage stateful jobs (Research -> Strategy -> Write -> Image) for the Blog Pipeline.
FR9: The system must support Hybrid Execution of Python-based scripts (`rank_leads.py`, `enrich_leads_unipile.py`) alongside TypeScript Edge Functions.
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
- Technical Requirement: Implement `jobs` table with `checkpoint_data` JSON structure for stateful/resumable jobs.
- Technical Requirement: Provision `jobs` table to support `type: 'incoming_webhook'` for future Phase 2 use.
- Technical Requirement: Separate Content Generation (System 1) from LinkedIn Automation (System 2, Future).
- Technical Requirement: System 1 (Content Gen) uses direct Edge Function invocation + Realtime + Optional Content History.
- Technical Requirement: System 2 (LinkedIn Auto) requires `linkedin_automation` table, `automation_rules` table, and `pg_cron` governor.
- Technical Requirement: Hybrid Runtimes support (TypeScript Edge Functions + Python Scripts).
- Technical Requirement: Identity Management for Python scripts (Role/Auth scopes).
- Technical Requirement: Data Reversibility/Versioning for AI-driven updates on Leads.

From UX Design:
- UX Requirement: "Zero Frozen Waits" - background all long-running tasks.
- UX Requirement: "Transparent Progress" via Realtime UI updates (Queued -> Processing -> Done) and Global Toast Notifications.
- UX Requirement: "Job History" sidebar/list for visualizing parallel tasks.
- UX Requirement: "One-Click" interactions triggering complex workflows.
- UX Requirement: Visual Lead Scoring with engagement timeline.
- UX Requirement: Explicit error messages with one-click "Retry" capability.
- UX Requirement: Profile Context Switching (Company vs Salesperson) with filtered views.
- UX Requirement: "Draft Reveal" - content must look professional/on-brand immediately.
- UX Requirement: "Source Citation" card for enriched data.
- UX Requirement: "Streaming" progress indicators (logs) for trust.

### FR Coverage Map

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
