# LinkedIn Automation System Manual

## Goal

Generate high-quality, on-brand LinkedIn carousel posts using AI to create engaging B2B content for Lifetrek Medical's social media strategy.

## Inputs

**Required:**
- `topic`: Content topic or theme (e.g., "Spinal Screw Machining")
- `targetAudience`: Target audience (e.g., "Manufacturing Engineers")

**Optional:**
- `painPoint`: Customer pain point to address
- `desiredOutcome`: Desired customer outcome
- `mode`: "plan" or "generate" (default: "generate")

## Architecture: Multi-Agent System

The system uses a **Multi-Agent Architecture** orchestrated by the Edge Function:

1.  **Orchestrator (Edge Function)**
    *   **Role**: The runtime logic (`index.ts`) that manages the workflow, state, and data passing between agents.
    *   **Responsibility**: Calls the LLMs, handles the "Plan vs Generate" routing, and manages the Critique Loop.
2.  **Strategist (The Manager)**
    *   **Role**: Analyzes the request and determines the "Angle" and "Text Placement".
    *   **Logic**: Decides if the visual should be "Clean" (abstract background) or "Burned-In" (billboard style text integration).
2.  **Copywriter (The Writer)**
    *   **Role**: Drafts the content (Hooks, Body, CTA) following the *Killer Hooks Playbook*.
    *   **Focus**: Ensuring specific technical details and low-friction CTAs.
3.  **Designer (The Artist)**
    *   **Role**: Generates the visual concepts and image prompts.
    *   **Logic**: Executes the Strategist's "Clean" vs "Burned-In" vision using Gemini 2.0 Pro.
4.  **Brand Analyst (The Quality Control)**
    *   **Role**: Runs a "Critique Loop" after the initial draft is generated.
    *   **Logic**: Reviews against the Brand Book. If the hook is weak or proof is generic, it *rewrites* the content before sending it to the user.

## Process Flow

### 1. Plan Mode (Strategy Selection)
1.  User provides a **generic theme**.
2.  **Strategist Agent** generates **3 strategic angles**.
3.  User selects the preferred angle.

### 2. Generate Mode (Content Creation)
1.  **Strategist**: Sets the direction (Text Placement: Clean vs Burned-In).
2.  **Copywriter**: Generates the initial carousel draft.
3.  **Brand Analyst**: Critiques the draft.
    *   *Check*: Is the hook strong? Is the proof specific (e.g. "Citizen M32" vs "Machine")?
    *   *Action*: Refines and rewrites logically.
4.  **Designer**: Generates image prompts based on the refined text.
5.  **Image Generation**: Paralllel processing of all slides.
6.  **Frontend**: Renders the final result.

### 3. Text Placement Modes
*   **Clean Mode**: Minimalist, abstract backgrounds. Text is overlaid by the web app code. Best for detailed content slides.
*   **Burned-In Mode**: "Billboard Style". The headline text is rendered *inside* the image pixel data by the AI. Best for high-impact Hooks.

## Troubleshooting

### API Limits
- **Perplexity/Gemini**: Has rate limits. If it fails, wait and try again.
- **Timeouts**: Generation can take 15-30 seconds due to the critique loop.

### Content Quality
- **Too Generic**: The Brand Analyst usually catches this, but try adding specific machine names in input.
- **Off-Brand**: Ensure `docs/brand/BRAND_BOOK.md` is current.

### Common Errors
- **401 Unauthorized**: Check if you are logged in or if API keys are valid.
- **500 Internal Server Error**: Check function logs on Supabase dashboard.

## Development & Testing

**Local Development:**
```bash
supabase functions serve generate-linkedin-carousel
```
