# Role Runtime Walkthrough

## 1. Executive Summary
This document records the manual browser runtime walkthrough conducted across all 4 system roles to verify UI visibility and route boundary protection.

---

## 2. Walkthrough Results by Role

### 1. Platform Administrator (`platform_admin`)
- **Navigation**: Platform Admin link visible in header.
- **Access**: Accesses `/platform-admin`, `/platform-admin/courses`, `/platform-admin/subscriptions`.
- **Experience**: Clean multi-company oversight without layout errors.

### 2. Company Administrator (`company_admin`)
- **Navigation**: Header displays badge `Company Administrator`.
- **Access**: Accesses `/company`, `/company/employees`, `/company/reports`, `/company/subscribe`.
- **Action Verification**: "Add Employee" button opens modal cleanly. Bulk import, employee editing, and course assignment function predictably.
- **Boundary**: Direct navigation to `/platform-admin` redirects with access boundary notice.

### 3. Manager (`manager`)
- **Navigation**: Header displays badge `Manager`.
- **Access**: Accesses `/company`, `/company/reports` (Team scope), `/company/challenges-review`.
- **Action Verification**: "Add Employee" and "Company Settings" cards hidden. Direct navigation to `/company/employees` displays access boundary notice.

### 4. Learner (`employee`)
- **Navigation**: Header displays badge `Learner`.
- **Access**: Accesses `/dashboard`, `/learn/:id`, `/certificates`.
- **Action Verification**: All admin/manager action buttons hidden. Direct URL access to `/company/employees` displays access boundary notice.
