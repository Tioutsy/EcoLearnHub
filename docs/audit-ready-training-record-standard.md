# Audit-Ready Training Record Standard — EcoLearnHub

## Purpose
This document specifies the authoritative training record standard for EcoLearnHub. It defines the required fields, data sources, tenant isolation rules, and verification criteria for corporate training compliance and audit reporting.

---

## Authoritative Training Record Schema

Every training record generated or exported by EcoLearnHub must contain the following fields:

| Field Name | Type | Source Table / Field | Description | Implemented Status |
| --- | --- | --- | --- | --- |
| `Company ID` | Integer | `companies.id` | Unique database identifier of the employer company | **Implemented** |
| `Company Name` | String | `companies.name` | Legal name of the employer company | **Implemented** |
| `Learner ID` | String / Integer | `employees.id` / `users.id` | Unique identifier of the enrolled employee or learner | **Implemented** |
| `Learner Name` | String | `employees.name` | Full legal name of the learner | **Implemented** |
| `Learner Email` | String | `employees.email` | Corporate email address of the learner | **Implemented** |
| `Department` | String | `employees.department` | Department or business unit | **Implemented** |
| `Job Role` | String | `employees.role` | Specific job role / title within company | **Implemented** |
| `Course Code` | String | `courses.course_code` | Authoritative EcoLearn course identifier (`ELH-01` .. `ELH-29`) | **Implemented** |
| `Course Title` | String | `courses.title` | Full course title | **Implemented** |
| `Course Version` | Integer | `courses.version` | Version number of course content completed | **Implemented** |
| `Assignment Date` | Timestamp | `course_assignments.assigned_at` | Timestamp when training was assigned | **Implemented** |
| `Enrolment Date` | Timestamp | `enrollments.created_at` | Timestamp when learner initiated course enrolment | **Implemented** |
| `Last Active Date` | Timestamp | `enrollments.last_accessed_at` | Timestamp of latest progress update | **Implemented** |
| `Completion Date` | Timestamp | `enrollments.completed_at` | Timestamp when course was completed | **Implemented** |
| `Completion Status` | String | `enrollments.status` | Status: `not_started`, `in_progress`, `completed` | **Implemented** |
| `Progress Percentage` | Integer | `enrollments.progress_pct` | Learner course completion percentage (0-100%) | **Implemented** |
| `Final Quiz Score` | Integer | `quiz_attempts.score` | Final score achieved on passing quiz attempt | **Implemented** |
| `Passing Threshold` | Integer | `courses.passing_score` | Required score percentage for passing (e.g. 80%) | **Implemented** |
| `Quiz Attempts` | Integer | Count(`quiz_attempts`) | Total number of quiz attempts taken | **Implemented** |
| `Badge Awarded` | String / Boolean | `employee_badges` | Name of badge awarded upon completion | **Implemented** |
| `Certificate Code` | String | `certificates.unique_code` | Unique certificate verification code (`ECO-XXXXXX`) | **Implemented** |
| `Certificate Issue Date` | Timestamp | `certificates.issued_at` | Timestamp when official certificate was issued | **Implemented** |
| `Record Exported At` | Timestamp | System Date | Timestamp when CSV / PDF report was generated | **Implemented** |

---

## Security & Tenant Isolation Controls
1. **Strict Company Scoping**: All reporting queries filter strictly by `company_id = access.companyId`. Cross-tenant data leakage is strictly blocked.
2. **Formula Injection Defense**: Learner-supplied text fields (name, email, department) in CSV exports are escaped to prevent spreadsheet formula injection attacks.
3. **Immutability & Idempotency**: Completion timestamps and certificate unique codes cannot be modified once generated.
