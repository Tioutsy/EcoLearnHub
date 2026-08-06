# Sprint 10G — Repository Discovery Document

## Executive Summary
This document records the repository discovery conducted for **Sprint 10G — First Live Pilot Outreach Execution, Candidate Engagement, Proposal Issuance & Participation Confirmation**.

---

## 1. Candidate & Acquisition Architecture

- **Pilot Candidate Table**: Extended `pilotCompaniesTable` (`pilot_companies`) with `candidateStatus`, `qualificationStatus`, `proposalStatus`, `evidenceStatus`, `readinessGateStatus`, `outreachStatus`, `legitimacyVerified`, and `candidateDesignation`.
- **API Endpoints**: Handled in `artifacts/api-server/src/routes/pilots.ts`.
- **Security & Audit**: Multi-tenant access locked by `companyId` via `getCompanyAccess` and audit logged via `logAuditEvent`.

---

## 2. Execution Baseline

- **Candidate Acquisition Infrastructure**: 100% active and backend-enforced.
- **Candidate Written Confirmation Status**: Outreach activity is underway; no third-party written participation agreement has yet been received.
- **Sprint 10G Final Decision**: **OUTREACH ACTIVE — Participation not yet confirmed**.
