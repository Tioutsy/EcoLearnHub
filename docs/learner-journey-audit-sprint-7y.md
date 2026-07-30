# Authoritative Learner-Journey Map — Sprint 7Y

## Overview
This document maps the complete 19-stage learner journey within EcoLearnHub across all 29 active courses (`ELH-01` through `ELH-29`), detailing entry points, API routes, database operations, expected outcomes, and verified status.

---

## Learner Journey Audit Table

| Stage | Stage Name | Frontend Entry Point | API / Service | Database Records | Expected Result | Initial Status | Corrective Action | Final Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **1** | **User Authentication** | `/login`, `/register` | Clerk SDK / auth middleware | `employees`, Clerk sessions | Valid user session established with unique user ID and email | Pass | Verified Clerk middleware resolution | **Pass** |
| **2** | **Company & Role Resolution** | App layout header, profile context | `getCompanyAccess(req)` | `companies`, `employees` | Resolves `companyId`, `employeeId`, and role (`learner`, `manager`, `company_admin`, `platform_admin`) | Pass | Strict fail-closed resolution | **Pass** |
| **3** | **Subscription Entitlement** | Catalogue `/courses`, detail `/courses/:id` | `evaluateCourseAccess(courseId, access)` | `company_subscriptions`, `subscription_plans`, `plan_course_entitlements` | Determines if company subscription plan includes target course (`INCLUDED_IN_PLAN` vs `PLAN_UPGRADE_REQUIRED`) | Pass | Dual enforcement in `courseAccessService` | **Pass** |
| **4** | **Prerequisite Check** | Course detail page, Enrol button | `checkCourseEligibility(courseId, access)` | `course_prerequisites`, `enrollments`, `quiz_attempts` | Verifies required prerequisite courses are completed (`PREREQUISITE_REQUIRED` if missing) | Pass | Server-side enforcement in `evaluateCourseAccess` | **Pass** |
| **5** | **Course Enrolment** | `/courses/:id` ("Enrol" button) | `POST /api/enrollments` | `enrollments` | Creates `enrollment` record with status `active` and `progressPct: 0` | Pass | Validates plan, prerequisites, and duplicate prevention | **Pass** |
| **6** | **Lesson Retrieval** | `/learn/:courseId` (Player) | `GET /api/courses/:id` | `courses`, `lessons` | Delivers structured content blocks for active course lessons | Pass | Repaired ELH-07 empty blocks | **Pass** |
| **7** | **Progress Creation** | `/learn/:courseId` (Lesson 1) | `PATCH /api/progress/:enrollmentId` | `lesson_progress` | Inserts initial `lesson_progress` record for lesson 1 | Conditional | Added enrollment ownership verification | **Pass** |
| **8** | **Progress Updates** | `/learn/:courseId` (Player next/back) | `PATCH /api/progress/:enrollmentId` | `lesson_progress`, `enrollments` | Updates `completed: 1` and recalculates overall `progressPct` | Conditional | Enforced server-side ownership & bounds validation | **Pass** |
| **9** | **Course Resume** | `/dashboard`, `/my-learning` | `GET /api/enrollments` | `enrollments`, `lesson_progress` | Loads latest `lastAccessedAt` lesson state seamlessly | Pass | Verified progress preservation | **Pass** |
| **10** | **Quiz Retrieval** | `/learn/:courseId/quiz` | `GET /api/courses/:courseId/quiz` | `quiz_questions` | Returns question stems and options (hiding correct option indexes) | Pass | Blocked unauthenticated/unassigned access | **Pass** |
| **11** | **Quiz Submission** | `/learn/:courseId/quiz` (Submit) | `POST /api/courses/:courseId/quiz/submit` | `quiz_attempts` | Calculates score server-side, records attempt, and returns detailed feedback | Pass | Server-side score & competency calculation | **Pass** |
| **12** | **Failed Attempt Handling** | Quiz result modal | `POST /api/courses/:courseId/quiz/submit` | `quiz_attempts` | Records `passed: false`, displays feedback, leaves course uncompleted | Pass | Retries allowed, course remains `active` | **Pass** |
| **13** | **Passed Attempt Handling** | Quiz result modal | `POST /api/courses/:courseId/quiz/submit` | `quiz_attempts`, `enrollments` | Records `passed: true`, updates `enrollment.status = "completed"` and `progressPct = 100` | Pass | Atomic completion update | **Pass** |
| **14** | **Course Completion** | Completion screen | `POST /api/courses/:courseId/quiz/submit` | `enrollments` | Sets `completedAt = now()`, triggers recognition & milestone evaluation | Pass | Transaction-safe completion processing | **Pass** |
| **15** | **Badge Award** | Learner Profile, Achievements | `awardCourseBadge()` | `employee_badges`, `badge_definitions` | Idempotently awards course-specific badge | Conditional | Extended badge issuance to all user accounts | **Pass** |
| **16** | **Certificate Generation** | Completion screen, `/certificates` | `certificatesTable` insert, `GET /api/certificates/:id/pdf` | `certificates` | Generates unique certificate code (`ECO-XXXXXX`) and downloadable branded PDF | Conditional | Added tenant-isolation check on PDF download routes | **Pass** |
| **17** | **Next Course Recommendation** | Completion modal, Dashboard | `getRecommendedNextCourse(access)` | `courses`, `enrollments`, `plan_course_entitlements` | Returns next entitled & eligible course in pathway (or completed state) | Pass | Verified prerequisite & entitlement filtering | **Pass** |
| **18** | **Company Dashboard Update** | `/company/dashboard`, `/manager` | `GET /api/dashboard/stats`, `GET /api/manager/training/overview` | `employees`, `enrollments`, `certificates` | Updates completion rates, active employees, and certificate counts | Conditional | Scoped `dashboard/stats` to requesting company ID | **Pass** |
| **19** | **Reporting & Export Visibility** | `/manager/training` | `GET /api/manager/training/export.csv`, `GET /api/certificates/company/export` | `employees`, `enrollments`, `certificates` | Produces audit-ready CSV & bulk PDF reports scoped strictly to company | Pass | Added CSV formula protection & company scoping | **Pass** |

---

## Key Journey Controls Verified
1. **Dual Server-Side Access Control**: Every protected route (`enrollments`, `progress`, `quiz`, `certificates`) calls `evaluateCourseAccess(courseId, access)` enforcing both company plan entitlement AND prerequisite completion.
2. **Tenant Isolation**: All progress, quiz, certificate, and dashboard routes strictly verify ownership against `access.userId` or `access.companyId`.
3. **Server-Authoritative Evaluation**: Scores, progress percentages, passing thresholds, badges, and certificates are evaluated server-side.
