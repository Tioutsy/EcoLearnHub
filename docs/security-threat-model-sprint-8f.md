# Security Threat Model — EcoLearnHub Sprint 8F

This threat model documents application security risks, existing controls, and mitigations for EcoLearnHub.

---

## 1. Threat Matrix

| Threat Category | Surface | Existing Control | Mitigation / Mitigation Status |
| :--- | :--- | :--- | :--- |
| **Tenant Isolation Breach** | Company API Routes | `getCompanyAccess()` verifies `companyId` claim | Active: Reject queries with cross-company `companyId` mismatch |
| **Role Escalation** | Admin API Routes | `requireCompanyAdmin()` & role checks | Active: Strictly enforce `company_admin` or `platform_admin` roles |
| **CSV Formula Injection** | Reports & Exports | Csv escaping helper (`'=`, `'+`, `'-`, `'@`) | Active: Escape spreadsheet formulas in CSV exports |
| **Unprotected Scheduler** | `/api/reminders/process` | `SCHEDULER_SECRET` header verification | Active: Rejects unauthenticated scheduler calls |
| **BOLA / IDOR** | Enrolments & Certificates | User/Company ownership checks | Active: Enforce learner ownership on certificate retrieval |
| **Excessive Log Leaks** | API Error Handlers | `sendHttpError()` hides stack traces in prod | Active: Sanitise error responses |
