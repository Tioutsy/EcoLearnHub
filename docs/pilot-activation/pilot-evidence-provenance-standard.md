# Pilot Evidence Provenance Standard (Sprint 10I)

## Executive Summary
This document specifies evidence checksum hashing, storage references, reviewer timestamps, and evidence status lifecycle (`PENDING_REVIEW` .. `SUPERSEDED`).

---

## Provenance Fields

- `evidenceId`: Unique evidence string identifier (e.g. `ev_101_v1`).
- `sha256Checksum`: Cryptographic hash of uploaded file content.
- `status`: `PENDING_REVIEW` | `VALID` | `INVALID` | `SUPERSEDED` | `WITHDRAWN`.
- `reviewedBy`: Internal reviewer user ID.
- `reviewedAt`: ISO 8601 timestamp of validation review.
