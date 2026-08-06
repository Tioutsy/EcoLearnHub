# Pilot-Critical Workflow Matrix (Sprint 10A)

## Overview
This matrix covers all 11 pilot-critical workflow categories required for Elevio Skills controlled external pilot launch.

---

## Workflow Matrix

| Workflow | Persona | Frontend entry point | API route | Database entities | Expected result | Automated coverage | Manual validation | Status | Evidence |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **3.1 Company Setup** | Platform Admin / Company Admin | `/company/onboarding` | `POST /api/companies/onboard` | `companies`, `employees`, `subscription_plans` | Organization created, admin membership assigned, default plan configured | `companyOnboardingAudit.test.ts` | Onboarded Test Org A & B | Verified | PASS |
| **3.2 Employee Admin** | Company Admin | `/company/employees` | `POST /api/companies/employees` | `employees`, `companies` | Single employee added, limit checked, invalid email rejected | `companyAdminWorkspaceAudit.test.ts` | Created test learners in Org A & B | Verified | PASS |
| **3.3 Roles & Access** | Learner / Admin / Manager | `/admin`, `/company`, `/dashboard` | `GET /api/companies/me`, `GET /api/admin/overview` | `employees`, `companies` | Learner blocked from admin, cross-tenant URL manipulation rejected | `pilotTenantIsolationAudit.test.ts` | Access attempts blocked with 403 | Verified | PASS |
| **3.4 Course Assignment** | Company Admin | `/company/assignments` | `POST /api/enrollments/assign` | `course_assignments`, `enrollments`, `courses` | Course assigned to employee, visible on dashboard, entitlement enforced | `learnerJourneyAudit.test.ts` | Assigned ELH-01 to ELH-29 | Verified | PASS |
| **3.5 Learner Journey** | Learner | `/learn/:courseId` | `GET /api/courses/:id`, `POST /api/progress/:id` | `enrollments`, `lessons`, `quiz_attempts` | Lessons completed, quiz passed at >= 80%, status updated to completed | `pilotE2ESmokeTest.test.ts` | Completed ELH-01, ELH-06, ELH-12 | Verified | PASS |
| **3.6 Language Switching** | Learner / Admin | Language selector dropdown | `GET /api/courses?locale=fr`, `GET /api/quizzes/:id?locale=fr` | `translations`, `frenchCourseRegistry` | UI and dynamic course content switch between EN and FR, score unchanged | `bilingualQuizEquivalenceAudit.test.ts` | Switched locale in player & dashboard | Verified | PASS |
| **3.7 Quiz & Integrity** | Learner | `/learn/:courseId` (Quiz phase) | `POST /api/quizzes/:courseId/quiz/submit` | `quiz_attempts`, `certificates`, `enrollments` | Backend evaluates score deterministically, single completion record created | `quizAnswerDistributionAudit.test.ts` | Submitted passing and failing quizzes | Verified | PASS |
| **3.8 Certificates** | Learner / Company Admin | `/certificates`, `/company/reports` | `GET /api/certificates/:id/pdf`, `GET /api/certificates/company/export` | `certificates`, `courses`, `employees` | Single and bulk PDF downloads generated with correct name, date, and locale | `internationalizationAudit.test.ts` | Downloaded EN and FR certificates | Verified | PASS |
| **3.9 Manager Review** | Manager | `/company/challenges-review` | `GET /api/challenges`, `PATCH /api/challenges/:id` | `challenges`, `employees` | Workplace actions reviewed, approved/returned status saved, filtered by tenant | `controlledPilotOperationsAudit.test.ts` | Approved action submission for Org A | Verified | PASS |
| **3.10 Reporting & Exports** | Company Admin / Manager | `/company/reports` | `GET /api/reports/training`, `GET /api/reports/training/csv` | `enrollments`, `employees`, `courses` | Company completion metrics accurate, CSV exports with UTF-8 encoding | `reportingIntegrityAudit.test.ts` | Exported CSV training reports | Verified | PASS |
| **3.11 Subscription Bands** | Company Admin | `/company/settings` | `GET /api/subscriptions/me`, `POST /api/companies/employees` | `subscription_plans`, `companies` | Employee limits strictly enforced per band (25, 50, 80, 120), direct API bypass blocked | `subscriptionIntegrityAndMigration.test.ts` | Boundary tests 25, 26, 50, 51, 80, 81, 120 | Verified | PASS |

---

## Validation Summary
All 11 pilot-critical workflow areas are fully functional, backend-enforced, and covered by automated regression tests.
