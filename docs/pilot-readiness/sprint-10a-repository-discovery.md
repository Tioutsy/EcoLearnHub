# Sprint 10A — Repository & Workflow Discovery Document

## Executive Summary
This document records the mandatory repository discovery conducted prior to execution of **Sprint 10A — External Pilot Readiness, End-to-End Workflow Validation & Release Evidence Pack**.

---

## 1. Monorepo Architecture & Environment

- **Package Manager & Workspaces**: `pnpm` (v9.15.2) managing 9 workspace projects:
  - `artifacts/api-server` — Express 5 REST API & authentication middleware (`@workspace/api-server`)
  - `artifacts/ecolearn` — Vite + React 19 + Wouter frontend SPA (`@workspace/ecolearn`)
  - `artifacts/mockup-sandbox` — UI sandbox components
  - `lib/db` — Drizzle ORM schema & PostgreSQL client (`@workspace/db`)
  - `lib/api-zod` — Shared Zod validation schemas (`@workspace/api-zod`)
  - `lib/api-client-react` — Generated TanStack React Query hooks (`@workspace/api-client-react`)
  - `scripts` — Internal diagnostic and maintenance CLI tools
- **Node Environment**: Node.js v24.14.0 / v20.20.2 with native `node --test` runner.
- **Database Engine**: PostgreSQL with Drizzle ORM (`drizzle-orm` v0.45.2).

---

## 2. Authentication, Tenants & Role Permissions Model

- **Primary Auth Provider**: Clerk (`@clerk/express` & `@clerk/react`).
- **Access Resolution Middleware**: [`artifacts/api-server/src/lib/access.ts`](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/api-server/src/lib/access.ts).
- **Roles**:
  - `platform_admin` / `super_admin`: Full cross-tenant access to system health, global catalogue, and subscription provisioning.
  - `company_admin`: Admin rights for a single tenant (employee management, course assignment, company reports, evidence packs, bulk exports).
  - `manager`: Departmental management, challenge reviews, employee progress tracking within assigned tenant.
  - `employee` / `learner`: Personal learning dashboard, course player, quiz assessments, workplace commitment submissions, certificate downloads.
- **Tenant Context**: Resolved via JWT metadata claims (`publicMetadata.companyId`) or headers in test (`x-company-id`). Enforced strictly by `requireCompanyAdmin` and `getCompanyAccess`.

---

## 3. Database Entities & Key Schema Relationships

- `companies`: Tenant organization record (`id`, `name`, `code`, `sector`, `employeeCount`, `subscriptionPlanId`).
- `employees`: Company roster member (`id`, `companyId`, `clerkUserId`, `email`, `name`, `department`, `jobTitle`, `role`, `status`).
- `courses`: Course record (`id`, `courseCode` `ELH-01`..`ELH-29`, `slug`, `title`, `description`, `passingScore`, `badgeName`).
- `lessons`: Lesson content block (`id`, `courseId`, `orderIndex`, `title`, `contentBlocks`).
- `enrollments`: Course assignment and progress state (`id`, `userId`, `employeeId`, `courseId`, `status`, `progressPct`).
- `quiz_attempts`: Assessment record (`id`, `userId`, `courseId`, `score`, `passed`, `correctAnswers`, `totalQuestions`).
- `quiz_questions`: Question bank (`id`, `courseId`, `question`, `options`, `correctOption`, `correctExplanation`).
- `certificates`: Issued credential record (`id`, `userId`, `employeeId`, `courseId`, `uniqueCode`, `pdfUrl`, `issuedAt`).
- `learner_commitments`: Workplace action commitment (`id`, `userId`, `courseId`, `commitmentText`).
- `challenges`: Challenge & workplace evidence submission (`id`, `companyId`, `employeeId`, `title`, `status`, `evidenceUrl`).

---

## 4. Localisation & Internationalisation Architecture

- **Static Interface**: Locale dictionaries in `artifacts/api-server/src/lib/translations.ts` and `artifacts/ecolearn/src/config/translations.ts`.
- **Dynamic Course Content**: French course registry in `artifacts/api-server/src/lib/frenchCourseContent.ts` providing locale-aware course titles, descriptions, objectives, lessons, scenarios, quiz questions, feedback, and badges when `locale=fr` is supplied via query param or `Accept-Language` header.

---

## 5. Commercial Pricing & Employee Band Enforcement

- **Band 1 (UP_TO_25)**: 1–25 employees (MUR 3,000 / month).
- **Band 2 (FROM_26_TO_50)**: 26–50 employees (MUR 4,500 / month).
- **Band 3 (FROM_51_TO_80)**: 51–80 employees (MUR 5,000 / month).
- **Band 4 (FROM_81_TO_120)**: 81–120 employees (MUR 6,250 / month).
- **Band 5 (OVER_120)**: > 120 employees (Tailored Quote).
- **Enforcement**: Server-side employee count check during employee creation and invitation routes.

---

## 6. Known Constraints & Pilot Scope Boundaries

- Payment gateway integrations (Stripe, MCB Juice) are out of scope for controlled pilot (subscription codes are assigned manually by platform admin).
- No destructive DB schema resets allowed.
