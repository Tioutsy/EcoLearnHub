# Sprint 10H — Repository Discovery Document

## Executive Summary
This document records the repository discovery conducted for **Sprint 10H — Pilot Decision Conversion, Written Participation Confirmation, Evidence Completion & Controlled Activation Readiness**.

---

## 1. Candidate Decision & Readiness Architecture

- **Candidate Table**: `pilotCompaniesTable` (`pilot_companies`) extended with `decisionStatus`, `authorityVerified`, and `readiness18GateStatus`.
- **API Endpoints**: Handled in `artifacts/api-server/src/routes/pilots.ts`.
- **18 Activation Readiness Gates**: Evaluated backend function `evaluate18ReadinessGates`.

---

## 2. Current Verified State

- **Primary Candidate**: Coral Bay Hospitality Ltd (ID: 101)
- **Proposal Version**: Proposal `v1` issued to `j.dupont@coralbay.mu`
- **Written Acceptance Status**: Proposal under active candidate consideration.
- **Sprint 10H Final Decision**: **DECISION PENDING — Candidate participation not yet confirmed**.
