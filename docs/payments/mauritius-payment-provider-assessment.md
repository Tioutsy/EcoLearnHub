# Mauritius Payment Provider Assessment

## 1. Provider Comparison Matrix

| Provider | Mauritius Merchant Support | MUR Support | Hosted Checkout | API / SDK | Server Verification | Recurring | Status |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MCB Juice / B2B Transfer** | **Native (Mauritius #1)** | Yes (MUR) | Yes (Juice / Direct) | Bank API / Reference | Yes (Server-verified ref) | Monthly Invoice | **PREFERRED FOR B2B** |
| **MauCAS / SBM Instant** | **Native** | Yes (MUR) | QR / Direct Pay | Bank Gateway | Yes (Server ref) | Instant Pay | **COMPATIBLE** |
| **Peach Payments Mauritius** | Supported | Yes (MUR) | Yes | Node.js SDK | Yes (Webhooks) | Supported | **GATEWAY CANDIDATE** |
| **Stripe** | Requires International Entity | Limited MUR | Yes | Node.js SDK | Yes (Webhooks) | Supported | **REQUIRES EXPORT ENTITY** |

---

## 2. Recommendation for Mauritius B2B SaaS
In Mauritius, corporate subscriptions (MUR 3,000 to MUR 6,250/mo) are primarily settled via **MCB Juice B2B Instant Transfer** or **Bank Direct Debits**. The platform enforces server-side verification using `POST /api/subscriptions/confirm-payment` requiring a valid transaction reference.
