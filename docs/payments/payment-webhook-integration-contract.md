# Payment Webhook Integration Contract

## 1. Webhook Security Contract
1. **Signature Header**: Incoming webhook requests must include a valid HMAC payload signature header (`x-payment-webhook-secret`).
2. **Idempotency**: Webhook events carrying a previously processed transaction ID return `200 OK` without duplicating state changes.
3. **Payload Structure**:
   ```json
   {
     "eventId": "evt_12345",
     "companyId": 10,
     "amountMUR": 4500,
     "paymentReference": "MCB_J_998822",
     "status": "CONFIRMED"
   }
   ```
