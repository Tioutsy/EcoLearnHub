# Pilot Activation Recovery Runbook (Sprint 10I)

## Executive Summary
This document defines failure recovery procedures (`SAFE_TO_RETRY`, `MANUAL_REVIEW_REQUIRED`, `ROLLBACK_REQUIRED`).

---

## Recovery Classifications

1. `SAFE_TO_RETRY`: Idempotent retry triggered when temporary network error occurs during email dispatch.
2. `MANUAL_REVIEW_REQUIRED`: Triggered when learner CSV intake contains conflicting department codes.
3. `ROLLBACK_REQUIRED`: Database transaction rolled back safely when company membership insertion fails.
