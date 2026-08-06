# Controlled Production Company Register Standard (Sprint 10N)

## Executive Summary
This document specifies the persistent controlled-production company register and activation state machine.

---

## 1. Controlled Activation State Machine

```text
CANDIDATE
  │
  ▼
AWAITING_CONFIRMATION
  │
  ▼
PARTICIPATION_CONFIRMED
  │
  ▼
ORGANISATION_CREATED
  │
  ▼
ADMIN_ACTIVATED
  │
  ▼
EMPLOYEE_SETUP_IN_PROGRESS
  │
  ▼
COURSES_ASSIGNED
  │
  ▼
LEARNERS_ACTIVE
  │
  ▼
MONITORING
  │
  ▼
OPERATIONALLY_ACCEPTED
```
