# Selected Merchant Provider & Acquirer Status

## 1. Concrete Selected Merchant Route
- **Acquirer / Provider Name**: Mauritius Commercial Bank (MCB) Payment Gateway Services (Mastercard Payment Gateway Services / MPGS).
- **Merchant Application Status**: **CONTRACT IN PROGRESS / AWAITING ACQUIRER CREDENTIAL PROVISIONING**.
- **Test / Sandbox Availability**: Outbound adapter specification ready (`PaymentGatewayAdapter`). Production credentials on host environment outstanding.
- **Hosted Checkout Method**: MPGS Hosted Session / Redirect Page.
- **Callback / Webhook Mechanism**: Server-to-server webhook notification + transaction query endpoint (`x-payment-webhook-secret`).
- **Settlement Currency**: Mauritian Rupee (MUR).
- **Recurring-Payment Capability**: Merchant-supported but not yet implemented (Initial B2B contract creation operational).

---

## 2. Remaining Owner / Acquirer Actions
1. **Acquirer Credentials**: Provision production MPGS API credentials on the Render host environment (`MCB_MERCHANT_ID`, `MCB_API_PASSWORD`).
2. **Neon Console**: Rotate staging database password on the Neon dashboard.
3. **Clerk Dashboard**: Rotate backend secret key on the Clerk dashboard.
