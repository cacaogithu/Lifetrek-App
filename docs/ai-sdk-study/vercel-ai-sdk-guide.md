# Vercel AI SDK Integration Study

## Overview
The Vercel AI SDK (`ai`) is a library for building AI-powered user interfaces. It simplifies the process of sending messages to an AI provider (like Google Gemini or OpenAI) and **streaming** the response back to the client in real-time.

## Key Components

### 1. The "Core" (`ai`)
- **`streamText`**: The main function to call an LLM and get a streamable response.
- **`AIStream`**: Handling the stream on the client side (handled by hook).

### 2. The Provider (`@ai-sdk/google`)
- Connects the standard AI SDK to Google's specific API format.
- We normally use this in Node.js environments.
- **Challenge**: Supabase Edge Functions run on **Deno**. The standard Node packages might need polyfills or importing via `esm.sh`.

### 3. The UI (`ai-elements` / `useChat`)
- **`useChat`**: A React hook that handles:
    - Message state (user input, conversation history).
    - Submitting the request.
    - Updating the UI as chunks of text arrive (streaming).
- **`ai-elements`**: Pre-built UI components (like `<Message />`) that look good and handle the data types from `useChat`.

## Implementation Strategy for Supabase (Deno)

Since Supabase Edge Functions use Deno, we cannot just `npm install` standard Node packages easily inside the edge function itself (unless using the new npm specifiers).

**Recommended Approach:**
1.  **Backend**: Use standard `fetch` with streaming or use a Deno-compatible build of the SDK from `esm.sh`.
2.  **Frontend**: Use standard `useChat` from `ai` package (installed via npm/bun).

## Files in this Study
1.  `demo-edge-function.ts`: How to write the backend in Supabase/Deno.
2.  `demo-chat-component.tsx`: How to write the frontend in React.
