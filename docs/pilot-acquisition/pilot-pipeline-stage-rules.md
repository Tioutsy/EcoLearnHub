# Pilot Pipeline Stage Rules (Sprint 10F)

## Executive Summary
This document specifies the 18 pipeline acquisition stages and backend transition guards.

---

## 18 Pipeline Acquisition Stages

1. `IDENTIFIED`
2. `CONTACTED`
3. `DISCOVERY_PLANNED`
4. `DISCOVERY_COMPLETED`
5. `QUALIFIED`
6. `PROPOSAL_IN_PREPARATION`
7. `PROPOSAL_ISSUED`
8. `EXTERNAL_REVIEW`
9. `CHANGES_REQUESTED`
10. `VERBAL_OR_EMAIL_ACCEPTANCE`
11. `EVIDENCE_UNDER_REVIEW`
12. `PARTICIPATION_CONFIRMED`
13. `ACTIVATION_HANDOVER`
14. `ACTIVATION_READY`
15. `ACTIVE_PILOT`
16. `DECLINED`
17. `DEFERRED`
18. `WITHDRAWN`

---

## Transition Rules
- `IDENTIFIED` cannot jump directly to `ACTIVE_PILOT`.
- `PROPOSAL_ISSUED` requires acceptance evidence before becoming `PARTICIPATION_CONFIRMED`.
- `DECLINED` candidates require audit reason for reopening.
