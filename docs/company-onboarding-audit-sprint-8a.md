# Company Onboarding & First-Course Activation Audit — Sprint 8A

## Overview
This document records the server-side onboarding state model, employee band capacity enforcement, CSV bulk-import specification, invitation token lifecycle, default course assignment strategy, and diagnostic controls implemented during Sprint 8A.

---

## 1. Authoritative Onboarding State Model

The server-side service `getCompanyOnboardingStatus(companyId)` calculates company readiness across 8 distinct stages:

| Stage | Stage Name | Verification Criteria | Next Action / Outcome |
| --- | --- | --- | --- |
| **1** | `company_created` | Company database record exists | Complete organisation profile details |
| **2** | `profile_incomplete` | Name or required profile fields missing | Provide trading name, contact email, location |
| **3** | `subscription_required` | No active subscription or employee band assigned | Select subscription plan & employee band |
| **4** | `admin_ready` | Profile complete, subscription active, admin assigned | Add or import company employees |
| **5** | `employees_pending` | Employees created/invited but none activated | Send or resend employee invitation links |
| **6** | `course_assignment_pending` | Employees present, but no course/pathway assigned | Assign first course (`ELH-01 Sustainability Foundations`) |
| **7** | `ready_for_learning` | Profile, subscription, employees, and first course ready | Learners can sign in and start training |
| **8** | `active` | At least one learner active with progress recorded | Company actively training on EcoLearnHub |

---

## 2. Employee Band Capacity Rules & Counting

1. **Employee Counting Rule**: Count = Total employees in `employeesTable` belonging to `companyId` (including active members and pending invitations, excluding deactivated employees).
2. **Band Limit Enforcement**: Checked during individual employee creation (`POST /api/companies/employees`) AND CSV bulk import (`POST /api/companies/employees/bulk-import`).
3. **Limit Reached Handling**: Imports exceeding remaining capacity are rejected before invitation creation, presenting exact row-level error reports without partially creating uncontrolled records.

---

## 3. Bulk CSV Import Specification

- **Supported Headers**: `first_name`, `last_name` (or `name`), `email`, `role`, `department`, `job_title`.
- **Validation Pipeline**:
  1. Header presence validation.
  2. Email regex format validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
  3. Row-level duplicate email detection within file and database.
  4. Employee band capacity limit verification.
  5. Role validation (`"employee" | "manager" | "admin"`). Rejects `"platform_admin"`.
  6. Formula injection escaping (`=`, `+`, `-`, `@` escaped).
  7. Atomic UUID invitation token generation per valid imported employee.

---

## 4. Invitation Lifecycle & Security Controls

- **Token Security**: Unguessable UUID tokens (`randomUUID()`), single-use upon account activation, server-side company & role resolution.
- **Resend Flow**: `POST /api/companies/employees/:id/resend` generates a new invitation token and updates `invitationSentAt`.
- **Revoke Flow**: `POST /api/companies/employees/:id/revoke` sets `invitationStatus = "revoked"` and invalidates token.
- **Acceptance Flow**: `POST /api/invitations/accept` verifies token, links user account, sets `invitationStatus = "accepted"`, and records timestamp.

---

## 5. First-Course Assignment Strategy

- **Default Recommendation**: `ELH-01 — Sustainability Foundations`.
- **Enforcement Controls**: Verifies subscription plan entitlement (`evaluateCourseAccess`) and required prerequisites before enrolment.
- **Idempotency**: Prevents duplicate active enrolments per employee and course.
