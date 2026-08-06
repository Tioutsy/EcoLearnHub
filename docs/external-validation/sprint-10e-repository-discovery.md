# Sprint 10E — Repository Discovery Document

## Executive Summary
This document records the mandatory repository discovery conducted for **Sprint 10E — First Real External Pilot Activation, Contracting Gate, Evidence Intake & Live-Data Integrity**.

---

## 1. Verified Core Architecture

- **Database Schemas**: `pilotCompaniesTable` (`pilot_companies`), `pilotFeedbackResponsesTable` (`pilot_feedback_responses`), `pilotIssuesTable` (`pilot_issues`), `companiesTable` (`companies`), `employeesTable` (`employees`), `auditLogsTable` (`audit_logs`).
- **Routing & Endpoints**: Mounted at `/pilots` and `/platform-admin/pilots` via `artifacts/api-server/src/routes/pilots.ts`.
- **Tenant Isolation**: Backend access helper `getCompanyAccess` locks all queries by `companyId`.
- **Audit System**: Server-side helper `logAuditEvent` writes immutable audit entries to `audit_logs`.

---

## 2. Validation Status & Decision Baseline

- **Internal Technical Validation**: **100% Complete** (118 subtests passing clean across 24 test suites).
- **Confirmed Real External Pilot Participants**: **0** (Awaiting formal third-party commercial entity participation confirmation).
- **Sprint 10E Baseline Decision**: **READY TO ACTIVATE — Awaiting confirmed external pilot participation**.
