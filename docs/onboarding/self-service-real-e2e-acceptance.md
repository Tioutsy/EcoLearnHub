# Real Self-Service E2E Acceptance Report

## Executive Summary
This document records the end-to-end user journey acceptance results for **ELEVIO SKILLS**.

---

## 1. Real User Journey Acceptance Matrix

| Journey Step | User Action / Interface | API / Backend Operation | Result |
| :--- | :--- | :--- | :--- |
| **1. Band Selection** | `/pricing` selection (Up to 25 seats) | `GET /api/subscriptions/public-plans` | **PASS (200 OK)** |
| **2. Organisation Setup** | Registration form submission | `POST /api/subscriptions/onboard` | **PASS (201 Created)** |
| **3. Admin Elevation** | Redirect to `/company` | Elevated to `COMPANY_ADMIN` in `employeesTable` | **PASS (Role: admin)** |
| **4. Add Employee** | Click "Add Employee" in UI | `POST /api/company/employees` | **PASS (Role: employee)** |
| **5. Seat Enforcer** | Attempt adding seat 26 of 25 | `maxEmployees` server check | **PASS (403 Forbidden)** |
| **6. Training Assign** | Select employee & course | `POST /api/company/assign-courses` | **PASS (201 Created)** |
| **7. Learner Progress** | Learner completes lesson | `POST /api/progress` | **PASS (Progress Updated)** |
| **8. Admin Oversight** | Platform Admin Registry (`/platform-admin/organisations`) | `GET /api/platform-admin/organisations` | **PASS (Auto-populated)** |
| **9. Cross-Tenant Check** | Company A Admin accesses Company B API | Server authorization guard | **PASS (403 Forbidden)** |
| **10. Mobile Viewport** | 375px responsive layout check | Responsive CSS layout | **PASS (Usable)** |

---

## 2. Commercial Blocker Classification

### **PAYMENT ONLY BLOCKER**
All onboarding, role elevation, employee invitation, seat limit enforcement, course assignment, learner progression, and Platform Admin registry oversight work autonomously end-to-end. Production payment gateway integration is the single remaining commercial launch gate.

---

## 3. Final Decision

**CONDITIONAL PASS — REAL SELF-SERVICE ACTIVATION VERIFIED; PRODUCTION PAYMENT REMAINS THE ONLY COMMERCIAL GATE**
