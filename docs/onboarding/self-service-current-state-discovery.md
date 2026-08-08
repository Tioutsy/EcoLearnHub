# Self-Service Current State Discovery

## 1. Overview
This document evaluates the autonomous onboarding and subscription activation architecture for **ELEVIO SKILLS**.

---

## 2. Current Implementation Audit

| Component | Status | Implementation Details |
| :--- | :--- | :--- |
| **Pricing & Bands** | **Complete** | Up to 25 (MUR 3,000/mo), 26–50 (MUR 4,500/mo), 51–80 (MUR 5,000/mo), 81–120 (MUR 6,250/mo), >120 (Tailored Contact Path). |
| **Account Creation** | **Autonomous** | Handled via Clerk authentication. First user registering/subscribing automatically elevates to `COMPANY_ADMIN`. |
| **Organisation Creation** | **Autonomous** | Handled via `POST /api/company/subscribe` or `POST /api/company`. Automatically creates company record and binds user as `admin`. |
| **Headcount Enforcer** | **Server-Enforced** | `POST /api/company/employees` checks `maxEmployees` server-side and returns `403 Forbidden` if seat limit is reached. |
| **Employee Invitation** | **Autonomous** | `POST /api/company/invitations` generates unique invitation tokens with default `LEARNER` role. |
| **Payment Status** | **Manual/Scaffolded** | Payment endpoints exist (`POST /api/subscriptions/checkout`), but production payment gateway (e.g. MCB Juice / MauCAS / Stripe) is not yet connected to a live merchant account. |

---

## 3. Autonomous Journey Verification
For client organisations with up to 120 employees, the entire activation process operates without manual Platform Administrator intervention.
