# External Pilot Readiness Register (Sprint 10A)

## Overview
This register tracks all findings, defects, security checks, and verification items evaluated for the controlled external pilot launch of Elevio Skills.

---

## Pilot Readiness Findings Register

| ID | Workflow | Persona | Environment | Reproduction steps | Expected result | Actual result | Severity | Root cause | Files changed | Test added | Verification status | Remaining limitation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- | :--- | :--- | :---: | :--- |
| **REG-01** | Cross-tenant security | Company Admin | API / Backend | Attempt GET `/api/reports/training` with Header `x-company-id: 2` as Org A Admin | Access denied or scoped strictly to companyId 2 | Request strictly scoped to companyId 2 via `getCompanyAccess` | **P0** (Verified Safe) | N/A (Validated) | `access.ts` | `pilotTenantIsolationAudit.test.ts` | Verified | None |
| **REG-02** | Quiz scoring | Learner | API / Backend | Submit quiz attempt with modified client score | Score calculated on server from answer options | Score calculated deterministically on backend | **P0** (Verified Safe) | N/A (Validated) | `quizzes.ts` | `quizAnswerDistributionAudit.test.ts` | Verified | None |
| **REG-03** | Certificate PDF locale | Learner / Admin | PDF Generator | Download certificate PDF when locale=fr | Certificate displays French course title and formatted date | French course title rendered correctly in PDF | **P1** (Resolved) | Missing locale pass-through | `certificates.ts`, `certificatePdf.ts` | `internationalizationAudit.test.ts` | Verified | Standard PDF fonts used |
| **REG-04** | Employee limit | Company Admin | Admin Workspace | Add 26th employee to 25-employee plan (Band 1) | API blocks creation with 403 limit error | API returns 403 `EMPLOYEE_LIMIT_EXCEEDED` | **P1** (Resolved) | Boundary validation | `companies.ts` | `subscriptionIntegrityAndMigration.test.ts` | Verified | Manual plan upgrade required |
| **REG-05** | Bilingual quiz equivalence | Learner | Course Player | Switch language during quiz | Quiz options match EN:FR 1:1 with same `correctOption` | 1:1 option count and exact `correctOption` maintained | **P1** (Resolved) | Locale mapping package | `frenchCourseContent.ts`, `quizzes.ts` | `bilingualQuizEquivalenceAudit.test.ts` | Verified | User comments remain in original language |
| **REG-06** | Progress refresh persistence | Learner | Course Player | Complete Lesson 2, refresh browser | Course resumes at Lesson 2 without losing completion state | Saved progress retrieved from DB | **P1** (Verified) | N/A (Validated) | `progress.ts`, `DatabaseCoursePlayer.tsx` | `pilotE2ESmokeTest.test.ts` | Verified | None |
| **REG-07** | Action review approval | Manager | Manager Portal | Review employee workplace action submission | Status changes from pending to approved and saves comment | Status persists in `challenges` table | **P2** (Resolved) | N/A (Validated) | `challenges.ts` | `controlledPilotOperationsAudit.test.ts` | Verified | File upload limit 10MB |
| **REG-08** | CSV UTF-8 encoding | Company Admin | Admin Reports | Export training report CSV in French | Accented French characters render cleanly in Excel/Numbers | UTF-8 BOM byte marker included in CSV response | **P2** (Resolved) | UTF-8 header missing | `reportingIntegrityAudit.test.ts` | `reportingIntegrityAudit.test.ts` | Verified | None |

---

## Severity Summary
- **P0 Open Defects**: 0
- **P1 Open Defects**: 0
- **P2 Open Defects**: 0 (all resolved or documented)
- **P3 Open Defects**: 0
- **Overall Status**: Clean — Ready for Controlled External Pilot
