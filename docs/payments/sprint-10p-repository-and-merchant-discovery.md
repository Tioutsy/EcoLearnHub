# Sprint 10P Repository & Merchant Discovery Report

## Executive Summary
This document records the repository inspection and merchant gateway integration findings for **ELEVIO SKILLS** at baseline commit `20e366f`.

---

## 1. Verified Architecture & Hosting Baseline
- **Application Repository**: `Tioutsy/EcoLearnHub` (`main` branch).
- **Backend API Engine**: Node.js / Express bundle in `artifacts/api-server/src/index.ts`.
- **Database Layer**: Neon PostgreSQL via Drizzle ORM (`@workspace/db`).
- **Authentication**: Clerk Authentication (`@clerk/express`).
- **Deployment Targets**: Render API Server (`eco-learn-hub-api-server.onrender.com`) & Custom Domain Frontend (`ecolearnhub.com`).

---

## 2. Payment Gateway Integration & Provider Boundary
- **Current Payment Boundary**: Provider-neutral adapter boundary (`PaymentGatewayAdapter`) separating subscription state transitions from merchant acquiring APIs.
- **Provider Status**: Standard subscriptions ≤120 seats create records with `status: "PENDING_PAYMENT"`. Server-verified payment confirmation (`POST /api/subscriptions/confirm-payment`) requires `PLATFORM_ADMIN` authorization or a cryptographically signed server-to-server webhook header (`x-payment-webhook-secret === process.env.PAYMENT_WEBHOOK_SECRET`).
- **Merchant Acquirer Status**: Provisioning of live merchant account credentials (e.g. MCB Juice / MauCAS / Peach Payments) on the host environment remains an **external production dependency**.
