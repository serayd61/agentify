# CLAUDE.md — Agentify.ch

This file is the primary reference for AI assistants working in this codebase. Read it fully before making changes.

---

## Project Overview

**Agentify.ch** is a Swiss SaaS platform providing industry-specific AI chat agents for Swiss SMEs (KMU). Customers browse a marketplace of pre-built agent templates (Treuhand, Handwerk, Gastronomie, etc.), subscribe via Stripe, and embed a chat widget on their own website.

The primary language of the UI and AI agents is **German (Swiss High German / de-CH)**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5, strict mode |
| Styling | Tailwind CSS v4 + custom design tokens |
| UI Components | Radix UI primitives + custom `src/components/ui/` |
| Animations | Framer Motion |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Payments | Stripe |
| AI Providers | Groq → OpenRouter → OpenAI (priority fallback) |
| Deployment | Vercel |
| Charts | Recharts |

---

## Development Commands

```bash
npm run dev          # Start development server on http://localhost:3000
npm run build        # Production build
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript type check (tsc --noEmit)
npm run test         # No tests configured yet (placeholder)
```

**Workflow CLI** (requires ts-node):
```bash
npm run workflow:run      # Run a workflow
npm run workflow:status   # Check workflow status
npm run workflow:history  # View workflow execution history
```

Always run `npm run lint` and `npm run type-check` before committing. The CI pipeline blocks merges to `main` if either fails.

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in all values:

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# AI (at least one required for live chat)
OPENAI_API_KEY=          # gpt-4o-mini
GROQ_API_KEY=            # llama-3.1-70b-versatile (preferred, fastest)
OPENROUTER_API_KEY=      # configurable model via OPENROUTER_MODEL
OPENROUTER_MODEL=        # defaults to gpt-4o-mini
GROQ_API_URL=            # defaults to https://api.groq.com/openai/v1/chat/completions

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_WIDGET_URL=
CRON_SECRET=
```

**Important:** When Supabase env vars are absent the app runs in development mode — a mock Supabase client is used and protected routes redirect to `/login?error=config`. This allows frontend work without a live Supabase project.

---

## Repository Structure

```
agentify/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── (auth)/                 # Auth group: login, register, forgot-password, reset-password
│   │   ├── api/                    # API routes (see API Routes section below)
│   │   ├── dashboard/              # Protected customer dashboard
│   │   │   ├── page.tsx            # Overview with BI metrics & charts
│   │   │   ├── agents/             # Agent CRUD + analytics
│   │   │   ├── leads/              # Lead management
│   │   │   ├── appointments/       # Appointment management
│   │   │   ├── billing/            # Stripe subscription management
│   │   │   ├── integrations/       # Integration settings
│   │   │   ├── workflows/          # Workflow management UI
│   │   │   └── settings/           # Account settings
│   │   ├── marketplace/            # Public agent marketplace
│   │   │   └── [slug]/             # Agent detail page
│   │   ├── demo/                   # Interactive demo (no auth required)
│   │   ├── pricing/                # Pricing page
│   │   ├── capabilities/           # Features/capabilities page
│   │   ├── contact/                # Contact form
│   │   ├── impressum/              # Swiss legal requirement
│   │   ├── privacy/                # Privacy policy
│   │   ├── terms/                  # Terms of service
│   │   ├── support/                # Support page
│   │   ├── layout.tsx              # Root layout (fonts, metadata, RootProvider)
│   │   ├── page.tsx                # Landing page
│   │   ├── not-found.tsx           # 404 page
│   │   └── globals.css             # Global styles
│   │
│   ├── components/
│   │   ├── ui/                     # Primitive UI components
│   │   │   ├── button.tsx          # Button variants via class-variance-authority
│   │   │   ├── card.tsx            # Card container
│   │   │   ├── toast.tsx           # Toast notification system
│   │   │   └── skeleton.tsx        # Loading skeleton
│   │   ├── layout/
│   │   │   ├── Header.tsx          # Fixed navigation header (client component)
│   │   │   └── Footer.tsx          # Site footer
│   │   ├── builder/
│   │   │   └── BuilderBot.tsx      # Conversational agent builder UI
│   │   ├── demo/
│   │   │   ├── DemoChat.tsx        # Demo chat interface
│   │   │   ├── AIChatWidget.tsx    # Chat widget component
│   │   │   └── AIAvatar.tsx        # AI avatar visual
│   │   ├── widget/
│   │   │   └── ChatWidget.tsx      # Embeddable chat widget (React)
│   │   ├── providers/
│   │   │   └── RootProvider.tsx    # App-level providers (ToastProvider)
│   │   ├── PurchaseButton.tsx      # Stripe checkout trigger
│   │   └── error-boundary.tsx      # React error boundary
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Browser Supabase client
│   │   │   ├── server.ts           # Server Supabase client + admin client (with mock fallback)
│   │   │   └── middleware.ts       # Supabase middleware helper
│   │   ├── stripe/
│   │   │   └── client.ts           # Stripe client + plan mapping
│   │   ├── auth/
│   │   │   └── actions.ts          # Auth server actions (signIn, signUp, signOut)
│   │   ├── workflows/
│   │   │   ├── types.ts            # All workflow TypeScript types
│   │   │   ├── orchestrator.ts     # WorkflowOrchestrator class (main engine)
│   │   │   ├── executor.ts         # TaskExecutor (shell, HTTP, JS tasks)
│   │   │   ├── scheduler.ts        # Cron/schedule-based triggers
│   │   │   ├── monitor.ts          # Workflow monitoring + alerts
│   │   │   └── index.ts            # Public workflow API
│   │   ├── data/
│   │   │   └── agents.ts           # Static data: AgentCategory[], AgentTemplate[]
│   │   ├── agent-prompts.ts        # generateSystemPrompt() — builds AI system prompts from AgentConfig
│   │   ├── conversation-memory.ts  # buildContextPrompt(), extractInfo() — NLP context extraction
│   │   ├── conversation-service.ts # startConversation(), addMessage() — DB persistence
│   │   ├── demo-scenarios.ts       # Fallback responses for demo mode (no AI key)
│   │   ├── form-validation.ts      # Form validation utilities
│   │   └── utils.ts                # cn() helper (clsx + tailwind-merge)
│   │
│   ├── middleware.ts               # Route protection (dashboard → login)
│   └── types/
│       └── index.ts                # Core TypeScript interfaces
│
├── supabase/
│   ├── migrations/
│   │   ├── 001_initial_schema.sql  # customers, subscriptions, agent_templates, customer_agents
│   │   └── 002_workflows_schema.sql # workflows, workflow_executions tables
│   ├── schema.sql                  # Combined schema reference
│   └── seed/
│       └── agent_templates.sql     # Seed data for marketplace agents
│
├── public/
│   ├── widget.js                   # Standalone embed widget script (vanilla JS)
│   ├── images/                     # Agent/hero images
│   └── videos/                     # Background/demo videos
│
├── scripts/
│   └── workflow-cli.ts             # CLI tool for workflow management
│
└── .github/
    └── workflows/
        └── ci.yml                  # CI/CD: lint → type-check → build → deploy
