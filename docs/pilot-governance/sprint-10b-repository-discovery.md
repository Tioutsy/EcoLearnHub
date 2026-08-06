# Sprint 10B — Repository & Data Architecture Discovery Document

## Executive Summary
This document records the data architecture discovery conducted prior to the implementation of **Sprint 10B — External Pilot Governance, Privacy Foundations, Data Lifecycle Controls & Pilot Operations Pack**.

---

## 1. Verified Current Implementation

- **Data Storage & Database**: PostgreSQL database managed via Drizzle ORM (`@workspace/db`). Core tables:
  - `companies`: Tenant organisation metadata (`id`, `name`, `code`, `sector`, `employeeCount`, `maxEmployees`, `subscriptionPlanId`).
  - `employees`: User roster (`id`, `companyId`, `clerkUserId`, `email`, `name`, `department`, `jobTitle`, `role`, `status`).
  - `audit_logs`: Operational audit trail (`id`, `companyId`, `actorUserId`, `actorRole`, `action`, `targetType`, `targetId`, `metadata`, `createdAt`).
  - `enrollments`, `quiz_attempts`, `certificates`, `learner_commitments`, `challenges`.
- **Identity & Authentication**: Clerk Auth (`@clerk/express`, `@clerk/react`). Primary identity fields (`userId`, `email`, `role`, `companyId`) are passed in JWT claims or development test headers.
- **Tenant Context**: Resolved dynamically via `getCompanyAccess` in `access.ts`. All admin and reporting queries filter strictly by `companyId`.
- **File Upload Storage**: Challenge evidence uploads handled via file system / multi-part storage with tenant ID prefixes.

---

## 2. Missing Governance Features (To Be Implemented in Sprint 10B)

- Server-side notice acknowledgement table/logging (`company_pilot_notice`, `learner_privacy_notice`, `evidence_upload_notice`).
- Tenant-scoped full JSON pilot data export (`GET /api/companies/export`).
- Dedicated Privacy, Terms, and Support pages in the frontend client.
- Sensitive upload warnings prior to free-text or evidence submission.

---

## 3. Scope Boundaries & Items Requiring Legal Review

- **Mauritian Data Protection Disclaimer**: Platform documentation and privacy pages provide transparent operational notices but explicitly state that final formal legal compliance requires review by a qualified Mauritian legal professional.
- **No Payment Gateway**: Controlled external pilot does not integrate automated payment gateways (subscriptions are managed manually by platform admins).
