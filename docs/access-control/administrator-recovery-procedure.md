# Administrator Recovery Procedure (Sprint 10K)

## Executive Summary
This document specifies the administrator recovery runbook for locked-out or orphaned subscribing organisations.

---

## 1. Recovery Workflow
1. **Request Intake**: Written request received from authorized company signatory.
2. **Identity Verification**: Platform Admin verifies domain ownership and signatory authority.
3. **Admin Appointment**: Platform Admin assigns new `company_admin` role to designated user.
4. **Audit Logging**: Mandatory immutable audit log entry (`company.admin_recovered`) recorded.
