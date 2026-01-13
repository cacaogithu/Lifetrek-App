# Development Guide

## Prerequisites
- **Node.js**: v18+ (Required for Vite and Supabase CLI)
- **Supabase CLI**: Recommended for local function development.
- **Git**: Version control.

## Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install
```

## Local Development

### Frontend
Start the Vite development server:
```bash
npm run dev
```
Access at `http://localhost:8080` (or similar).

### Backend (Supabase)
To run functions locally (requires Docker):
```bash
supabase start
supabase functions serve
```

## Build & Deploy

### Frontend Build
```bash
npm run build
```
Builds the app to `dist/`.

### Deployment
- **Frontend**: Deploys to Vercel/Netlify/Lovable Platform (auto-deploy on push).
- **Backend**: Deploy functions via CLI:
  ```bash
  supabase functions deploy [function-name]
  ```

## Working with AI Features
- Ensure required API keys (OpenAI, etc.) are set in your Supabase Dashboard or `.env` for local development.
- Check `supabase/config.toml` for function configurations.
