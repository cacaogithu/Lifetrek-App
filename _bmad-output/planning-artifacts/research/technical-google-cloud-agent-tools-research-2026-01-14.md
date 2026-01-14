---
stepsCompleted: ['step-01-init', 'step-02-technical-overview', 'step-03-integration-patterns', 'step-04-architectural-patterns', 'step-05-implementation-research']
inputDocuments: []
workflowType: 'research'
lastStep: 5
research_type: 'technical'
research_topic: 'Google Cloud ADK/SDK, Agent Frameworks, and File Search RAG'
research_goals: 'Evaluate Google Cloud ADK/SDK for agent evaluation/training, research Google File Search RAG, deep research tools, and compare Supabase pgvector vs Google ADK vector capabilities.'
user_name: 'Rafaelalmeida'
date: '2026-01-14'
web_research_enabled: true
source_verification: true
---

# Research Report: technical

**Date:** 2026-01-14
**Author:** Rafaelalmeida
**Research Type:** technical

---

## Research Overview

[Research overview and methodology will be appended here]

---

## Technical Research Scope Confirmation

**Research Topic:** Google Cloud ADK/SDK, Agent Frameworks, and File Search RAG
**Research Goals:** Evaluate Google Cloud ADK/SDK for agent evaluation/training, research Google File Search RAG, deep research tools, and compare Supabase pgvector vs Google ADK vector capabilities.

**Technical Research Scope:**

- Architecture Analysis - design patterns, frameworks, system architecture
- Implementation Approaches - development methodologies, coding patterns
- Technology Stack - languages, frameworks, tools, platforms
- Integration Patterns - APIs, protocols, interoperability
- Performance Considerations - scalability, optimization, patterns

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-01-14

## Technology Stack Analysis

### Programming Languages

