# Production Baseline Document

## 1. Frozen Baseline Information
- **Git Commit SHA**: `6e72396` (and subsequent docs commit)
- **Application Repository**: `Tioutsy/EcoLearnHub` (`main` branch)
- **Workspace Build Result**: `PASS` (0 typecheck errors, clean Vite & Node bundle output)
- **Active Course Count**: 15 Production Courses (ELH-01 through ELH-15)
- **Total Router Entries**: 35 `<Route>` declarations
- **Core Customer Routes**: 11 Primary User Journey Routes

---

## 2. Commercial Pricing & Role Baseline
- **Up to 25 employees**: MUR 3,000 / month
- **26–50 employees**: MUR 4,500 / month
- **51–80 employees**: MUR 5,000 / month
- **81–120 employees**: MUR 6,250 / month
- **>120 employees**: Tailored quote request path

---

## 3. Commercial Security Baseline
- **Payment State**: Standard onboarding creates subscriptions with `status: "PENDING_PAYMENT"`.
- **Entitlement Enforcer**: Unpaid companies blocked from paid LMS actions via `requireActiveCompanySubscription` (`HTTP 402`).
- **Payment Confirmation**: Restricted to `PLATFORM_ADMIN` manual reconciliation or verified webhook signatures (`x-payment-webhook-secret`).
