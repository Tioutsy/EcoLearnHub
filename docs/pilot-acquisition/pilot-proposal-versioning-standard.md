# Pilot Proposal Versioning Standard (Sprint 10F)

## Executive Summary
This document specifies the proposal versioning rules and proposal status state machine.

---

## Proposal State Machine

- `DRAFT`: Proposal payload created by Elevio owner (`v1`).
- `INTERNAL_REVIEW`: Proposal under review by Platform Admin.
- `APPROVED_FOR_ISSUE`: Proposal approved for external issue.
- `ISSUED`: Proposal delivered to candidate organisation.
- `ACCEPTED`: Candidate accepts proposal; triggers participation conversion.
- `DECLINED`: Candidate declines proposal.
- `EXPIRED`: Proposal validity window (30 days) lapsed.

---

## Versioning Rules
Any material change to learner count, duration, assigned courses, or legal terms increments the version (`v1` -> `v2` -> `v3`). Issued proposals are never overwritten silently.
