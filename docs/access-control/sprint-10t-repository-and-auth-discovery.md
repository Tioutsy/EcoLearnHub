# Sprint 10T — Repository and Auth Discovery

## 1. Executive Summary
This document establishes the architecture baseline for **Sprint 10T — Role-Based Access Control, Permission Visibility, Administrator Experience Reconciliation & Cross-Tenant Security Verification**.

---

## 2. Authentication & Session Architecture
- **Auth Provider**: Clerk React (`@clerk/react`) on frontend, `@clerk/express` & custom session parser (`artifacts/api-server/src/lib/access.ts`) on backend API.
- **Session Claim Structure**: Claims resolve `publicMetadata.role` (`platform_admin` | `company_admin` | `manager` | `employee`) and `publicMetadata.companyId`.
- **Database Context Resolution**: `getCompanyAccess(req)` checks `clerkUserId` and email matching against `employeesTable` to enforce tenant isolation.

---

## 3. Discovered Roles & Capabilities
- **`platform_admin`**: Universal system administrative access across multi-tenant overview, global catalogue, sector mappings, and system diagnostics.
- **`company_admin`**: Full organisation management including employee creation, bulk import, course assignments, company compliance reporting, and org settings.
- **`manager`**: Team-scoped visibility into team progress, team course assignment, team challenge reviews, and team exports. Restricted from employee creation and org settings.
- **`employee` / `learner`**: Individual learning dashboard, course player, quiz completion, commitment logging, and personal certificate downloads.

---

## 4. Permission Helpers & Boundary Guards
- **Frontend Capability Checker**: `src/lib/authHelpers.ts` (`hasCapability(user, capability)`).
- **Backend Access Enforcement**: `artifacts/api-server/src/lib/access.ts` (`hasCapability(role, capability)`, `requireCompanyAdmin(req)`, `requirePlatformAdmin(req)`, `requireSameCompanyEmployee(req, employeeId)`).
