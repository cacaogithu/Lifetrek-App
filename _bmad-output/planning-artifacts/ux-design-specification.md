---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-03-core-experience']
inputDocuments:
  - _bmad-output/planning-artifacts/prd.md
  - _bmad-output/planning-artifacts/architecture.md 
  - _bmad-output/project-knowledge/component-inventory.md
  - _bmad-output/project-knowledge/project-overview.md
workflowType: 'ux-design'
project_name: 'Lifetrek-App'
user_name: 'Rafael'
date: '2026-01-13'
---

# UX Design Specification - Lifetrek-App

**Author:** Rafael  
**Date:** 2026-01-13

---

## Executive Summary

### Project Vision

Lifetrek-App serves as a **dual-purpose platform**: a public-facing showcase for precision medical/dental manufacturing capabilities and a powerful internal operational tool. The vision is to elevate internal marketing and sales automation from basic tools to **production-quality software** that eliminates friction, enables creativity, and drives business growth.

The core UX philosophy: **"Set-and-Forget" productivity** - users initiate AI-powered tasks (content generation, lead enrichment) and seamlessly continue their work while the system handles execution in the background with transparent real-time updates.

### Target Users

**Primary Users:**

1. **Sarah (Marketing Lead)** - Creates LinkedIn content campaigns
   - **Goals**: Generate multi-channel content without browser timeouts
   - **Pain Points**: Waiting on AI generation, context switching, inconsistent output
   - **Tech Level**: Intermediate - comfortable with web tools, expects modern UX

2. **Mike (Sales Engineer)** - Identifies and engages high-value prospects
   - **Goals**: Quick access to scored leads with actionable insights
   - **Pain Points**: Data overload, unclear prioritization, disconnected tools
   - **Tech Level**: Intermediate - needs efficiency over complexity

3. **Vanessa (Sales Lead)** - Manages LinkedIn outreach and relationships (Phase 2)
   - **Goals**: Scale personal outreach while maintaining authenticity
   - **Pain Points**: Manual LinkedIn workflows, account safety concerns
   - **Tech Level**: Intermediate - needs safety guardrails and guidance

**Secondary Users:**

4. **Rafael (Dev/Admin)** - Monitors system health and debugs issues
   - **Goals**: Quick troubleshooting, comprehensive audit trails
   - **Pain Points**: Lack of visibility into job failures, difficult error recovery
   - **Tech Level**: Advanced - needs detailed technical information

### Key Design Challenges

1. **Async Job Confidence**
   - **Challenge**: Users must trust that clicking "Generate" will reliably produce results without freezing their browser
   - **UX Requirement**: Crystal-clear visual feedback showing job progression (Queued → Processing → Completed)
   - **Success Metric**: Zero anxiety about "did it work?"

2. **Multi-Job Orchestration**
   - **Challenge**: Users run multiple AI jobs simultaneously (batch content creation)
   - **UX Requirement**: Persistent job history sidebar with real-time status updates
   - **Success Metric**: Users can confidently queue 3-5 jobs and navigate away

3. **Profile Context Switching**
   - **Challenge**: Users create content for different LinkedIn profiles (Company vs Salesperson)
   - **UX Requirement**: Clear visual indicators and filtered views per profile type
   - **Success Metric**: No content generated for wrong profile

4. **Error Recovery & Transparency**
   - **Challenge**: When AI fails (API outage, timeout), users need clear next steps
   - **UX Requirement**: Explicit error messages with one-click retry capability
   - **Success Metric**: Failed jobs don't require re-entering data

5. **Lead Dashboard Usability**
   - **Challenge**: Display rich lead data (scores, engagement, company info) without overwhelming
   - **UX Requirement**: Progressive disclosure, visual scoring indicators, quick actions
   - **Success Metric**: Sales team finds top leads in <30 seconds

### Design Opportunities

1. **Delightful Async Patterns**
   - **Opportunity**: Modern toast notifications create a premium, responsive feel
   - **Innovation**: Subtle animations and progress indicators make waiting enjoyable
   - **Competitive Advantage**: Users love the "fire and forget" workflow

