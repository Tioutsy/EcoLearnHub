# Sprint 10O Payment Architecture Discovery

## 1. Current Architecture Overview
- **Onboarding Route**: `POST /api/subscriptions/onboard` creates company records in `companiesTable` and initial subscription rows in `companySubscriptionsTable` with `status: "PENDING_PAYMENT"`.
- **Admin Elevation**: Registering user is automatically elevated to `COMPANY_ADMIN` (`role: "admin"`) in `employeesTable`.
- **Payment Confirmation**: `POST /api/subscriptions/confirm-payment` requires `PLATFORM_ADMIN` authentication or a verified server webhook header (`x-payment-webhook-secret === process.env.PAYMENT_WEBHOOK_SECRET`) to transition `status: "PENDING_PAYMENT" -> "ACTIVE"`.
- **Entitlement Guard**: `requireActiveCompanySubscription` (`access.ts`) blocks unpaid companies from paid LMS actions (`HTTP 402 Payment Required`).

---

## 2. Gateway Integration Boundary
- Elevio Skills features a provider-neutral payment boundary adapter (`PaymentGatewayAdapter`) separating core subscription business logic from merchant acquirers.
