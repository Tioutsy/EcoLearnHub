# Authorisation Matrix — EcoLearnHub Protected Endpoints

This document maps all protected API routes to required roles, tenant isolation rules, and scope requirements.

---

## 1. Protected Route Matrix

| Route Group | Path | Allowed Roles | Scope Rule |
| :--- | :--- | :--- | :--- |
| **Company Admin** | `GET /api/companies/admin-overview` | `company_admin`, `platform_admin` | Restricted to requester's `companyId` |
| **Employee Management**| `POST /api/companies/employees/import` | `company_admin`, `platform_admin` | Employee band capacity enforced |
| **Department Management**| `POST /api/companies/departments` | `company_admin`, `platform_admin` | Scoped to company |
| **Training Interventions**| `GET /api/analytics/manager/interventions` | `manager`, `company_admin`, `platform_admin` | Scoped to manager department |
| **Learner Commitments** | `GET /api/analytics/learner/commitments` | `employee`, `company_admin` | Restricted to learner's own records |
| **Notification Logs** | `GET /api/companies/notification-logs` | `company_admin`, `platform_admin` | Scoped to company |
| **Scheduler Process** | `POST /api/reminders/process` | System Secret | Verified by `SCHEDULER_SECRET` header |
| **Platform Diagnostics** | `GET /api/platform-admin/diagnostics` | `platform_admin` | Restricted to platform administrators |
