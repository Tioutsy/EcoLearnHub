# Company Admin Workspace Audit — Sprint 8B

## Overview
This document records the architectural inspection, data model design, tenant isolation boundaries, assignment engine integration, administrative audit logging, notification pipeline, and diagnostic checks for Sprint 8B (Company Admin Workspace, Employee Management & Training Assignment Operations).

---

## 1. Existing Reusable Components & Services
- **Onboarding & Capacity**: `getCompanyOnboardingStatus(companyId)` in `companyOnboardingService.ts` provides readiness calculations and employee capacity limits.
- **Bulk CSV Import**: `parseAndValidateEmployeeCsv` and `executeEmployeeImport` in `employeeImportService.ts` handle header parsing, email syntax validation, duplicate detection, formula escaping, capacity checks, and batch invitation creation.
- **Invitation Lifecycle**: `createOrRefreshInvitation`, `revokeInvitation`, `acceptInvitation` in `invitationService.ts` and `/api/invitations` routes manage unguessable UUID tokens, token refresh, token revocation, and account activation.
- **Access Control & Tenant Isolation**: `requireCompanyAdmin`, `requireSameCompanyEmployee`, `getCompanyAccess` in `access.ts` enforce company boundaries and role permissions (`platform_admin`, `company_admin`, `employee`).
- **Course Access & Prerequisite Security**: `evaluateCourseAccess` in `courseAccessService.ts` and `checkPrerequisites` in `prerequisites.ts` enforce commercial plan entitlements and required course prerequisites.
- **Training Data & Reporting**: `trainingReportingService.ts` and `lmsData.ts` provide authoritative company completion records, course progress rows, and reporting metrics.

---

## 2. Current Routes & Operational Model
- **Company Routes** (`/api/companies`, `/api/company`): Profile updates, employee lists, single employee creation, invitation creation, bulk CSV import, resend/revoke invitation, onboarding status.
- **Manager Training Routes** (`/api/manager/training`): Training reports, CSV exports, PDF Evidence Pack download (`/evidence-pack.pdf`).
- **Invitations Routes** (`/api/invitations`): Token verification (`/verify`) and token acceptance (`/accept`).

---

## 3. Data Model Enhancements & Schema Additions

To support Phase 2–9 requirements without altering existing historical schemas:
1. **Employee Status (`status` on `employeesTable`)**: Add `status: text("status").notNull().default("active")` (`"active" | "deactivated"`) to distinguish active employees from deactivated former employees while preserving training history, completions, and certificates.
2. **Administrative Audit Logs (`auditLogsTable`)**: Create `audit_logs` table storing immutable administrative operations:
   - Fields: `id`, `companyId`, `actorUserId`, `actorRole`, `action`, `targetType`, `targetId`, `metadata` (jsonb/text), `createdAt`.
3. **Department Management (`departmentsTable`)**: Create `departments` table:
   - Fields: `id`, `companyId`, `name`, `code`, `status` (`"active" | "archived"`), `managerEmployeeId`, `createdAt`, `updatedAt`.
4. **Learning Pathways & Department Assignments**: Support multi-employee, department-level, and learning-pathway assignments in `courseAssignmentsTable` and `enrollmentsTable`.

---

## 4. Authoritative Admin Overview Service (`adminOverviewService.ts`)
Creates `getCompanyAdminOverview(companyId: number)` returning:
- Subscription plan & seat capacity (`limit`, `used`, `remaining`).
- Employee breakdown (`active`, `pendingInvitations`, `deactivated`, `withoutTraining`).
- Training status summary (`assignedCourses`, `notStarted`, `inProgress`, `completed`, `overdue`).
- Onboarding status & recommended administrative actions.

---

## 5. Course & Pathway Assignment Pipeline (`assignmentService.ts`)
Single server-side assignment service `assignTrainingToCompanyEmployees(...)` supporting:
- Single course to single/multiple employees.
- Single course to department.
- Learning pathway to single/multiple employees or department.
- Execution steps:
  1. Requester tenant authorization (`requireCompanyAdmin`).
  2. Employee active status validation (`status !== "deactivated"`).
  3. Subscription plan entitlement validation (`evaluateCourseAccess`).
  4. Required prerequisite check (`checkPrerequisites`).
  5. Idempotent assignment insert in `courseAssignmentsTable` and `enrollmentsTable`.
  6. Partial failure reporting (`assigned`, `alreadyAssigned`, `missingPrerequisite`, `notEntitled`, `inactiveEmployee`).
