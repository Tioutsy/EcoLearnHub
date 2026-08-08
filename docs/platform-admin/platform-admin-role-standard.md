# Platform Admin Role Standard

## 1. Overview
This document specifies the authoritative capability matrix across all 4 system roles in ELEVIO SKILLS: **`PLATFORM_ADMIN`**, **`COMPANY_ADMIN`**, **`MANAGER`**, and **`LEARNER`**.

---

## 2. Authoritative Capability Matrix

| Capability | Platform Admin | Company Admin | Manager | Learner |
| :--- | :---: | :---: | :---: | :---: |
| **View Client Organisation Registry** | ✓ | ✗ | ✗ | ✗ |
| **Search Global Accounts Directory** | ✓ | ✗ | ✗ | ✗ |
| **View Platform Operational Activity Log** | ✓ | ✗ | ✗ | ✗ |
| **View Account Health & Orphan Warnings** | ✓ | ✗ | ✗ | ✗ |
| **Manage Global Catalogue & Sectors** | ✓ | ✗ | ✗ | ✗ |
| **Add / Edit / Remove Company Employees** | ✓ | ✓ | ✗ | ✗ |
| **Assign Courses to Employees** | ✓ | ✓ | ✓ (Team) | ✗ |
| **View Company Compliance Reports** | ✓ | ✓ | ✗ | ✗ |
| **View Team Progress Reports** | ✓ | ✓ | ✓ (Team) | ✗ |
| **View Own Dashboard & Play Courses** | ✓ | ✓ | ✓ | ✓ |
| **Download Own Certificates** | ✓ | ✓ | ✓ | ✓ |

---

## 3. Security Boundary Guarantees
1. **Server Enforcement**: API routes for platform administration require valid `PLATFORM_ADMIN` access verified via server middleware.
2. **Tenant Isolation**: `COMPANY_ADMIN`, `MANAGER`, and `LEARNER` roles are strictly scoped to their assigned `companyId`. Cross-tenant requests return `403 Forbidden`.
3. **No Self-Promotion**: Neither client UI forms nor public endpoints accept role escalation inputs.
