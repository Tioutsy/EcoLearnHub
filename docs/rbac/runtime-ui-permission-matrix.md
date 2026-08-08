# Runtime UI Permission Matrix

## 1. Overview
This document defines the UI permission boundaries across all 4 system roles in ELEVIO SKILLS.

---

## 2. Authoritative UI Permission Matrix

| UI Action / Capability | PLATFORM_ADMIN | COMPANY_ADMIN | MANAGER | LEARNER |
| :--- | :---: | :---: | :---: | :---: |
| **Platform Admin Portal (`/platform-admin`)** | Yes | No (403) | No (403) | No (403) |
| **Client Organisations Registry** | Yes | No (403) | No (403) | No (403) |
| **Global Accounts Directory** | Yes | No (403) | No (403) | No (403) |
| **Platform Activity Log & Health** | Yes | No (403) | No (403) | No (403) |
| **Add / Edit / Delete Company Employees** | Context-dependent | Yes | No (Hidden) | No (Hidden) |
| **Assign Training to Employees** | Context-dependent | Yes | Yes (Team) | No (Hidden) |
| **Company Compliance & Reports** | Context-dependent | Yes | No (Hidden) | No (Hidden) |
| **Team Learning Reports** | Context-dependent | Yes | Yes (Team) | No (Hidden) |
| **Personal Dashboard & Courses** | Yes | Yes | Yes | Yes |

---

## 3. UI Controls Reconciliation Rules
1. **Zero UI-Backend Contradictions**: Action buttons (such as "Add Employee", "Assign Training", "Manage Settings") are hidden from non-permitted user roles via `hasCapability(user, capability)`.
2. **Server Enforcement**: Even if a user attempts to manually forge an HTTP request or navigate to a restricted URL, the server middleware (`requireCompanyAdmin`, `requirePlatformAdmin`) rejects the operation with `HTTP 403 Forbidden`.
