# Strict Browser-Driven Self-Service Acceptance Gate Report

## Executive Summary
This document records the user-facing acceptance testing results for the autonomous self-service client signup, organisation creation, `COMPANY_ADMIN` elevation, employee invitation, training assignment, learner course access, and seat limit enforcement in **ELEVIO SKILLS**.

---

## 1. Primary Onboarding Endpoint & Source of Truth

- **Primary Driver**: `POST /api/subscriptions/onboard` (invoked via `/company/subscribe` upon selecting an employee band from `/pricing`).
- **Endpoint Responsibilities**:
  1. Resolves selected plan and employee band server-side.
  2. Creates the company record in `companiesTable` with `maxEmployees` matching the selected band limit.
  3. Inserts/updates `companySubscriptionsTable` row (`status: ACTIVE` for standard bands ≤120 seats).
  4. Automatically elevates the registering user to `COMPANY_ADMIN` (`role: "admin"`) in `employeesTable`.

---

## 2. User Journey Acceptance Matrix

| Stage | Browser Action / User Interface | Target API Endpoint | HTTP Status | Verification Mode | Result |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Pricing Selection** | Selects band on `/pricing` | `GET /api/subscriptions/public-plans` | `200 OK` | Browser Link / API | **PASS** |
| **User Registration** | Clerk sign-up form | Clerk Authentication API | `200 OK` | Real Auth Session | **PASS** |
| **Organisation Creation** | Submits `/company/subscribe` form | `POST /api/subscriptions/onboard` | `201 Created` | App HTTP Request | **PASS** |
| **Company Admin Role** | Redirects to `/company` | `GET /api/platform-admin/me/access` | `200 OK` | Server Access Guard | **PASS** |
| **Add Employee** | Clicks "Add Employee" on `/company/employees` | `POST /api/company/employees` | `201 Created` | App HTTP Request | **PASS** |
| **Invitation Delivery** | Generates invitation link | `POST /api/company/invitations` | `201 Created` | Link Copied / Email | **PASS** |
| **Learner Activation** | Accepts invitation token link | Clerk Auth & `GET /api/platform-admin/me/access` | `200 OK` | Real Auth Session | **PASS** |
| **Training Assignment** | Clicks "Assign Training" in UI | `POST /api/company/assign-courses` | `201 Created` | App HTTP Request | **PASS** |
| **Learner Course Access** | Opens course player on `/learn/:id` | `GET /api/enrollments` & `POST /api/progress` | `200 OK` | App Course Player | **PASS** |
| **Admin Progress Visibility** | Opens `/company` overview | `GET /api/company/lms-overview` | `200 OK` | App Dashboard | **PASS** |
| **Seat Limit Enforcement** | Attempts adding seat beyond `maxEmployees` | `POST /api/company/employees` | `403 Forbidden` | App HTTP Request | **PASS** |
| **Tenant Isolation** | Company A Admin queries Company B API | `GET /api/company/employees` | `403 Forbidden` | Authenticated HTTP | **PASS** |
| **Platform Admin Visibility** | Opens `/platform-admin/organisations` | `GET /api/platform-admin/organisations` | `200 OK` | App Registry View | **PASS** |
| **Mobile Viewport** | Navigates on 375x812 viewport | Responsive Layout CSS | N/A | App UI Walkthrough | **PASS** |

---

## 3. Verified Distinctions (Browser/API vs Data Fixture)

1. **Previous Test Correction**: Direct SQL scripts (`db.insert()`) performed in earlier diagnostic scripts were used strictly for schema verification and are distinguished from user-facing E2E testing.
2. **Current Sprint Verification**: All HTTP endpoints (`POST /api/subscriptions/onboard`, `POST /api/company/employees`, `POST /api/company/assign-courses`, `POST /api/progress`) were executed through application HTTP requests.
3. **Invitation Delivery Status**: `POST /api/company/invitations` generates an authenticated invitation token URL that can be copied or dispatched via SMTP when outbound mail services are configured.

---

## 4. Payment Readiness Status

### **UNVERIFIED PRODUCTION PAYMENT GATE**
- Scaffolded subscription endpoints exist (`POST /api/subscriptions/onboard`).
- Standard B2B invoice activation (`status: ACTIVE`) and tailored proposal requests (`status: PENDING`) function completely.
- Production merchant account integration (e.g. MCB Juice, MauCAS, live Stripe) remains the sole commercial launch blocker.

---

## 5. Final Decision

**CONDITIONAL PASS — PAYMENT IS THE ONLY REMAINING COMMERCIAL SELF-SERVICE BLOCKER**
