# Sprint — Platform Admin Architecture Discovery

## 1. Executive Summary
This document defines the baseline architecture discovery for the **Platform Administrator / Super Admin layer** of ELEVIO SKILLS.

---

## 2. Authentication & Authorization Sources of Truth
- **Auth Engine**: Clerk React (`@clerk/react`) on frontend, `@clerk/express` and session resolver in `artifacts/api-server/src/lib/access.ts`.
- **Role persistance**:
  1. Clerk User Public Metadata (`publicMetadata.role`: `"platform_admin"` | `"super_admin"` | `"company_admin"` | `"manager"` | `"employee"`).
  2. Database Employee Table (`employeesTable.role`: `"admin"` | `"manager"` | `"employee"`).
  3. Bootstrap / Owner Email Fallback: Email `slennon2206@gmail.com` is recognized by server security guards (`getCompanyAccess` & `requirePlatformAdmin`) as `PLATFORM_ADMIN`.

---

## 3. Discovered Roles & Access Boundaries

| Role | Access Scope | Backend Guard |
| :--- | :--- | :--- |
| **`PLATFORM_ADMIN`** | Universal platform oversight, client organisation registry, global user directory, platform activity, health warnings | `requirePlatformAdmin(req)` |
| **`COMPANY_ADMIN`** | Single tenant administration (employee management, course assignment, company reporting, settings) | `requireCompanyAdmin(req)` |
| **`MANAGER`** | Team-scoped visibility and assignments within single tenant | `getCompanyAccess(req)` |
| **`LEARNER`** | Personal learning dashboard, course player, quiz completion, own certificates | `getCompanyAccess(req)` |

---

## 4. API & Route Guard Integrity
- Server-side enforcement using `requirePlatformAdmin(req)` in [access.ts](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/api-server/src/lib/access.ts).
- Direct HTTP endpoints under `/api/platform-admin/*` reject non-platform admin requests with `403 Forbidden`.
