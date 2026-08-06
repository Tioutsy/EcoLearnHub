# Company Onboarding State Machine (Sprint 10L)

## Executive Summary
This document specifies the official company-onboarding state machine, permitted transitions, and activation criteria.

---

## 1. State Progression

```text
DRAFT
  │
  ▼
PENDING_ADMIN_INVITATION
  │
  ▼
ADMIN_INVITED
  │
  ▼
ADMIN_INVITATION_ACCEPTED
  │
  ▼
ORGANISATION_SETUP_IN_PROGRESS
  │
  ▼
READY_FOR_EMPLOYEE_SETUP
  │
  ▼
READY_FOR_COURSE_ASSIGNMENT
  │
  ▼
ACTIVE
```

---

## 2. Activation Criteria Gate
An organisation MAY NOT transition to `ACTIVE` until:
1. Internal company tenant record exists.
2. Verified primary administrator assigned with `company_admin` role.
3. Mandatory company profile fields (name, industry, country) populated.
4. Active subscription employee band configured.
5. First employee invited or added.
6. First course assignment created.
