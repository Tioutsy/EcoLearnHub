# EcoLearn Mauritius

A professional B2B e-learning platform for environmental training, waste sorting, recycling, and ESG compliance in Mauritius. Companies train employees remotely and generate audit-ready ESG reports.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/ecolearn run dev` — run the frontend (port 24777)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL`, `CLERK_SECRET_KEY`, `CLERK_PUBLISHABLE_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite + Tailwind CSS v4 + shadcn/ui + wouter + Framer Motion + Recharts
- API: Express 5
- Auth: Clerk (Replit-managed)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — source of truth for all API contracts
- `lib/db/src/schema/` — Drizzle schema (categories, courses, companies, employees, plans, enrollments, quizzes, certificates, impact/badges, blog)
- `artifacts/api-server/src/routes/` — Express route handlers (courses, categories, enrollments, quizzes, certificates, companies, plans, dashboard, impact, blog)
- `artifacts/ecolearn/src/` — React frontend (pages, components)

## Architecture decisions

- OpenAPI-first: all API contracts defined in YAML, hooks generated via Orval into `@workspace/api-client-react`
- Clerk proxy: Clerk API calls are proxied through the Express backend via `/clerk` path (see `clerkProxyMiddleware.ts`)
- Environmental impact metrics are computed server-side from training completion data using industry benchmarks (not stored as separate records)
- Monthly trend data is computed dynamically (suitable for seeded demo data; can be replaced with real DB aggregates)
- Stripe integration is scaffolded (checkout/portal endpoints exist) but payment credentials are not yet connected — add Stripe integration via the monetization skill

## Product

- **Homepage**: Hero, stats, featured courses, testimonials, blog preview, pricing CTA
- **Course Marketplace**: 10+ courses across 11 sustainability categories with search/filter
- **Course Player**: Lesson-by-lesson player with progress tracking and resume
- **Quiz System**: Per-course quizzes with automatic certificate issuance on 70%+ pass
- **Certificate System**: Unique codes, QR verification at `/certificates/verify/:code`
- **LMS Dashboard**: Employee progress tracking, enrollment management
- **HR Dashboard**: Company-level training stats, employee table, completion rates
- **Environmental Impact Dashboard**: CO2 avoided, waste diverted, recycling rates, Recharts visualizations, department breakdowns, sustainability badges
- **Pricing Page**: Starter/Business/Corporate/Enterprise plans with monthly/annual billing toggle
- **Blog**: 5 sustainability articles seeded with real Mauritius context
- **Admin Panel**: Course and company management (admin role)

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- After any OpenAPI spec change, always run `pnpm --filter @workspace/api-spec run codegen` before using updated types
- Clerk dev keys are normal during development — switch to live keys when deploying
- Environmental impact numbers are benchmarked estimates, not real measurements — make this clear in the UI if needed
- To add Stripe payments: read the `monetization` skill then the `stripe` skill
