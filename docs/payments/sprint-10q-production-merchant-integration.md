# Sprint 10Q Production Merchant Integration Specification

## Executive Summary
This document records the merchant acquirer integration specification for **ELEVIO SKILLS**.

---

## 1. Concrete Selected Merchant Acquirer
- **Merchant Acquirer / Gateway**: Mauritius Native B2B Gateway Adapter (MCB Payment Gateway Services / MauCAS / Peach Payments).
- **Settlement Currency**: MUR (Mauritian Rupee).
- **Integration Model**: Hosted Payment Page Session with Server-to-Server Webhook Callback Verification.

---

## 2. Server-Authoritative Price & Band Verification

| Employee Band | Seat Range | Authoritative Monthly Price | Currency | Checkout Mode |
| :--- | :---: | :---: | :---: | :--- |
| **Up to 25** | 1–25 | **MUR 3,000** | MUR | Autonomous Self-Service |
| **26–50** | 26–50 | **MUR 4,500** | MUR | Autonomous Self-Service |
| **51–80** | 51–80 | **MUR 5,000** | MUR | Autonomous Self-Service |
| **81–120** | 81–120 | **MUR 6,250** | MUR | Autonomous Self-Service |
| **Over 120** | 121+ | **Tailored Quote** | MUR | Enterprise Contact Path |

---

## 3. Webhook Authentication & Idempotency Rules
1. **Signature Verification**: Server verifies `x-payment-webhook-secret === process.env.PAYMENT_WEBHOOK_SECRET`.
2. **Amount Integrity**: Settlement amount is checked against the database-backed price in `planPricesTable`.
3. **Idempotency**: Duplicate payment callbacks carrying previously processed `paymentReference` IDs return `200 OK` without duplicating subscription activations or data entries.
