# Reporting Integrity & Training Evidence Audit — Sprint 7Z

## Overview
This document records the architecture, access-control rules, course-version integrity mechanics, CSV export safeguards, PDF evidence-pack structure, and diagnostic results for EcoLearnHub's reporting layer.

---

## 1. Initial Inspection & Architecture Findings

| Category | Finding Details | Implemented Status |
| --- | --- | --- |
| **Course Version Tracking** | `coursesTable.version`, `enrollmentsTable.completedVersion`, `certificatesTable.courseVersion`, and `quizAttemptsTable.courseVersion` exist in DB schema. | **Verified & Enforced** |
| **Authoritative Reporting Dataset** | Single server-side service (`getCompanyTrainingRecords` in `trainingReportingService.ts`) supplies stats, CSV export, PDF evidence pack, and diagnostics. | **Implemented** |
| **CSV Formula Escaping** | `escapeCsvValue()` escapes `=`, `+`, `-`, `@` characters in user-supplied strings. | **Verified & Tested** |
| **PDF Evidence Pack** | Generated via `generateTrainingEvidencePackPdf()` using `pdf-lib`. | **Implemented** |
| **Tenant Isolation** | Route handlers verify company access via `requireCompanyAdmin(req)` / `getCompanyAccess(req)`. Learners and cross-company unauthorized users are denied (HTTP 403). | **Verified & Tested** |

---

## 2. Authoritative Reporting Service Specification

The consolidated server-side function `getCompanyTrainingRecords({ companyId, filters, requesterRole })` operates as follows:

1. **Company Scoping**: Filters all employee, enrollment, certificate, and quiz attempt queries strictly by `company_id = companyId`.
2. **Filtering**: Supports filtering by `status`, `certificationStatus`, `department`, `role`, `courseId`, `overdue`, and text search.
3. **Metrics Calculation**:
   - **Total Active Learners**: Count of active employees in company.
   - **Learners Assigned Training**: Count of employees with at least one enrolled course.
   - **Completed Courses**: Total enrollments with status `completed`.
   - **In-Progress Courses**: Total enrollments with status `active` and `progressPct > 0`.
   - **Overdue Assignments**: Total active enrollments where `dueDate < now()`.
   - **Completion Rate**: `Math.round((completedCourses / coursesAssigned) * 100)`.
   - **Certificates Issued**: Total certificates belonging to company employees.
   - **Average Quiz Score**: Server-side average of passing quiz attempt scores.

---

## 3. Course-Version Integrity Rules

1. **Historical Version Preservation**: When a course version is bumped (e.g. `1` -> `2`), previous completions retain `completedVersion = 1` and issued certificates retain `courseVersion = 1`.
2. **New Completion Version Tagging**: When a learner completes a course, `enrollmentsTable.completedVersion` and `certificatesTable.courseVersion` are populated with the course's current version (`coursesTable.version`).
3. **Idempotent Backfill**: Any legacy completion record where `completedVersion` is null is backfilled to `1`.

---

## 4. PDF Training Evidence Pack Structure

The generated evidence pack (`GET /api/manager/training/evidence-pack.pdf`) includes:

- **Cover Page**: EcoLearnHub branding, Company Name, Reporting Period, Date Generated, Unique Pack Reference, Legal Disclaimer.
- **Executive Summary**: Key statistics (Total Employees, Assigned, Completed, In-Progress, Overdue, Completion Rate, Certificates Issued).
- **Completion Register Table**: Employee Name, Email, Department, Course Code & Title, Course Version, Status, Completion Date, Quiz Score, Certificate Code.
- **Course Summary Appendix**: Active courses completed, duration, pass threshold.
- **Evidence Methodology**: Statements explaining completion verification, quiz threshold enforcement, and version preservation.

---

## 5. Security & Tenant Isolation Verification
- **Cross-Company Access**: Company A administrator calling Company B's reporting endpoints receives HTTP 403.
- **Learner Access Block**: Regular employees attempting to access `/api/manager/training/*` endpoints receive HTTP 403.
- **CSV Safety**: User-supplied strings starting with `=`, `+`, `-`, `@` are prefixed with single quotes (`'`) to neutralize Excel/CSV formula injection.
