# Payment Architecture Discovery

## 1. Existing Architecture Findings
- **Routes**: `subscriptions.ts` exposes public pricing (`GET /api/subscriptions/public-plans`), onboarding requests (`POST /api/subscriptions/onboard`), and admin list endpoints (`GET /api/subscriptions/admin/list`).
- **Defect Identified**: Previously, `POST /api/subscriptions/onboard` set `status: "ACTIVE"` immediately upon onboarding submission without verifying payment confirmation.
- **Fix Applied**: `POST /api/subscriptions/onboard` now creates standard subscriptions with `status: "PENDING_PAYMENT"`. A new endpoint `POST /api/subscriptions/confirm-payment` requires server-side payment verification before setting `status: "ACTIVE"`.

---

## 2. Subscription & Payment Tables
- `companySubscriptionsTable`: Tracks `companyId`, `subscriptionPlanId`, `employeeBandId`, `status` (`PENDING_PAYMENT`, `ACTIVE`, `PENDING`, `CANCELLED`), `agreedMonthlyAmount`, and `pricingSource`.
- `planPricesTable`: Stores server-authoritative monthly prices in MUR for employee bands.
