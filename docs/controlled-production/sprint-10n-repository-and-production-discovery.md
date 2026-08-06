# Repository & Production Discovery Document (Sprint 10N)

## Executive Summary
This document records the repository and production environment discovery conducted for **Sprint 10N — First Controlled Production Company Onboarding, Live Learner Activation, Post-Launch Monitoring & Operational Acceptance**.

---

## 1. Verified Architecture & Production Source of Truth

- **Frontend Application**: Vite + React SPA (`artifacts/ecolearn`).
- **Backend API Application**: Node.js + Express (`artifacts/api-server`).
- **Database Provider**: PostgreSQL (Drizzle ORM).
- **Authentication**: Clerk (`@clerk/express`, `@clerk/react`).
- **Health & Readiness**: `/healthz`, `/health`, `/ready`.
- **Production Status**: Zero localhost or mock dependencies in core mutation flows.
