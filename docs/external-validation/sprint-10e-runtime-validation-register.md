# Sprint 10E Runtime Validation Register

## Executive Summary
This document records the runtime validation checks conducted for candidate registration, participation evidence review, activation readiness gates, controlled activation, and CSV intake.

---

## Runtime Check Log

| Workflow | Target Surface | Expected Result | Verified Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Candidate Lifecycle** | `POST /api/pilots/candidates` | Registers candidate in `PROSPECT` state | Created in DB | PASS |
| **Evidence Submission** | `POST /api/pilots/:id/evidence` | Submits confirmation details & sets status to `EVIDENCE_SUBMITTED` | Updated in DB | PASS |
| **Evidence Review** | `PATCH /api/pilots/:id/evidence/review` | Platform Admin accepts evidence (`evidenceStatus = "ACCEPTED"`) | Updated & logged | PASS |
| **Readiness Gate** | `POST /api/pilots/:id/readiness-gate` | Evaluates 16 backend readiness conditions | Returns structured report | PASS |
| **Guarded Activation** | `POST /api/pilots/:id/activate` | Requires readiness PASS, updates status to `ACTIVE`, logs audit | Guard active & logged | PASS |
| **CSV Learner Intake** | `POST /api/pilots/intake/csv` | Validates headers, rows, duplicates, & tenant isolation | Parsed & validated | PASS |
