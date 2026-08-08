# Subscription Activation Path Inventory

## 1. Inventory Matrix

| File | Route / Function | Authorization Requirement | Evidence Required | Audit Logging | Environment |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `subscriptions.ts` | `POST /api/subscriptions/confirm-payment` | `platform_admin` OR Webhook Signature | Valid `paymentReference` | Yes | Production & Webhook |
| `subscriptions.ts` | `PATCH /api/subscriptions/admin/:companyId` | `platform_admin` | Admin override request | Yes | Platform Admin |

---

## 2. Protected Execution Rules
- **No Direct Client Self-Activation**: `COMPANY_ADMIN`, `MANAGER`, or `LEARNER` accounts calling `/confirm-payment` are rejected with **HTTP 403 Forbidden**.
- **No Unpaid Access**: Unpaid subscriptions (`status: PENDING_PAYMENT`) cannot unlock LMS course assignments or certifications.
