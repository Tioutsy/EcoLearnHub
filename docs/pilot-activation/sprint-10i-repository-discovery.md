# Sprint 10I — Repository Discovery Document

## Executive Summary
This document records the repository discovery conducted for **Sprint 10I — Written Pilot Acceptance Conversion, Evidence-Locked Activation, Learner Onboarding & Day-0 Launch Control**.

---

## 1. Candidate Identity & Discovery

- **Primary Candidate**: Coral Bay Hospitality Ltd (ID: 101)
- **Primary Contact**: Jean Dupont (Group Sustainability Manager)
- **Proposal Status**: `ISSUED` (Proposal `v1`)
- **Written Acceptance Status**: Proposal under active candidate review. No formal external acceptance document received.
- **Sprint 10I Final Decision**: **ACTIVATION BLOCKED — Required evidence or readiness conditions remain outstanding**.

---

## 2. Activation Architecture & Controls

- **Activation Lock**: Enforced server-side. `acceptanceValidated = false` blocks learner invitation, account provisioning, and course activation.
- **Dry-Run Service**: `POST /api/pilots/:id/activation/dry-run` allows non-mutating pre-activation validation.
- **18-Gate Readiness Evaluator**: `evaluatePilotActivationReadiness()` requires explicit written evidence for Gate 4.
