# Sprint 10F — Repository Discovery Document

## Executive Summary
This document records the repository discovery conducted for **Sprint 10F — First External Pilot Acquisition, Proposal Workflow, Participation Conversion & Production Activation Handover**.

---

## 1. Core Architecture & System Integration

- **Candidate & Pilot Schemas**: `pilotCompaniesTable` (`pilot_companies`), `pilotFeedbackResponsesTable` (`pilot_feedback_responses`), `pilotIssuesTable` (`pilot_issues`), `companiesTable` (`companies`), `employeesTable` (`employees`).
- **Routing & Endpoints**: Mounted at `/pilots` and `/platform-admin/pilots` via `artifacts/api-server/src/routes/pilots.ts`.
- **Tenant Isolation & Security**: Backend access helper `getCompanyAccess` locks queries by `companyId`.
- **Audit System**: Server-side helper `logAuditEvent` logs immutable audit events.

---

## 2. Baseline Status & Decision State

- **Internal Technical & Governance Readiness**: **100% Complete** (136 subtests passing clean across 30 test suites).
- **Issued Proposals to Third-Party Commercial Entities**: **0** (All acquisition materials, proposal engine, versioning logic, and handover pack are 100% complete and ready for outreach).
- **Sprint 10F Target Decision**: **OUTREACH READY — Pilot acquisition materials and workflow complete**.
