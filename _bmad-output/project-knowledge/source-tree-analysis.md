# Source Tree Analysis

## Directory Structure

```
Lifetrek-App/
├── src/                          # Frontend Application Source
│   ├── components/               # UI Components
│   │   ├── admin/                # Admin-specific components
│   │   ├── calculator/           # Lead calculator components
│   │   ├── ui/                   # Shadcn/Radix UI primitives
│   │   ├── 3d/                   # Three.js/React-Three-Fiber scenes
│   │   └── [Domain].tsx          # Feature components (Header, Footer, etc.)
│   ├── pages/                    # Route endpoints (React Router)
│   ├── integrations/             # External service wrappers (Supabase)
│   ├── hooks/                    # Custom React hooks
│   ├── contexts/                 # React Context providers
│   ├── assets/                   # Static assets (images, fonts)
│   └── App.tsx                   # Main application entry point
│
├── supabase/                     # Backend & Database Configuration
│   ├── functions/                # Edge Functions (API Layer)
│   │   ├── send-contact-email/   # Email notification service
│   │   ├── chat/                 # AI Chat interface
│   │   ├── generate-linkedin-carousel/ # Social media automation
│   │   └── ...                   # Other utility functions
│   ├── migrations/               # Database schema changes
│   └── config.toml               # Supabase local config
│
├── docs/                         # Project Documentation
│   ├── ONBOARDING.md             # New hire guide
│   └── [Workflow Docs]           # Process documentation
│
├── public/                       # Static public files (favicon, robots.txt)
├── BRAND_BOOK.md                 # Design System Source of Truth
└── package.json                  # Frontend dependencies
```

## Critical Directories

### `src/components/`
The core UI library. Separated into:
- **`ui/`**: Low-level, reusable atoms (Buttons, Inputs) following Shadcn patterns.
- **`admin/`**: High-level organisms for the secure dashboard.
- **`3d/`**: Specialized components for 3D visualizations.

### `src/pages/`
Defines the application routes. Each file generally corresponds to a route definition in `App.tsx`.

### `supabase/functions/`
Acts as the API gateway. Each directory represents a standalone Deno-based function deployed to Supabase Edge network. These handle sensitive operations, third-party API calls (OpenAI, Resend), and complex logic.

### `src/integrations/`
Contains the generated types and clients for Supabase, ensuring type-safe database interactions across the frontend.

## Entry Points
- **Frontend**: `src/main.tsx` (Bootstraps React) -> `src/App.tsx` (Router).
- **Backend**: Each `index.ts` within `supabase/functions/[function-name]/` serves as an entry point for that specific API endpoint.
