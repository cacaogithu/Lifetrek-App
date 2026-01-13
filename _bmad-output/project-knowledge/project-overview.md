# Project Overview: Lifetrek-App

## Executive Summary
Lifetrek-App is a precision manufacturing application for Lifetrek Medical, designed to showcase high-quality medical and dental components. It serves as both a public-facing website and an internal operational tool, integrating CRM, lead scoring, and content automation features. The project follows a Monolith structure combining a modern React frontend with Supabase Edge Functions for backend logic.

## Project Classification
- **Repository Type:** Monolith (Single cohesive repository)
- **Architecture:** Client-Server (SPA + Serverless Backend)
- **Primary Parts:**
    - **Frontend:** React application (Vite)
    - **Backend:** Supabase Edge Functions (Deno)

## Technology Stack

| Category | Technology | Version | Usage |
|----------|------------|---------|-------|
| **Frontend** | React | 18.x | UI Library |
| **Build Tool** | Vite | 5.x | Development & Build |
| **Language** | TypeScript | 5.x | Type Safety |
| **Styling** | Tailwind CSS | 3.x | Utility-first styling |
| **UI Library** | Shadcn UI | (latest) | Accessible components |
| **State** | React Query | 5.x | Server state management |
| **Backend** | Supabase | (Cloud) | Auth, DB, Edge Functions |
| **Functions** | Deno | (latest) | Edge runtime |

## Architecture Overview
The application uses a **Component-Based Architecture** on the frontend, leveraging Shadcn UI and atomic design principles. The backend follows a **Serverless/Function-as-a-Service (FaaS)** pattern using Supabase Edge Functions for business logic, integrations (OpenAI, Unipile, LinkedIn), and data processing.

### Key Features
- **Public Website:** Showcase of medical manufacturing capabilities.
- **Admin Dashboard:** CRM, Lead Management, Content Automation.
- **Lead Calculator:** ROI and lead scoring logic.
- **AI Integrations:** Text generation, image enhancement, and analysis.

## Detailed Documentation
- [Source Tree Analysis](./source-tree-analysis.md)
- [Component Inventory](./component-inventory.md)
- [API Contracts](./api-contracts.md) (Edge Functions)
- [Development Guide](./development-guide.md)