2. **Content Studio Excellence**
   - **Opportunity**: Streamlined multi-step content generation with preview/approval
   - **Innovation**: Template-based batch generation with brand consistency
   - **Competitive Advantage**: Reduces content creation time by 80%

3. **AI-Assisted Sales Enablement**
   - **Opportunity**: Surface high-value lead insights at the right moment
   - **Innovation**: Visual lead scoring with engagement timeline
   - **Competitive Advantage**: Sales team spends time on warm leads only

4. **Safety-First Automation**
   - **Opportunity**: Build trust through visible safety guardrails
   - **Innovation**: Draft-only enforcement, daily limit indicators, time window badges
   - **Competitive Advantage**: Users feel safe delegating to AI

## Design Constraints

**Technical:**
- React/Vite frontend with Shadcn UI component library
- Supabase Realtime for job status updates (<2s latency)
- Mobile-responsive required (users on tablets/phones)

**Brand:**
- Lifetrek Brand Book colors (Corporate Blue, Innovation Green, Energy Orange)
- Premium, professional aesthetic (no playful/casual UI)
- Glassmorphism and subtle shadows preferred

**Business:**
- Draft-only enforcement (no auto-publish to protect brand)
- Cost guardrails visible to users (prevent runaway AI costs)
- Phase 1 scope: Content Generation only (no LinkedIn automation yet)

## Core User Experience

### Defining Experience

The core experience of Lifetrek-App is defined by **high-leverage, one-click intelligence**. It is not just about "filling forms" but triggering powerful, multi-step asynchronous workflows with a single action.

**The Core Loop:**
1. **Select Action** (Generate Blog / LinkedIn Post / Enrich Lead)
2. **Input Minimal Context** (Topic URL or Lead Name)
3. **Trigger "One-Click" Magic** (System handles research, drafting, and formatting in background)
4. **Review & Refine** (High-quality draft ready for final polish)

### Platform Strategy

**Primary Platform: Desktop Web (Admin Dashboard)**
- **Focus:** High-density command center for complex operations.
- **Rationale:** Users are doing "deep work" (content strategy, lead research, data analysis) that requires screen real estate and multiple windows/tabs.
- **Mobile Role:** Secondary/View-only (checking job status or urgent approvals), but creation happens on Desktop.

### Effortless Interactions

1. **"One-Button" Deep Research**
   - **Interaction:** Clicking "Enrich" on a lead or topic.
   - **Backstage:** instantly triggers Perplexity API + CRM lookup + Scoring logic.
   - **User Feel:** "I asked a question, and the system did the homework for me instantly."

2. **Unified Content Creator**
   - **Interaction:** A single interface to generate *different* types of content (Blogs, LinkedIn Carousels, Text Posts) without learning new tools for each.
   - **Pattern:** Consistent "Prompt -> Generate -> Review" flow across all content types.

### Critical Success Moments

1. **The "Data Reveal"**
   - **Moment:** When the "Enriching..." spinner stops and the Lead profile fills with rich, accurate data (Company revenue, recent news, LinkedIn activity).
   - **Success:** User feels "This person is real and I know how to talk to them."

2. **The "Draft Reveal"**
   - **Moment:** Opening a generated Blog Post or Carousel.
   - **Success:** It looks *professional* and *on-brand* immediately (formatted, visual, cited). It shouldn't look like a generic "ChatGPT wall of text".

### Experience Principles

1. **Desktop Power, Not Mobile Compromise**
   - Optimize layouts for wide screens, data tables, and side-by-side views (Editor + Preview). Don't dumb it down for mobile constraints.

2. **One Click, Many Steps**
   - Hide complexity. One user click should trigger complex back-end orchestration (Research -> Write -> Format).

3. **Context Over Input**
   - Don't ask users to type what the system can find. Use APIs (Perplexity) to fetch context instead of asking users to paste it.
