# Sprint 10L — Repository Discovery Document (Company Onboarding)

## Executive Summary
This document records the repository discovery conducted for **Sprint 10L — Company Onboarding, Organisation Setup, First Administrator Activation & Tenant Reconciliation**.

---

## 1. Onboarding & Tenant Architecture Overview

- **Auth Identity**: Clerk (`@clerk/express`, `@clerk/react`).
- **Internal Database Tenant**: `companiesTable` (Primary Key `id`, unique `slug`).
- **Employee Record**: `employeesTable` (Linked via `clerkUserId`, `email`, `companyId`, `role`).
- **Subscription Employee Bands**: `companySubscriptionsTable` left-joined with `employeeBandsTable` (`maximumEmployees`: 25, 50, 80, 120, >120 quote).
- **Onboarding Service**: `getCompanyOnboardingStatus` in `artifacts/api-server/src/lib/companyOnboardingService.ts`.
