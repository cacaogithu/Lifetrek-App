# AI Agents & RAG Architecture

This document defines the "Brain" of the Lifetrek application, detailing the logic, prompts, and data sources used by our AI Agents.

## 1. LinkedIn Carousel Agent
**Role**: Expert LinkedIn Content Strategist & Visual Designer.
**Model**: Gemini 1.5 Flash (Text) + Imagen 3 (Images).
**Runtime**: `worker-dispatcher` -> `generate-linkedin-carousel` (Supabase Edge Function).

### A. Logic Topology
1.  **Input Parsing**: Receives `Topic`, `Audience`, `Pain Point`.
2.  **Context Selection**: Selects "Company" (Authoritative) vs "Salesperson" (Personal) voice.
3.  **Text Generation**: Uses "Hormozi Framework" System Prompt to generate 5-7 slides + Caption.
4.  **Image Generation**: Uses "Medical Macro" System Prompt to generate background images via Vertex AI.
5.  **Assembly**: Combines Text + Images into a JSON payload for the frontend renderer.

### B. System Prompts (The "Brain")

#### Text Prompt (Hormozi Framework)
> You are an expert LinkedIn content strategist acting as a [ROLE]. You follow Alex Hormozi's $100M framework...
> **Core Principles**:
> 1. ONE core problem per carousel.
> 2. Hook = Callout + Implied Value.
> 3. Use proof early.
> 4. Low-friction CTA.

#### Image Prompt (Medical Abstract)
> You are a professional 3D artist for Lifetrek Medical.
> **Critical Rule**: DO NOT GENERATE TEXT.
> **Style**: Photorealistic, clean, sterile, depth of field.
> **Colors**: White, Light Grey, Corporate Blue (#004F8F).

### C. Knowledge Context (RAG Status)
| Context Type | Current Implementation | Future RAG Architecture |
| :--- | :--- | :--- |
| **Product Data** | Generic "Medical Device" knowledge | **Vector Search**: Query `products` table embeddings for specific machine specs (e.g. "5-Axis CNC capabilities"). |
| **Company Facts** | Hardcoded `contexts` dictionary | **Knowledge Base**: Retrieve from `company_facts` table (e.g. "ISO 13485 certified since 1995"). |
| **Tone/Voice** | Rule-based (Company vs Sales) | **Few-Shot Learning**: Inject examples of *previous successful posts* by that user. |

## 2. Lead Scoring Agent (Planned)
**Role**: Sales Operations Analyst.
**Runtime**: `rank_leads.py` (Python Worker).

### A. Logic
1.  **Scoring**: Weighted sum of `title_match`, `industry_match`, `company_size`.
2.  **Assignment**:
    *   **Marcio**: High-value Engineering/Quality leads.
    *   **Vanessa**: HR, Procurement, General leads.
3.  **Heatmap**: Assigns `tier` (1-3) based on score.

## 3. Future Architecture: The "Smart Context" Layer
To move from **Hardcoded Context** to **True RAG**, we will implement:

1.  **`embeddings` Table**: Stores vector representations of Products and Past Posts.
2.  **Context Injection Step**:
    *   Before calling Gemini, the Worker runs: `search_docs(topic)`.
    *   Appends: "RELEVANT FACTS: [Fact 1], [Fact 2]" to the System Prompt.
