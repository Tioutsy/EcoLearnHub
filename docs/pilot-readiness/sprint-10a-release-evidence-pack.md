# Sprint 10A — Release Evidence Pack & External Pilot Decision

## Executive Summary

This document provides the formal release evidence pack for **Elevio Skills by Recyclean** prior to controlled external company pilot launch.

Based on end-to-end workflow validation, tenant isolation security testing, role-permission audits, bilingual runtime checks, certificate verification, and automated regression test execution across 49+ test files, Elevio Skills receives a formal recommendation of **GO — Ready for Controlled External Pilot**.

---

## 1. Repository Discovery Summary

- **Architecture**: Workspace monorepo (`pnpm` v9.15.2) with Express API server, Vite React frontend, Drizzle ORM PostgreSQL schema, and Clerk authentication.
- **Catalogue & Localisation**: 29 active courses (ELH-01 through ELH-29) fully localized in English and French.
- **Tenant Context**: Organization isolation enforced server-side via `getCompanyAccess` and `companyId` filtering across all API routes, reports, and exports.

---

## 2. Pilot-Critical Workflows Tested

1. Company Onboarding & Profile Setup
2. Employee Creation, Invitation & Roster Administration
3. Role & Permission Access Restrictions
4. Course Assignment & Catalogue Entitlements
5. Learner Journey (Lessons, Progress, Refresh Persistence)
6. Bilingual Language Switching & Persistence
7. Quiz Scoring Integrity & Pass Mark Enforcement (80%)
8. Certificate Generation & PDF Downloads
9. Manager Challenge & Workplace-Action Review
10. Company Reporting & CSV/PDF Exports
11. Subscription Pricing Band Enforcement (25, 50, 80, 120 limits)

---

## 3. Test Organisations & Personas

- **Organisation A — Hospitality Pilot**: Lux Resorts Mauritius (`LUX-MU`, 80-employee Band 3, 3 departments, EN/FR learners).
- **Organisation B — Professional Services Pilot**: Mauritius Commercial Bank (`MCB-MU`, 120-employee Band 4, EN/FR learners).
- **Platform User**: Authorised Platform Admin.

---

## 4. Automated Tests Executed & Results

| Test Suite | File | Tests | Result |
| :--- | :--- | :---: | :---: |
| **Tenant Isolation Audit** | `pilotTenantIsolationAudit.test.ts` | 5/5 | **PASS** |
| **Role Permissions Matrix** | `pilotRolePermissionsAudit.test.ts` | 3/3 | **PASS** |
| **End-to-End Pilot Smoke Test** | `pilotE2ESmokeTest.test.ts` | 8/8 | **PASS** |
| **Bilingual Quiz Equivalence** | `bilingualQuizEquivalenceAudit.test.ts` | 8/8 | **PASS** |
| **Mixed-Language Runtime Audit** | `mixedLanguageRuntimeAudit.test.ts` | 6/6 | **PASS** |
| **French Content Audit** | `frenchCourseContentAudit.test.ts` | 20/20 | **PASS** |
| **API Locale Integration** | `apiLocaleIntegration.test.ts` | 5/5 | **PASS** |
| **Internationalisation Audit** | `internationalizationAudit.test.ts` | 13/13 | **PASS** |
| **Course Quality Standard** | `courseQualityStandardAudit.test.ts` | 58/58 | **PASS** |
| **Quiz Answer Distribution** | `quizAnswerDistributionAudit.test.ts` | 4/4 | **PASS** |
| **Subscription & Pricing Audit**| `subscriptionIntegrityAndMigration.test.ts` | 2/2 | **PASS** |
| **Workspace Typecheck** | `pnpm run typecheck` | 4/4 projects | **PASS (0 errors)** |
| **Production Build** | `pnpm run build` | Workspace | **PASS (3.63s)** |

---

## 5. Security, Tenant Isolation & Role Permissions

- **Cross-Tenant Isolation**: Verified that Company Admin A cannot view, edit, or export Organisation B's employees, assignments, progress, certificates, or reports (5/5 tests pass).
- **Role Permissions**: Verified that Learners cannot access admin endpoints, export company data, or modify assignments (3/3 tests pass).
- **Backend Score Enforcement**: Quiz scores are evaluated on the backend based on correct option indexes; client-supplied scores cannot override backend evaluation.

---

## 6. Bilingual Runtime & Mobile Verification

- **Locale Switching**: Verified language switching across Dashboard, Catalogue, Player, Quiz, Completion, and Certificates.
- **Dynamic Content**: Course titles, descriptions, objectives, lessons, scenarios, quiz questions, feedback, and badges resolve dynamically to French when `locale=fr` is supplied.
- **Mobile Readability**: Inspected representative mobile viewports (375px & 412px width). Text wrapping, button tap targets, and card bounds maintain full usability without horizontal scroll.

---

## 7. Employee Pricing Band Boundary Enforcement

- Tested exact subscription limits:
  - Band 1 (UP_TO_25): Limit 25 employees
  - Band 2 (FROM_26_TO_50): Limit 50 employees
  - Band 3 (FROM_51_TO_80): Limit 80 employees
  - Band 4 (FROM_81_TO_120): Limit 120 employees
  - Band 5 (OVER_120): Tailored Quote
- Exceeding the allowed employee limit returns 403 `EMPLOYEE_LIMIT_EXCEEDED` from the backend API.

---

## 8. Defect Resolution Summary

- **Total Defects Discovered**: 8
- **P0 Blockers Resolved**: 2 (Cross-tenant security verification, server-side score calculation)
- **P1 Defects Resolved**: 4 (Certificate PDF locale pass-through, subscription boundary enforcement, bilingual quiz package mapping, progress refresh persistence)
- **P2 Usability Items Resolved**: 2 (Manager action review approval comment, UTF-8 CSV BOM marker)
- **Open P0 / P1 Defects**: **0**

---

## 9. Recommended Pilot Size & Controls

- **Recommended Initial Pilot Cohort**: 1 to 3 controlled pilot companies (up to 50 learners per company).
- **Pilot Duration**: 4 weeks.
- **Support Controls**: Dedicated pilot onboarding checklist and weekly reporting exports.

---

## 10. Release Decision

### **GO — Ready for Controlled External Pilot**

Elevio Skills by Recyclean meets all security, functional, bilingual, audit, pricing, and testing requirements for external pilot launch.
