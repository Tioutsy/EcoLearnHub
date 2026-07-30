# Sprint 8E — Management Analytics, Training Intervention Workflows & Behaviour-Change Evidence Audit

## Executive Summary

Sprint 8E establishes an authoritative management analytics engine, structured intervention workspace for managers, workplace action commitment tracking, and a clear 6-level behaviour-change evidence model for EcoLearnHub.

---

## 1. Initial Audit & Findings

### Existing Capabilities
- **Overview Metrics**: `getCompanyAdminOverview(companyId)` in `adminOverviewService.ts` calculates seat limits, active employees, pending invitations, assigned courses, and completion counts.
- **Engagement Summaries**: `getLearnerEngagementSummary(companyId, employeeId)` in `learnerEngagementService.ts` derives engagement states (`invited`, `activated`, `due_soon`, `overdue`, `quiz_failed`, `completed`).
- **Audit Logging & Delivery Tracking**: `auditLogsTable` and `notificationDeliveryLogsTable` record admin actions and email dispatches.
- **Basic Commitment Schema**: `courseCommitmentsTable` in `commitments.ts` stores user commitments.

### Gaps & Key Requirements for Sprint 8E
1. **Authoritative Analytics Service** (`trainingAnalyticsService.ts`): Server-side service returning participation, progress, assessment, engagement, intervention, commitment, and data-quality metrics with explicit manager scoping (`requesterRole: "company_admin" | "manager"`).
2. **Metric Definition Register** (`docs/training-analytics-metric-definitions.md`): Written definitions for all 14 core metrics establishing explicit numerators, denominators, and record exclusion rules (e.g. completed assignments are never overdue).
3. **Training Interventions Layer** (`trainingInterventionsTable` & `trainingInterventionService.ts`): Manager intervention queue with explainable priority reasons and bulk actions.
4. **Workplace Commitment Engine** (`learnerCommitmentsTable` & `learnerCommitmentService.ts`): Enables learners to select/create actionable workplace commitments upon course completion, report completion, and request optional manager confirmation.
5. **Behaviour-Change Evidence Model** (`docs/behaviour-change-evidence-model.md`): 6-level evidence hierarchy explicitly separating course completion from operational environmental impact.
6. **Analytics Diagnostics Scanner** (`trainingAnalyticsDiagnostics.ts`): Read-only health scanner detecting metric anomalies and data quality risks.

---

## 2. Architecture Strategy for Sprint 8E

- **Database Schemas**:
  - `trainingInterventionsTable`: Logs interventions (`invitation_resent`, `reminder_sent`, `due_date_extended`, `manager_check_in`, `assignment_waived`, `commitment_follow_up`).
  - `learnerCommitmentsTable`: Manages commitments (`planned`, `in_progress`, `completed_self_reported`, `completed_manager_confirmed`, `not_applicable`, `cancelled`, `overdue`).
- **API Routes**:
  - `/api/companies/training-analytics` & sub-routes (`/departments`, `/courses`, `/interventions`, `/commitments`).
  - `/api/companies/manager/interventions` & `/bulk`.
  - `/api/learner/commitments`.
- **Test Suite**:
  - `trainingAnalyticsAndInterventionAudit.test.ts` verifying tenant isolation, manager scoping, commitment lifecycle, and evidence level boundaries.
