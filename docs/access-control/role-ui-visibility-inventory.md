# Role UI Visibility Inventory

## 1. Executive Summary
This inventory records the visibility rules applied across frontend UI components to prevent non-admin roles from encountering misleading action buttons or permission errors.

---

## 2. Component Visibility Audit

| Component / UI Element | Route Path | Target Capability | Visible To Roles | Hidden From Roles | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **"Add Employee" Button** | `/company/employees` | `employees.create` | Company Admin, Platform Admin | Manager, Learner | Hidden |
| **"Assign Training" Button** | `/company/employees` | `courses.assign` | Company Admin, Manager, Platform Admin | Learner | Hidden |
| **"Company Settings" Card** | `/company` | `settings.organisation` | Company Admin, Platform Admin | Manager, Learner | Hidden |
| **"Subscription & Billing"**| `/company/subscribe` | `settings.organisation` | Company Admin, Platform Admin | Manager, Learner | Hidden |
| **"Export Report" Actions** | `/company/reports` | `reports.team` | Company Admin, Manager, Platform Admin | Learner | Hidden |
| **"Platform Admin" Link** | Header Navigation | `platform.admin` | Platform Admin | Company Admin, Manager, Learner | Hidden |

---

## 3. UI Rule Enforcement Standard
If a user role lacks a capability:
1. Controls are **hidden completely** from navigation and headers to preserve UX clarity.
2. Direct navigation to restricted URLs displays a clean bilingual access boundary notice ("Vous n’avez pas l’autorisation d’accéder à cette section").
