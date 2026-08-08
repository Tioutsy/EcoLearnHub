# Self-Service Activation Acceptance Report

## Executive Summary
This document provides final acceptance results for **Sprint — End-to-End Self-Service Client Signup, Subscription Activation, Company Admin Setup & First Training Launch**.

---

## 1. Acceptance Checklist

- [x] Companies ≤120 seats can register autonomously without owner intervention.
- [x] Organisation is created automatically upon registration/subscription.
- [x] First account becomes `COMPANY_ADMIN` automatically.
- [x] Company Admin can access own setup dashboard.
- [x] Company Admin can add individual employees.
- [x] Employee invitations assign `LEARNER` role by default.
- [x] Company Admin can assign courses/training.
- [x] Learner can open assigned training and complete lessons.
- [x] Training progress is visible to Company Admin.
- [x] New organisations automatically appear in Platform Admin registry (`/platform-admin/organisations`).
- [x] Employee-band limit (`maxEmployees`) is enforced server-side.
- [x] Duplicate email registration is prevented.
- [x] Cross-tenant isolation verified (Company Alpha vs Company Beta).

---

## 2. Payment Status Assessment

### Payment Integration Status:
**BLOCKED — PRODUCTION PAYMENT PROVIDER/INTEGRATION NOT YET AVAILABLE**

*Note: Payment endpoints exist (`POST /api/subscriptions/checkout`), but live merchant account integration (e.g. MCB Juice, MauCAS, or live B2B gateway) is not connected. All account creation, organisation setup, seat enforcement, and training assignment flows function completely autonomously.*

---

## 3. Final Decision

**CONDITIONAL PASS — SELF-SERVICE ACTIVATION VERIFIED EXCEPT PRODUCTION PAYMENT GATE**
