# Sprint 10K — Repository Discovery Document (Access Control)

## Executive Summary
This document records the repository discovery conducted for **Sprint 10K — Role-Based Access Control, Administrator Discovery & Permission-Safe Interface Remediation**.

---

## 1. Auth & Role Architecture Overview

- **Authentication Provider**: Clerk (`@clerk/express`, `@clerk/react`).
- **Session Claim Bindings**: Public metadata `publicMetadata.role` and `publicMetadata.companyId`.
- **Database Employee Schema**: `employeesTable.role` (`admin`, `manager`, `employee`).
- **Access Resolution Middleware**: `getCompanyAccess` in `artifacts/api-server/src/lib/access.ts`.

---

## 2. Root Cause of Previous Frontend/Backend Mismatch

1. **Manager Over-Privileging in Backend**: In `access.ts`, `isCompanyAdminRole(claimRole)` included `"manager"`, causing `access.role` to evaluate to `company_admin` for manager claims.
2. **Unchecked UI Controls**: Frontend components like `CompanyEmployees` (`employees.tsx`) rendered `Add Employee` buttons without checking if the current user possessed the `employees.create` capability.
3. **Implicit Defaulting**: Unauthenticated or unlinked users fell back to demo company admin context, creating confusion when attempting backend mutation routes.
