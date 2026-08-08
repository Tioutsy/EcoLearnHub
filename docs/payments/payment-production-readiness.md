# Production Payment Readiness Checklist

## 1. Gateway & Operational Readiness

| Readiness Item | Status | Notes |
| :--- | :--- | :--- |
| **Server-Authoritative Pricing** | **VERIFIED** | Enforced via `planPricesTable`. Browser prices rejected. |
| **Subscription State Machine** | **VERIFIED** | Starts at `PENDING_PAYMENT`; transitions to `ACTIVE` upon verified confirmation. |
| **Entitlement Enforcer** | **VERIFIED** | `requireActiveCompanySubscription` blocks unpaid LMS access (`HTTP 402`). |
| **Tenant Isolation** | **VERIFIED** | Authenticated session ownership enforced on all billing endpoints (`HTTP 403`). |
| **Idempotent Webhooks** | **VERIFIED** | Duplicate payment references handled safely without duplicate records. |
| **Merchant Credentials** | **EXTERNAL DEPENDENCY** | Production acquirer credentials (e.g. MCB / Peach) required on live host. |
