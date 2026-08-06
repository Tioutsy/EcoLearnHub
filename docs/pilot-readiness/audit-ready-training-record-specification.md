# Audit-Ready Training Record Specification (Sprint 10A)

## Executive Summary
This document specifies the training record audit fields captured across Elevio Skills for compliance reporting, ESG verification, and corporate audit readiness.

---

## Field Audit & Data Source Matrix

| Audit Field | Status | Data Source / Table Column | Calculation Type | Notes |
| :--- | :---: | :--- | :--- | :--- |
| **Organisation Name** | Stored | `companies.name` | Direct DB Field | Associated via `company_id` |
| **Learner Identifier** | Stored | `employees.id` / `clerk_user_id` | Direct DB Field | Stable employee ID |
| **Learner Name** | Stored | `employees.name` | Direct DB Field | Roster full name |
| **Learner Email** | Stored | `employees.email` | Direct DB Field | Corporate email |
| **Department** | Stored | `employees.department` | Direct DB Field | Functional department |
| **Job Title** | Stored | `employees.job_title` | Direct DB Field | Roster job title |
| **Course Code** | Stored | `courses.course_code` | Direct DB Field | Stable identifier (e.g. `ELH-01`) |
| **Course Title** | Stored / Localized | `courses.title` / `frenchCourseRegistry` | Dynamic Locale | Localized title based on request locale |
| **Course Locale** | Stored | `user_metadata.preferredLanguage` | Client Preference | Language selected by learner |
| **Course Version** | Stored | `courses.version` | Direct DB Field | Version integer (default 1) |
| **Assignment Date** | Stored | `course_assignments.created_at` | Direct Timestamp | Timestamp when course was assigned |
| **Start Date** | Stored | `enrollments.created_at` | Direct Timestamp | First access timestamp |
| **Completion Date & Time** | Stored | `enrollments.completed_at` | Direct Timestamp | Exact ISO timestamp upon passing quiz |
| **Quiz Score** | Stored | `quiz_attempts.score` | Backend Evaluated | Percentage score earned |
| **Pass Threshold** | Stored | `courses.passing_score` | Direct DB Field | Fixed at 80% |
| **Number of Attempts** | Stored | `quiz_attempts` count | Runtime Aggregated | Count of attempts for user and course |
| **Completion Status** | Stored | `enrollments.status` | State Machine | `assigned` \| `in_progress` \| `completed` \| `overdue` |
| **Certificate Unique Code** | Stored | `certificates.unique_code` | Direct DB Field | Verifiable 12-char alphanumeric code |
| **Certificate Verification URL** | Calculated | `/verify-certificate?code={uniqueCode}` | Runtime Generated | Public verification URL |
| **Assigning Admin / Manager** | Stored | `course_assignments.assigned_by_user_id` | Direct DB Field | Clerk User ID of assigner |
| **Workplace Action Submission** | Stored | `challenges` / `learner_commitments` | Related Entity | Submitted action proof |
| **Export Timestamp** | Calculated | `new Date().toISOString()` | Runtime Generated | ISO timestamp on CSV/PDF export |

---

## Gap Analysis & Post-Pilot Roadmap Recommendations
1. **Current Coverage**: 20 out of 22 training evidence fields are directly stored and backend-validated.
2. **Runtime Derived Fields**: Certificate verification URLs and export timestamps are calculated deterministically at export time.
3. **Future Recommendations**:
   - Advanced digital signature hashing for PDF evidence packs (recommended for post-pilot enterprise tier).
   - Immutable audit log ledger for enterprise compliance exports.
