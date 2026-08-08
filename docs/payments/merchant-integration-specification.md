# Merchant Gateway Integration Specification

## 1. Provider Integration Boundary

```
[Customer Checkout] -> [Elevio Server: POST /api/subscriptions/onboard]
                              |
                     (status: PENDING_PAYMENT)
                              |
                   [Merchant Acquiring Gateway]
                              |
                (Verified Server Webhook Callback)
                              |
                 [POST /api/subscriptions/confirm-payment]
                              |
                     (status: ACTIVE)
```

---

## 2. Server-Authoritative Price & Band Matrix

| Employee Band | Minimum Seats | Maximum Seats | Monthly Price | Settlement Currency | Flow Type |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Up to 25** | 1 | 25 | **MUR 3,000** | MUR | Automated Self-Service |
| **26–50** | 26 | 50 | **MUR 4,500** | MUR | Automated Self-Service |
| **51–80** | 51 | 80 | **MUR 5,000** | MUR | Automated Self-Service |
| **81–120** | 81 | 120 | **MUR 6,250** | MUR | Automated Self-Service |
| **Over 120** | 121 | ∞ | **Tailored Quote** | MUR | Custom Enterprise Contact |

---

## 3. Webhook Authentication & Idempotency Rules
1. **Header Validation**: Acquirer webhooks must supply `x-payment-webhook-secret` matching `process.env.PAYMENT_WEBHOOK_SECRET`.
2. **Amount Integrity**: The callback payload's settlement amount must match the server-resolved price in `planPricesTable`.
3. **Idempotency**: Webhook events carrying a previously confirmed `paymentReference` return `200 OK` without duplicating state changes.
