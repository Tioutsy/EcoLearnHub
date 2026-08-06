# Pilot Support and Incident Process (Sprint 10B)

## Executive Summary
This document establishes the support categories, severity levels, escalation procedures, and incident handling protocols for controlled external pilots.

---

## 1. Support Categories & Severity Matrix

| Severity | Definition | Response Target | Example | Escalation Path |
| :--- | :--- | :---: | :--- | :--- |
| **Critical (P0)** | Suspected cross-tenant data exposure, security compromise, platform down | 2 Hours | Cross-tenant data leakage or login outage | Direct to Technical Lead & Platform Admin |
| **High (P1)** | Pilot-blocking issue affecting multiple users in a company | 4 Hours | Course player failing to load or quiz completion blocked | Technical Support Lead |
| **Medium (P2)** | Significant functional defect with an available workaround | 12 Hours | Report export formatting glitch or certificate typo | Support Specialist |
| **Low (P3)** | Minor usability, copy, or UI layout suggestion | 24 Hours | Text alignment or minor French wording improvement | Customer Success Manager |

---

## 2. Incident Escalation & Response Workflow

1. **Receipt & Classification**: Ticket logged via `/support` or email; classified by severity.
2. **Containment**: For Critical (P0) incidents, the affected route or company access is temporarily restricted to prevent data loss or unauthorized access.
3. **Investigation & Root Cause Analysis**: Logs and DB entries inspected using tenant-scoped diagnostics.
4. **Remediation & Testing**: Hotfix deployed to staging/production and verified via automated test suite.
5. **Closure & Reporting**: Formal incident post-mortem provided to the affected pilot company administrator within 48 hours.
