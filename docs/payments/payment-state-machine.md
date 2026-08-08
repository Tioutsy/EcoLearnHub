# Payment State Machine Standard

## 1. Authoritative State Machine

```
[Onboarding Request] -> Subscription State: PENDING_PAYMENT
                               |
                   [Server Payment Verification]
                               |
                               v
                  Subscription State: ACTIVE
```

### Supported States:
- `PENDING_PAYMENT`: Initial state upon company onboarding. LMS paid functionality restricted.
- `ACTIVE`: Server-verified payment received. Full LMS training and access enabled.
- `PAYMENT_FAILED`: Payment transaction failed.
- `SUSPENDED`: Administrative lock due to non-payment.
- `PENDING`: Tailored quote request for >120 employees.

---

## 2. Server Rule
A standard paid subscription **cannot** transition to `ACTIVE` until `POST /api/subscriptions/confirm-payment` validates a legitimate payment transaction reference.
