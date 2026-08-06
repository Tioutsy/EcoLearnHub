# Real Pilot Candidate Register Standard (Sprint 10E)

## Executive Summary
This document specifies the candidate register fields and state machine governing potential external pilot organisations.

---

## Candidate State Machine

| Candidate Status | Description | Allowed Next Statuses | Backend Guard |
| :--- | :--- | :--- | :---: |
| `PROSPECT` | Candidate organisation identified | `CONTACTED`, `ON_HOLD`, `DECLINED` | Initial State |
| `CONTACTED` | Outreach logged | `DISCOVERY_SCHEDULED`, `INTEREST_CONFIRMED`, `DECLINED` | Outreach log required |
| `DISCOVERY_SCHEDULED` | Meeting or call booked | `INTEREST_CONFIRMED`, `DECLINED` | Meeting date required |
| `INTEREST_CONFIRMED` | Company expresses interest | `TERMS_SENT`, `WITHDRAWN` | Contact details required |
| `TERMS_SENT` | Pilot proposal delivered | `TERMS_ACCEPTED`, `DECLINED` | Terms version required |
| `TERMS_ACCEPTED` | Scope & terms accepted | `ACTIVATION_READY` | Evidence accepted |
| `ACTIVATION_READY` | All 16 gate conditions pass | `ACTIVE` | Gate evaluation PASS |
| `ACTIVE` | Pilot access live | `COMPLETED`, `PAUSED`, `WITHDRAWN` | Activation timestamp set |
| `COMPLETED` | 4-week pilot period finished | `CONVERTED`, `ARCHIVED` | Completion metrics logged |
| `CONVERTED` | Paid contract signed | `ARCHIVED` | Commercial agreement |

---

## System Rule
Direct status transitions from `PROSPECT` to `ACTIVE` or `COMPLETED` are blocked server-side and trigger HTTP 400 validation errors.