The Google Cloud Agent ecosystem primarily favors a **Python-first** approach for its SDKs and advanced agent building tools.
_Popular Languages: **Python** (Google ADK, Vertex AI SDK), **TypeScript/Node.js** (supported but often secondary for data science/AI heavy lifting)._
_Emerging Languages: Python remains the de-facto standard for Agentic AI due to library support (LangChain, Pandas, NumPy)._
_Language Evolution: Google is pushing for "Code-First" agent definitions in Python to allow for better version control and testing compared to UI-based builders._
_Performance Characteristics: Python is optimal for the orchestration and evaluation logic, while high-performance vector operations are offloaded to C++/Go based operational layers (ScaNN)._
_Source: [Google Cloud Agent Builder SDK](https://cloud.google.com/dialogflow/cx/docs/concept/agent-builder-sdk), [Vertex AI SDK for Python](https://cloud.google.com/vertex-ai/docs/start/client-libraries)_

### Development Frameworks and Libraries

**Google Cloud Agent Development Kit (ADK)**
The ADK is a comprehensive framework designed for the "Build, Interact, Evaluate, Deploy" lifecycle.
_Key Features: Automated testing (Agent Evaluation), Tool Trajectory evaluation, and flexible integration with Vertex AI._
_Evaluation Capabilities: Built-in metrics for ROUGE, Semantic Similarity (LLM-judged), and Tool Call validation._
_Integration: Designed to work collaboratively with **LangChain**. You can build agents in LangChain and use Vertex AI for evaluation and deployment._
_Source: [Google ADK GitHub](https://github.com/GoogleCloudPlatform/google-cloud-agent-development-kit)_

**LangChain / LangGraph**
remains the dominant orchestration layer.
_Role: Google's tools often act as the "Model Provider" (Gemini) and "Tool Provider" (Search, RAG) within a LangChain/LangGraph application structure._

### Database and Storage Technologies

A critical comparison for your architecture is **Supabase pgvector vs. Google Cloud Vector Search**.

**Supabase pgvector (PostgreSQL extension)**
_Best For:** **Integrated Application Data.** Ideal for "Brand Assets" and "User Content" where you need to join vectors with relation data (e.g., "Find successful carousels *for this specific user*")._
_Pros: Unified stack, lower cost for moderate scale (millions of vectors), familiar SQL interface, easy metadata filtering._
_Cons: Requires manual tuning for massive scale (billions)._
_Source: [Supabase pgvector Docs](https://supabase.com/docs/guides/database/extensions/pgvector)_

**Google Cloud Vector Search (Vertex AI)**
_Best For:** **Massive Scale / External Knowledge.** Ideal for "Deep Research" on the entire web or massive document corpuses (millions/billions of docs)._
_Pros: Fully managed, scales to billions, low latency, deep integration with Vertex AI models._
_Cons: Separate service from your transaction DB, higher starting complexity/cost._
_Source: [Google Cloud Vector Search](https://cloud.google.com/vertex-ai/docs/vector-search/overview)_

### Development Tools and Platforms

**Google Vertex AI Agent Builder**
_Function: A low-code/pro-code hybrid platform to build and deploy agents._
_RAG Capability: **"File Search"** (Vertex AI Search) allows "out-of-the-box" RAG. You upload PDFs/HTML to a GCS bucket, and it handles chunking, embedding, and retrieval automatically._
_Deep Research: Specialized "Deep Search" blueprints and **NotebookLM** tools available for synthesizing complex information._
_Source: [Vertex AI Agent Builder](https://cloud.google.com/generative-ai-app-builder/docs)_

### Cloud Infrastructure and Deployment

_Hybrid Approach: The architecture suggests a hybrid model._
- **Supabase (AWS based)**: Hosts the application state, user data, and *Brand Memory* (pgvector).
- **Google Cloud (Vertex AI)**: Hosts the *Intelligence Layer* (Gemini models), *Deep Research* capabilities, and specialized *Agent Evaluation* pipelines.
- **Integration**: Linked via Edge Functions (TypeScript) and Python Scripts (Google ADK) running in a containerized environment (e.g., Cloud Run or Modal).

## Integration Patterns Analysis

### API Design Patterns

**LangChain <> Google Vertex AI**
The integration pattern relies on delegating the "Intelligence" to Google via SDK while keeping "State" in Supabase/LangGraph.
_Pattern:_ **Tool Calling via Reasoning Engine**. You define tools (Python functions) and deploy them to Vertex AI Reasoning Engine.
_LangChain Integration:_ Use `LangchainAgent` from Vertex SDK, passing the model (Gemini 1.5) and tools list. The SDK handles the API handshake.
_Source: [Google Vertex AI Integration Guide](https://cloud.google.com/vertex-ai/docs)_

### Communication Protocols

**Supabase Storage -> Vector Store Integration**
This is a critical Event-Driven Pattern for "Learning" from Brand Assets.
1. **Event Source**: File Upload to Supabase Storage Bucket.
2. **Trigger**: Database Webhook on the `storage.objects` table (or a custom metadata table).
3. **Processor**: Supabase Edge Function (TypeScript).
4. **Action**: Function reads file, generates embedding (via `gte-small` or external API), and writes to `pgvector` table.
_Protocol:_ HTTPS Webhooks -> Edge Function Execution -> Database Connection (Postgres Protocol).
_Source: [Supabase Vector Webhooks](https://supabase.com/docs/guides/database/webhooks)_

### System Interoperability Approaches

**Authentication & Security**
_Service Agent Auth:_ To let Google Vertex Agents access Supabase Data, use **Google Secret Manager** to store Supabase Database Credentials.
_Access Pattern:_ The Vertex AI Service Agent (IAM Service Account) requests the secret, then uses standard `psycopg2` lib (in Python) to connect to Supabase Postgres.
_Identity:_ **Do NOT** embed keys in code. Use the Service Account identity for GCP-internal auth, and Secrets for external (Supabase) auth.
_Source: [Google Cloud Secret Manager Docs](https://cloud.google.com/secret-manager/docs)_

### Microservices Integration Patterns

**Hybrid Runtime Handshake**
Since we have TypeScript (Next.js/Edge) and Python (ADK/Agents), the integration pattern is **API-First**.
_Pattern:_ **Cloud Run / Fast API**. Build the Python Agents as a service (using FastAPI or ADK's deployment features) exposed via HTTPS.
_Client:_ The Next.js App calls these endpoints for long-running jobs (Blog Generation), effectively treating the Python Agent as a specialized Microservice.

### Integration Security Patterns

_Secure File Search (RAG):_
When using "Google File Search" (Vertex AI Search), data is stored in GCS.
_Security:_ Use **VPC Service Controls** if strict data exfiltration protection is needed, but standard IAM (Bucket permissions) is sufficient for MVP.
_Source: [Google Cloud VPC Service Controls](https://cloud.google.com/vpc-service-controls/docs)_

### Implementation: Installation & Setup

**Google ADK Installation**
To prepare the environment for Python Agents:
`pip install google-cloud-aiplatform[agent_builder] langchain-google-vertexai`
_Prerequisites:_ Google Cloud Project with Billing, Vertex AI API enabled.
_Source: [PyPI google-cloud-aiplatform](https://pypi.org/project/google-cloud-aiplatform/)_

## Architectural Patterns and Design

### System Architecture Patterns

**Hybrid Microservices (Python + TypeScript)**
_Pattern:_ **Decoupled Intelligence Layer**.
- **Application Layer (TypeScript/Next.js):** Handles UI, User Auth, Fast Interactions, CRUD.
- **Intelligence Layer (Python/Cloud Run):** Handles Long-running jobs, RAG, Deep Research, LangGraph interactions.
_Trade-off:_ Increased deployment complexity (two services) vs. Best-in-class tooling for each domain (Next.js for Web, Python for AI).
_Source: [Google Cloud Architecture Center - Microservices](https://cloud.google.com/architecture/microservices-architecture-on-google-cloud)_

### Design Principles and Best Practices

**State Management: "Single Source of Truth"**
_Decision:_ Use **Supabase (Postgres)** for ALL conversation history and application state.
_Rationale:_ While Firestore has native LangChain history classes, splitting state between Postgres (User Data) and Firestore (Chat Data) creates data silos and hampers analytics.
_Best Practice:_ Build or use a specific adapter to store LangChain history in Supabase to maintain a monolithic data structure.
_Source: [Supabase Architecture Guides](https://supabase.com/docs/guides/architecture)_

### Scalability and Performance Patterns

**Compute Scaling: Scale-to-Zero**
_Pattern:_ **Cloud Run for Agents**.
_Rationale:_ AI Agents are "intermittent" workloads. They are not always running. Cloud Run scales to zero when idle (cost = $0), whereas Vertex AI Endpoints are "Always On" (cost = $$$).
_Performance:_ Cloud Run scales up rapidly for incoming requests.
_Source: [Cloud Run vs Vertex AI Pricing](https://cloud.google.com/run/pricing)_

### Integration and Communication Patterns

**Async Job Orchestration**
_Pattern:_ **Task Queue / Webhook pattern**.
1. app inserts `job` into Supabase `jobs` table (Pending).
2. Database Webhook triggers Cloud Run Python Service.
3. Python Service performs work (Deep Research, etc).
4. Python Service calls back to Supabase to update `jobs` table (Completed) + results.
_Benefit:_ Decouples the slow AI work from the fast UI, prevents timeout errors (since Webhooks are fire-and-forget or async).

### Security Architecture Patterns

**Identity-Based Access**
_Pattern:_ **Workload Identity Federation**.
- Cloud Run service runs as a specific Google Service Account.
- This Service Account has permission to access Secrets (Supabase keys) and Vertex AI models.
- No interaction with user credentials for infrastructure tasks.
_Source: [Google Cloud IAM Documentation](https://cloud.google.com/iam/docs/workload-identity-federation)_

## Implementation Approaches and Technology Adoption

### Technology Adoption Strategies

**Hybrid Monorepo Adoption**
_Strategy:_ **Polyglot Monorepo (Turborepo)**.
- **Structure**: Create a `services/agent-backend` folder alongside `apps/web`.
- **Tooling**: Use Turborepo generic tasks to map `npm run python-dev` to `uvicorn main:app --reload`.
- **Migration**: Start by adding the Python service as a "sidecar" for RAG tasks, keeping simple agents in Edge Functions until complexity demands migration.
_Source: [Turborepo Polyglot Guides](https://turbo.build/repo/docs/handbook/tools/python)_

### Development Workflows and Tooling

**Local Development: Concurrent Execution**
_Workflow:_ Use `concurrently` in root `package.json`.
- `dev`: `concurrently "npm run dev:web" "npm run dev:python"`
- **Shared Env**: Use a single `.env` file or Docker Compose to share `SUPABASE_URL` and `GOOGLE_PROJECT_ID` between Next.js and Python.
_Best Practice:_ Next.js uses `rewrites` in `next.config.js` to proxy `/api/agent/*` to `http://127.0.0.1:8000`, solving CORS issues locally.
_Source: [FastAPI + Next.js Local Dev Patterns](https://fastapi.tiangolo.com/)_

### Testing and Quality Assurance

**Agent Evaluation Pipeline**
_Tooling:_ **Vertex AI ADK Evaluation**.
- **Metrics**: Implement "Rubric-based metrics" (e.g. Groundedness, Safety) for every Pull Request.
- **CI/CD**: On PR, run a sample set of "Golden Prompts" against the Python Agent.
- **Gate**: Fail the build if average Groundedness score < 4.0.
_Source: [Vertex AI Evaluation Service](https://cloud.google.com/vertex-ai/docs/generative-ai/models/evaluation-overview)_

### Deployment and Operations Practices

**Containerization Strategy**
_Practice:_ **Multi-Stage Docker Builds**.
- **Stage 1 (Builder)**: Install build tools, compile Python dependencies.
- **Stage 2 (Runner)**: Use `python:3.11-slim` or distroless. Copy only `site-packages`.
- **Optimization**: Set `PYTHONUNBUFFERED=1` for immediate Cloud Run logging.
- **Command**: `gunicorn -k uvicorn.workers.UvicornWorker main:app` for production concurrency.
_Source: [Google Cloud Run Python Best Practices](https://cloud.google.com/run/docs/quickstarts/build-and-deploy/deploy-python-service)_

### Team Organization and Skills

**Skill Requirements**
- **Existing**: TypeScript/Next.js (Strong).
- **New**: Python/FastAPI (Intermediate), LangChain (Intermediate), Google Cloud IAM (Basic).
- **Bridge**: The Hybrid Architecture allows the Frontend team to focus on UI while the "AI Engineer" focuses solely on the Python Service, with clear API contracts.

### Cost Optimization and Resource Management

**Cost Control**
_Strategy:_ **Scale-to-Zero + Request Timeouts**.
- **Idle**: $0 cost when no one is generating content.
- **Active**: Resources scale up only during the ~30s generation window.
- **Limits**: Set strict timeouts and Max Instances on Cloud Run to prevent runaway loops.
_Source: [Cloud Run Pricing](https://cloud.google.com/run/pricing)_

## Technical Research Recommendations

### Implementation Roadmap

1.  **Phase 1 (Foundation)**: Set up `apps/agent-service` in Monorepo. Configure Dockerfile and Cloud Build. Deploy "Hello World" to Cloud Run.
2.  **Phase 2 (Connection)**: Implement Supabase Webhook -> Cloud Run connection. Prove E2E flow (Upload -> Embed -> PGVector).
3.  **Phase 3 (Intelligence)**: Implement LangChain Agent in Python. Connect to Vertex AI Gemini. Implement "Deep Research" tool.
4.  **Phase 4 (Evaluation)**: Add Evaluation pipeline with Golden Datasets.

### Technology Stack Recommendations

- **Frontend**: Next.js (Existing)
- **Backend**: Python FastAPI (New Service)
- **Orchestration**: LangGraph (Python)
- **AI Models**: Google Gemini 1.5 Pro (via Vertex AI)
- **Vector Store**: Supabase pgvector
- **Deployment**: Google Cloud Run
- **Evaluation**: Vertex AI ADK

### Success Metrics and KPIs

- **System Latency**: < 200ms for API handshake (async job start).
- **Reliability**: 99.9% success rate for background jobs (no timeouts).
- **Quality**: > 4/5 score on "Groundedness" evaluation metric.
- **Dev Velocity**: < 5min to deploy new Agent version.
