# Payment Security Standard

## 1. Security Guidelines
1. **Server-Authoritative Pricing**: Browser-submitted prices are never trusted. All amounts are resolved server-side from `planPricesTable`.
2. **Replay & Tamper Protection**: Frontend success URLs alone cannot activate a subscription. Verification requires `POST /api/subscriptions/confirm-payment` with server authentication.
3. **Tenant Isolation**: Payment confirmation validates that the authenticated session owns the `companyId` being activated.
