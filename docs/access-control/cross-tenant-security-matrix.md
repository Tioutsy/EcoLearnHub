# Cross-Tenant Security Matrix

## 1. Executive Summary
This document records cross-tenant security isolation tests between **Test Company Alpha** (`companyId: 101`) and **Test Company Beta** (`companyId: 102`).

---

## 2. Cross-Tenant Attempt Verification Table

| Test Scenario ID | Initiating Role & Company | Requested Resource / Endpoint | Target Tenant | Expected Result | Actual Result | Status |
| :--- | :--- | :--- | :--- | :---: | :---: | :---: |
| **SEC-10T-01** | Company Admin (Alpha) | GET `/api/employees/202` (Beta Employee) | Company Beta | 404 / DENIED | 404 Not Found | PASS |
| **SEC-10T-02** | Manager (Alpha) | GET `/api/challenges/review?companyId=102` | Company Beta | 403 / DENIED | 403 Forbidden | PASS |
| **SEC-10T-03** | Learner (Alpha) | GET `/api/company/reports?companyId=102` | Company Beta | 403 / DENIED | 403 Forbidden | PASS |
| **SEC-10T-04** | Company Admin (Alpha) | POST `/api/employees` (set `companyId: 102` in payload) | Company Beta | Overridden to 101 | Overridden to Alpha | PASS |
| **SEC-10T-05** | Company Admin (Beta) | GET `/api/certificates/verify/ALPHA-1234` | Company Alpha | Redacted / Scoped | Scoped View Only | PASS |

---

## 3. Security Findings & Verdict
- **Cross-Tenant Leaks**: 0
- **Tenant Scope Manipulation Bypass**: 0
- **Backend Enforcement**: API queries filter explicitly on `access.companyId`.

**Result**: 100% PASS — Tenant isolation verified.
