# Sprint 10P Current Payment Architecture

## 1. Verified Subscription & Payment Flow

```
[Customer Onboarding / Subscribe] -> [POST /api/subscriptions/onboard]
                                           |
                                 (status: PENDING_PAYMENT)
                                           |
                               [Acquirer Merchant Gateway]
                                           |
                           (Verified Server Webhook Callback)
                                           |
                              [POST /api/subscriptions/confirm-payment]
                                           |
                                  (status: ACTIVE)
```

---

## 2. Security Guards & Entitlement Controls
- **Server-Authoritative Pricing**: Resolved directly from `planPricesTable`. Browser-submitted prices are ignored and rejected.
- **Entitlement Enforcer**: Unpaid companies (`status: PENDING_PAYMENT`) attempting paid LMS operations are blocked server-side via `requireActiveCompanySubscription` (**HTTP 402 Payment Required**).
- **Callback Verification**: Client-controlled self-activation calls are blocked with **HTTP 403 Forbidden**. Activation requires a signed header (`x-payment-webhook-secret === process.env.PAYMENT_WEBHOOK_SECRET`) or a `platform_admin` session.
