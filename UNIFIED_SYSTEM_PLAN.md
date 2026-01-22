# Unified Multi-Agent LinkedIn System ExecPlan

This ExecPlan is a living document. The sections `Progress`, `Surprises & Discoveries`, `Decision Log`, and `Outcomes & Retrospective` must be kept up to date as work proceeds.
This document is maintained in accordance with `PLANS.md`.

## Purpose / Big Picture

The goal is to transform the current fragmented agent workflows into a **Unified Multi-Agent System** for B2B content creation (LinkedIn & Instagram).
Users will interact with a single "Room" where they can summon agents (Orchestrator, Strategist, Copywriter, Designer) who collaborate using a **Shared Tool Bus**.
Crucially, the system will include a **Manual Canva-Style Editor** (built with `react-konva`) to allow human refinement of agent-generated visuals.
The entire pipeline will be robust, verified by automated tests, and scalable.

**User-Visible Behavior:**
1.  **Unified Chat**: A single interface where the user talks to the Orchestrator, who delegates to other agents.
2.  **Tool Bus**: Agents can autonomously trigger tools like "Generate Carousel", "Find Asset", "Reimage", and "Transfer to Editor".
3.  **Visual Editor**: A "Canvas" tab where the user can manually edit carousels/images with layers, text, and shapes, just like Canva.
4.  **Multi-Platform**: Support for LinkedIn and Instagram formats.

## Progress

- [ ] **M1: Foundation & Unified Chat Interface**
    - [ ] Create `UnifiedAgentChat` component.
    - [ ] Define `Agent` and `Tool` interfaces.
    - [ ] Implement `OrchestratorAgent` logic (frontend-side dispatch or Edge Function update).
- [ ] **M2: Shared Tool Bus Integration**
    - [ ] Refactor `repurpose-content` and `generate-linkedin-carousel` into callable tools.
    - [ ] Implement `AssetSearchTool` (Supabase generic search).
    - [ ] Connect agents to the Tool Bus.
- [ ] **M3: Canva-Style Editor (React-Konva)**
    - [ ] Install `konva`, `react-konva`, `use-image`.
    - [ ] Create `CanvasEditor` component.
    - [ ] Implement basic layers (Text, Image, Rect).
    - [ ] Implement "Load from Carousel" (import generated JSON to Canvas).
- [ ] **M4: Content Generation & Instagram Support**
    - [ ] Add Instagram format support to Carousel Generator.
    - [ ] Ensure `reimage` tool works for both.
- [ ] **M5: Testing & Reliability**
    - [ ] Add E2E tests for the full flow (Chat -> Gen -> Edit).
    - [ ] Add unit tests for the Tool Bus logic.

## Context and Orientation

**Current State**:
- **Agents**: Scattered across `ContentOrchestrator.tsx`, `AgentChat.tsx`, and backend functions (`chat`, `agent-chat`).
- **Generator**: `LinkedInCarousel.tsx` is a separate standalone tool.
- **Storage**: Images are in Supabase Storage.
- **Tech Stack**: React, Vite, Supabase, Tailwind.

**Key Files**:
- `src/pages/Admin/ContentOrchestrator.tsx`: Current entry point for Orchestrator.
- `src/components/agents/AgentChat.tsx`: Generic chat component.
- `supabase/functions/chat/index.ts`: Backend logic for Orchestrator.
- `src/components/LinkedInCarousel.tsx`: The carousel generator UI.

## Plan of Work

### Phase 1: Unified Chat Architecture (Supabase Native)

1.  **Refactor Backend (Cost Optimization)**:
    *   **Goal**: Move from `apps/agent-service` (Cloud Run) to `supabase/functions/` (Python Beta).
    *   **Action**: Create new functions `orchestrator-py`, `strategist-py`.
    *   **Adapter**: Use `FastAPI` adapter for Supabase if supported, or standard Handler.

2.  **Create `src/components/unified-chat/`**:
    *   `UnifiedChat.tsx`: The main container.
    *   `AgentStream.tsx`: Renders the conversation stream.
    *   `AgentMessage.tsx`: Individual message bubble with "Thinking" states.

3.  **Refactor Agents**:
    *   Define `AgentRole` enum: `ORCHESTRATOR`, `STRATEGIST`, `COPYWRITER`, `DESIGNER`.
    *   Centralize agent prompts/configs in `src/lib/agents/registry.ts`.


### Phase 2: Manual Canva-Style Editor

1.  **Dependencies**:
    *   `npm install konva react-konva use-image`

2.  **Create `src/components/editor/`**:
    *   `CanvasEditor.tsx`: Main wrapper.
    *   `CanvasLayer.tsx`: Individual layer component.
    *   `Toolbar.tsx`: Controls for colors, fonts, etc.

3.  **Integration**:
    *   Add "Edit in Studio" button to generated carousels.
    *   Function to convert Carousel JSON -> Konva Stage JSON.

### Phase 3: Testing

1.  **Playwright**:
    *   Create `tests/e2e/unified-flow.spec.ts`.
    *   Test: User asks for post -> API responds -> Editor opens -> Export works.

## Validation and Acceptance

1.  **Unified Chat**: User sends "Create a post about AI". Orchestrator replies, calls Strategist (visible in UI or logs), and produces a specific plan.
2.  **Editor**: User clicks "Edit", drags a text box, changes color, updates text.
3.  **Export**: User clicks "Export", gets a PNG/PDF.

## Decision Log

- Decision: Use `react-konva` for the editor.
  Rationale: High performance, React integration, good support for "Canva-like" features (layers, transformers).
  Date: 2026-01-22

- Decision: Client-side orchestration for "Tool Bus" initially.
  Rationale: Easier to prototype and debug. We can move to server-side (LangGraph or similar) later if complex.
