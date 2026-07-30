# Sprint 8C — Learner Activation, Training Reminders & Engagement Recovery Audit

## Executive Summary & Objectives

Sprint 8C builds on the foundation established in Sprint 8A (Company Onboarding & Invitation Core) and Sprint 8B (Company Admin Workspace & Assignment Engine). 

The goal of Sprint 8C is to build and verify the full post-assignment learner activation and engagement workflow:
1. Complete invitation-to-activation lifecycle (token verification, acceptance, redirect, starting-course guidance).
2. Authoritative server-side `learnerEngagementService.ts` deriving states cleanly without permanent status contradictions.
3. Learner home dashboard providing clear primary actions (Start, Continue, Retry, View Completion) prioritized by urgency.
4. Robust course progress resume and interruption recovery.
5. Quiz failure explanation and retry flow.
6. Centralized reminder policy configuration (`trainingReminderPolicy.ts`).
7. Idempotent scheduled reminder engine (`processTrainingReminders`) with deduplication keys.
8. Delivery log infrastructure (`notification_deliveries` / `notificationDeliveryLogsTable`).
9. Operational vs. optional notification preferences.
10. Manager follow-up dashboard & Company-admin engagement view.
11. Read-only learner engagement diagnostics (`learnerEngagementDiagnostics.ts`).
12. Comprehensive integration test suite (`learnerEngagementAudit.test.ts`).

---

## Current Repository & Service Analysis

### 1. Invitation-to-Activation Sequence
- `invitationService.ts` generates UUID single-use tokens saved on `employeesTable.invitationToken` with status `"invited"`.
- `acceptInvitation(token, clerkUserId)` updates `invitationStatus = "accepted"`, sets `clerkUserId`, and invalidates token (`invitationToken = null`).
- **Gaps Identified for Sprint 8C**:
  - Invitation token expiry logic: Token should expire after 14 days (or configurable window).
  - Existing-user acceptance: If a user with an active account accepts an invitation to another company, ensure clean company membership activation without duplicate accounts or cross-tenant leakage.
  - Safe post-activation redirection to prioritized primary next action (e.g. required overdue course, due-soon course, not-started assignment, or default ELH-01).

### 2. Learner Engagement States
- Currently, status values are scattered across `employeesTable` (`invitationStatus`), `courseAssignmentsTable` (`assignedAt`, `completedAt`), and `enrollmentsTable` (`status`, `progressPct`, `completedAt`).
- **Phase 2 Implementation**: Central `learnerEngagementService.ts` deriving authoritative states:
  - `invited`, `invitation_expired`, `invitation_revoked`, `activated`, `assigned_not_started`, `in_progress`, `inactive_in_progress`, `due_soon`, `overdue`, `quiz_failed`, `completed`, `pathway_in_progress`, `pathway_completed`.
  - Explicit precedence rules: Completed assignments are **never** reported as overdue.

### 3. Reminder Capability & Scheduled Job Infrastructure
- Currently, `notificationService.ts` dispatches isolated notifications.
- No central scheduled job / queue for batch reminder dispatches exists.
- **Phase 8 Implementation**: Build idempotent `processTrainingReminders()` with deduplication keys (`comp_emp_asgn_type_period`) preventing duplicate notifications within the policy window.
- DB Table: `notification_delivery_logs` tracking delivery status (`pending`, `processing`, `delivered`, `failed`, `skipped`, `cancelled`).

### 4. Learner Dashboard & Resume Logic
- Dashboard needs prioritized section hierarchy: Required, Due Soon, Overdue, In Progress, Recommended, Recently Completed, Next Recommended Course.
- Server-side progress resume: Validate ownership (`userId` / `employeeId`) and preserve exact last valid resumable point (`completedLessonIds`, `lastLessonId`, `quizAttempts`).

### 5. Manager & Admin Views
- Manager view: Scoped to department employees, providing 1-click approved reminder dispatch.
- Admin engagement view: Activation rate, completion rate, overdue breakdown, delivery success counts.

---

## Proposed Schema, Service & Migration Changes

1. **Schema Additions**:
   - `notificationDeliveryLogsTable` in `lib/db/src/schema/notificationDeliveryLogs.ts`.
   - `notificationPreferencesTable` in `lib/db/src/schema/notificationPreferences.ts`.
2. **Schema Modifications (`ensureSchemaModifications.ts`)**:
   - Runtime `CREATE TABLE IF NOT EXISTS notification_delivery_logs` and `notification_preferences`.
3. **New Core Services**:
   - `artifacts/api-server/src/lib/learnerEngagementService.ts`
   - `artifacts/api-server/src/lib/trainingReminderPolicy.ts`
   - `artifacts/api-server/src/lib/reminderSchedulerService.ts`
   - `artifacts/api-server/src/lib/learnerEngagementDiagnostics.ts`
4. **New Tests**:
   - `artifacts/api-server/src/lib/learnerEngagementAudit.test.ts` (40 comprehensive subtests).
