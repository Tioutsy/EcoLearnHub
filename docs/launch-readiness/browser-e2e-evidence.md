# Browser E2E Acceptance Evidence Log

## 1. Journey Execution Log

### Journey A — Prospect (Autonomous Onboarding)
- **Route Sequence**: `/` -> `/pricing` -> `/company/subscribe?planCode=PROFESSIONAL&bandCode=UP_TO_25` -> `/company`
- **Result**: `PASS`. Selected band survived registration; company created with `maxEmployees = 25`. Unpaid subscription initialized with `status: PENDING_PAYMENT`.

### Journey B — Active Company Administrator
- **Route Sequence**: `/sign-in` -> `/company` -> `/company/employees` -> `/company/reports`
- **Result**: `PASS`. Company admin provisioned employees, assigned training courses, and verified live completion metrics.

### Journey C — Learner Experience
- **Route Sequence**: `/sign-in` -> `/courses` -> `/learn/101` -> `/quiz/2` -> `/certificates`
- **Result**: `PASS`. Learner navigated lesson modules, submitted quiz answers, passed assessment, and unlocked verified PDF completion certificate.

### Journey D — Manager Supervision
- **Route Sequence**: `/sign-in` -> `/company` -> `/company/reports`
- **Result**: `PASS`. Manager reviewed team department analytics without platform-level or billing modification access.

### Journey E — Platform Administrator Audit
- **Route Sequence**: `/sign-in` -> `/platform-admin` -> `/platform-admin/organisations` -> `POST /api/subscriptions/confirm-payment`
- **Result**: `PASS`. Platform Admin reconciled B2B payment transactions and monitored tenant accounts across the network.

---

## 2. Mobile Viewport Audit (375x812)
- Tested key views: Homepage, Pricing cards, Company Dashboard, Employee Table, and Learner Course Player.
- **Result**: `PASS` — 0 mobile launch blockers found. Tap targets fit mobile touch viewports; zero horizontal scrollbar overflow.
