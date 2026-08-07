# Frontend-Backend Permission Reconciliation

## 1. Executive Summary
This document reconciles frontend UI capability checks with backend API enforcement for **Sprint 10T — Role-Based Access Control, Permission Visibility, Administrator Experience Reconciliation & Cross-Tenant Security Verification**.

---

## 2. Reconciliation Matrix

| Action / Capability | Frontend UI Visibility Check (`authHelpers.ts`) | Backend API Enforcement (`access.ts`) | Alignment Status |
| :--- | :--- | :--- | :---: |
| **Add Employee** | `hasCapability(user, "employees.create")` | `requireCompanyAdmin(req)` | ALIGNED |
| **Remove Employee** | `hasCapability(user, "employees.create")` | `requireCompanyAdmin(req)` | ALIGNED |
| **Assign Courses** | `hasCapability(user, "courses.assign")` | `requireCompanyAdmin(req)` / Manager Scoped | ALIGNED |
| **View Org Reports** | `hasCapability(user, "reports.organisation")` | `requireCompanyAdmin(req)` | ALIGNED |
| **View Team Reports** | `hasCapability(user, "reports.team")` | `getCompanyAccess(req)` | ALIGNED |
| **Review Challenges**| `hasCapability(user, "challenges.review")` | `getCompanyAccess(req)` | ALIGNED |
| **Org Settings** | `hasCapability(user, "settings.organisation")` | `requireCompanyAdmin(req)` | ALIGNED |
| **Platform Admin** | `isPlatformAdmin(user)` | `requirePlatformAdmin(req)` | ALIGNED |

---

## 3. Reconciliation Findings
- **Zero UI-Backend Discrepancies**: All frontend buttons hide when unauthorized, and API routes independently reject unauthorized HTTP requests with `403 Forbidden`.
