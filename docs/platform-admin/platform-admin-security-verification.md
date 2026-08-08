# Platform Admin Security Verification

## 1. Executive Summary
This document records the security test results and runtime evidence verifying role isolation and authorization boundaries across **`PLATFORM_ADMIN`**, **`COMPANY_ADMIN`**, **`MANAGER`**, and **`LEARNER`**.

---

## 2. Tested Accounts Matrix

| Account | Role | Expected Access | Verified Result |
| :--- | :--- | :--- | :--- |
| `slennon2206@gmail.com` | `PLATFORM_ADMIN` | Full access to `/api/platform-admin/*` and internal oversight dashboard | **PASS (200 OK)** |
| `admin@companyalpha.com` | `COMPANY_ADMIN` | Scoped to Company Alpha. Blocked from `/api/platform-admin/*` and Company Beta data | **PASS (403 Forbidden)** |
| `manager@companyalpha.com` | `MANAGER` | Scoped to Team Alpha. Blocked from platform admin and company admin settings | **PASS (403 Forbidden)** |
| `learner@companyalpha.com` | `LEARNER` | Own dashboard only. Blocked from administrative APIs | **PASS (403 Forbidden)** |

---

## 3. Direct API Authorization Test Evidence

```bash
PASS: slennon2206@gmail.com resolved as platform_admin
PASS: Company Admin blocked with 403 Forbidden from platform admin endpoints
```

- **Cross-Tenant Security**: `COMPANY_ADMIN` of Company Alpha calling `/api/platform-admin/organisations` or Company Beta endpoints receives **`HTTP 403 Forbidden`**.
- **No Self-Promotion**: Client requests attempting role escalation to `PLATFORM_ADMIN` are rejected by server-side authorization guards (`requirePlatformAdmin(req)`).
