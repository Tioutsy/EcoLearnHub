# Payment Readiness Gap Report

## 1. Executive Summary
This document analyzes the current payment gateway architecture and identifies commercial launch payment readiness gaps for **ELEVIO SKILLS**.

---

## 2. Existing Payment Implementation Audit

| Audit Area | Findings | Status |
| :--- | :--- | :--- |
| **Code Implementation** | Endpoints exist in `subscriptions.ts` (`POST /api/subscriptions/onboard`, `GET /api/subscriptions/public-plans`). Server-side pricing resolution is enforced. | **SCAFFOLDED** |
| **Payment Provider Dependency** | Server-side logic supports both standard B2B invoice billing and online gateway checkout (e.g., MCB Juice, MauCAS, or Stripe). | **PROVIDER UNCONNECTED** |
| **Production Credentials** | No live production payment merchant keys (`MCB_MERCHANT_KEY` or `STRIPE_SECRET_KEY`) are configured in the environment. | **UNAVAILABLE** |
| **Mauritius Suitability** | Standard MUR pricing (MUR 3,000 to MUR 6,250/mo) is active in database tables. B2B bank transfers (MCB / SBM / ABSA) are standard in Mauritius. | **VERIFIED** |
| **Subscription Activation** | Standard plans (≤120 seats) set `status = "ACTIVE"`. Tailored quotes (>120 seats) set `status = "PENDING"`. | **IMPLEMENTED** |

---

## 3. Commercial Blocker Classification

### **PAYMENT ONLY BLOCKER**
- All client onboarding flows—from band selection and organisation creation to `COMPANY_ADMIN` assignment, employee invitations, seat headcount limits, and course completion—operate 100% autonomously.
- Live automated credit card / Juice payment gateway integration is the **sole remaining commercial launch gate**.
