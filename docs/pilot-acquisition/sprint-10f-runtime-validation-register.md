# Sprint 10F Runtime Validation Register

## Executive Summary
This document records the runtime validation checks conducted for candidate qualification, proposal generation, proposal versioning, proposal issuing, proposal acceptance, and activation handover generation.

---

## Runtime Check Log

| Workflow | Target Surface | Expected Result | Verified Result | Status |
| :--- | :--- | :--- | :--- | :---: |
| **Candidate Qualification** | `POST /api/pilots/:id/qualification` | Evaluates 12 qualification criteria & returns score | Returns score & decision | PASS |
| **Proposal Generation** | `POST /api/pilots/:id/proposals` | Generates bilingual proposal payload (`v1`) | Generated in DB/API | PASS |
| **Proposal Versioning** | `POST /api/pilots/:id/proposals` | Increments version on material change (`v1` -> `v2`) | Version incremented | PASS |
| **Proposal Issuing** | `POST /api/pilots/:id/proposals/:v/issue` | Sets status to `ISSUED` & logs audit event | Updated & logged | PASS |
| **Proposal Acceptance** | `POST /api/pilots/:id/proposals/:v/accept` | Sets status to `ACCEPTED` & reconciles evidence | Updated & converted | PASS |
| **Activation Handover** | `GET /api/pilots/:id/handover` | Returns internal activation handover pack payload | Payload generated | PASS |