```

---

## API Routes

All routes live under `src/app/api/`:

| Route | Method | Purpose |
|---|---|---|
| `/api/chat` | POST | Main chat endpoint — routes to demo (sector) or agent chat (agentId) |
| `/api/chat` | GET | Health check — reports available AI providers |
| `/api/agent-builder` | POST | Conversational agent builder (creates agent via chat) |
| `/api/agents` | GET/POST | List/create customer agents |
| `/api/agents/[id]` | GET/PATCH/DELETE | Read/update/delete individual agent |
| `/api/agents/provision` | POST | Provision a new agent from a template |
| `/api/leads` | GET/POST | Lead management |
| `/api/appointments` | GET/POST | Appointment management |
| `/api/auth/callback` | GET | Supabase Auth OAuth/email callback |
| `/api/stripe/checkout` | POST | Create Stripe checkout session |
| `/api/stripe/portal` | POST | Create Stripe customer portal session |
| `/api/stripe/webhook` | POST | Handle Stripe webhook events |
| `/api/webhooks/stripe` | POST | Alternative Stripe webhook path |
| `/api/widget/[agentId]` | GET | Returns a self-contained JS widget script for the agent |
| `/api/workflows` | GET/POST | List/create workflows |
| `/api/workflows/[id]` | GET/PATCH/DELETE | Workflow CRUD |
| `/api/workflows/cron` | POST | Cron trigger endpoint (protected by CRON_SECRET) |
| `/api/workflows/health` | GET | Workflow system health |

---

## Database Schema (Supabase)

Core tables (from `supabase/migrations/001_initial_schema.sql`):

- **`customers`** — Platform users, linked 1:1 to `auth.users` via `auth_user_id`
- **`subscriptions`** — Stripe subscriptions; plans: `starter` / `business` / `enterprise`
- **`agent_templates`** — Marketplace catalog (static seed data, managed by admin)
- **`customer_agents`** — Provisioned agent instances; holds `custom_prompt`, `custom_knowledge`, `api_key`, `embed_code`
- **`conversations`** + **`messages`** — Chat history per agent
- **`leads`** — Visitor leads captured by agents
- **`appointments`** — Appointment bookings

Workflow tables (from `supabase/migrations/002_workflows_schema.sql`):
- **`workflows`** — WorkflowDefinition JSON + status
- **`workflow_executions`** — Execution history and results

Run migrations in order. Never modify existing migrations; add new ones instead.

---

## Authentication & Authorization

- Auth is handled via **Supabase Auth** (email/password + OAuth)
- Middleware (`src/middleware.ts`) protects these routes: `/dashboard`, `/account`, `/settings`
- Auth routes (`/login`, `/register`, `/forgot-password`) redirect authenticated users to `/dashboard`
- Server-side auth uses `createServerClient()` from `src/lib/supabase/server.ts`
- Browser-side auth uses `createClient()` from `src/lib/supabase/client.ts`
- `createAdminClient()` uses the `SUPABASE_SERVICE_ROLE_KEY` — only use in API routes, never expose to client

---

## AI Chat Architecture

The chat system (`src/app/api/chat/route.ts`) supports two modes:

**Demo mode** — triggered by `sector` field in request body:
- Uses hardcoded sector prompts (no DB lookup)
- Tries AI providers in order: Groq → OpenRouter → fallback static responses

**Agent mode** — triggered by `agentId` field:
1. Looks up agent config from Supabase (`agents` table)
2. Builds system prompt via `generateSystemPrompt()` (`src/lib/agent-prompts.ts`)
3. Extracts visitor context via `extractInfo()` (`src/lib/conversation-memory.ts`)
4. Calls AI provider (Groq → OpenRouter → OpenAI → fallback)
5. Persists conversation to DB via `src/lib/conversation-service.ts`

**AI provider priority** (configure at least one):
1. `GROQ_API_KEY` — Groq, model `llama-3.1-70b-versatile` (preferred: low latency)
2. `OPENROUTER_API_KEY` — OpenRouter, model set by `OPENROUTER_MODEL`
3. `OPENAI_API_KEY` — OpenAI, model `gpt-4o-mini`

If no provider is configured, the system returns keyword-matched fallback responses from `src/lib/demo-scenarios.ts`.

---

## Workflow Orchestration

The workflow engine (`src/lib/workflows/`) is a task orchestration system supporting:

- **Trigger types**: `manual`, `schedule` (cron), `webhook`, `file_change`
- **Task types**: `shell`, `http`, `javascript`, `conditional`, `parallel`, `loop`
- **Features**: dependency graphs, retry with exponential backoff, parallel execution, notifications

Key classes:
- `WorkflowOrchestrator` — main engine, builds dependency graph, executes tasks
- `TaskExecutor` — runs individual tasks (shell commands, HTTP requests, JS scripts)
- `WorkflowScheduler` — manages cron-based triggers
- `WorkflowMonitor` — tracks metrics, fires alerts

---

## Design System

The app uses a **dark theme** with Swiss-inspired branding.

**Key Tailwind color tokens** (defined in `tailwind.config.ts`):
```
surface      #05050a    (page background)
card         #12121c    (card background)
accent       #ff3b30    (Swiss red — primary CTA color)
accentStrong #c11b21    (darker red)
muted        #cbd5f5    (secondary text)
```

**Typography**: Geist Sans (body), Geist Mono (code), loaded via `next/font/google`

**Utilities**:
- Use `cn()` from `src/lib/utils.ts` for conditional class merging (wraps `clsx` + `tailwind-merge`)
- Animations: `framer-motion` for page/component transitions

**Component conventions**:
- `"use client"` at the top of any component using hooks, event handlers, or browser APIs
- Server Components are the default — avoid `"use client"` unless necessary
- UI primitives use Radix UI + `class-variance-authority` for variants
- Icons from `lucide-react`

---

## TypeScript Conventions

- **Path alias**: `@/*` → `./src/*` (configured in `tsconfig.json`)
- **Strict mode** is enabled — no implicit any, strict null checks
- All types are defined in `src/types/index.ts` (domain types) or co-located with their module
- Use `interface` for object shapes, `type` for unions/intersections
- Prefer explicit return types on public functions

---

## Routing Conventions

Next.js App Router conventions:
- `page.tsx` — page component (server component by default)
- `layout.tsx` — shared layout wrapper
- `route.ts` — API route handler
- `(auth)/` — route group (no URL segment)
- `[slug]/`, `[id]/`, `[agentId]/` — dynamic segments
- `metadata.ts` — metadata exports for SEO

---

## Supabase Client Usage

| Location | Import | Use case |
|---|---|---|
| Server Components / API Routes | `createServerClient()` from `@/lib/supabase/server` | Read/write with user session |
| API Routes (admin ops) | `createAdminClient()` from `@/lib/supabase/server` | Bypasses RLS, for webhooks/provisioning |
| Client Components | `createClient()` from `@/lib/supabase/client` | Browser-side auth/data |

The server client includes a mock fallback — if Supabase env vars are missing it returns empty data without throwing. This is intentional for local dev without Supabase.

---

## Stripe Integration

- Plans: `starter` (CHF 199/mo), `business` (CHF 399/mo), `enterprise` (CHF 899/mo)
- Checkout flow: `POST /api/stripe/checkout` → Stripe hosted page → webhook `checkout.session.completed`
- Webhook handler at `/api/stripe/webhook` — verifies signature, updates `subscriptions` table
- Customer portal: `POST /api/stripe/portal` — lets customers manage/cancel subscription

---

## Embed Widget

The embeddable widget has two implementations:

1. **`public/widget.js`** — Standalone vanilla JS, self-contained, injected by customers on their sites
2. **`/api/widget/[agentId]`** — Dynamically generated JS widget with agent-specific config (services, FAQ)

Widget embed snippet:
```html
<script src="https://cdn.agentify.ch/widget.js"
  data-agent-id="YOUR_AGENT_ID"
  data-position="bottom-right"
  data-color="#DC2626">
</script>
```

---

## CI/CD Pipeline

Defined in `.github/workflows/ci.yml`:

1. **Lint** (`npm run lint`) — runs in parallel with Type Check
2. **Type Check** (`npm run type-check`) — runs in parallel with Lint
3. **Build** (`npm run build`) — runs after both pass
4. **Deploy Preview** — on PRs, deploys to Vercel preview URL
5. **Deploy Production** — on push to `main`, deploys to Vercel production

Tests are disabled (`if: ${{ false }}`). When tests are added, enable the test job and update `npm run test`.

---

## Key Conventions & Gotchas

1. **German-first**: All user-facing text, AI prompts, and agent responses are in Swiss High German. Keep this consistent.

2. **No tests yet**: `npm run test` is a placeholder. Do not rely on tests; validate via lint + type-check + manual testing.

3. **Mock Supabase**: The server client gracefully falls back to a mock when env vars are absent. Don't rely on this in production.

4. **AI provider fallback chain**: If no AI key is set, chat returns static keyword-matched responses. This is by design for demo/dev environments.

5. **Widget API route**: `GET /api/widget/[agentId]` returns raw JavaScript (not JSON). The `Content-Type` is `application/javascript`.

6. **Stripe webhooks**: Two webhook paths exist (`/api/stripe/webhook` and `/api/webhooks/stripe`). Both handle the same events.

7. **Route params in Next.js 15+**: Dynamic route params are now async. Always use `await Promise.resolve(context.params)` pattern — see `src/app/api/widget/[agentId]/route.ts` as reference.

8. **Images unoptimized**: `next.config.ts` sets `images.unoptimized: true` for Vercel compatibility.

9. **Backup file**: `src/app/page.tsx.backup` exists as a reference — do not delete, do not import.

10. **`.cursorrules`**: Editor config file for Cursor IDE — leave intact.
