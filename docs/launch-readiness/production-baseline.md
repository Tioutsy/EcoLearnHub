# Production Baseline Document

## 1. Frozen Baseline Information
- **Git Commit SHA**: `65a12cd`
- **Application Repository**: `Tioutsy/EcoLearnHub` (`main` branch)
- **Workspace Build Result**: `PASS` (0 typecheck errors, clean Vite & Node bundle output)

---

## 2. Empirically Verified Course Catalogue
- **Total Database Course Records**: 35 courses
- **Published & Active Courses (`GET /api/courses`)**: **34 Published Courses** (ELH-01 through ELH-34)
- **Unpublished / Draft Courses**: 1 course (ID 234: *Workplace Sustainability Leadership*, status: `draft`)
- **Course Code Range**: ELH-01 through ELH-34
- **ELH-30 Verification**: *Climate Risk & Workplace Resilience* (ID 195) is published, active, and accessible in the catalogue (`PASS`).

---

## 3. Router Inventory (Exact Non-Overlapping Classification)
- **Total `<Route>` Definitions**: **35 Router Entries** in [App.tsx](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/ecolearn/src/App.tsx#L222)
- **Core Customer-Facing Routes**: 11 Primary User Journey Routes
- **Supporting Learner Features**: 6 Feature Routes
- **Platform Admin Sub-Routes**: 9 Administrative Routes
- **Canonical Redirects**: 7 SEO/Migration Redirects
- **Auth Wrappers**: 2 Clerk Auth Routes

---

## 4. Commercial Pricing Baseline
- **Up to 25 employees**: MUR 3,000 / month
- **26–50 employees**: MUR 4,500 / month
- **51–80 employees**: MUR 5,000 / month
- **81–120 employees**: MUR 6,250 / month
- **>120 employees**: Tailored quote request path

---

## 5. Pre-Merchant Payment Security Baseline
- **Initial Status**: Standard onboarding creates subscriptions with `status: "PENDING_PAYMENT"`.
- **Entitlement Enforcer**: Unpaid companies are blocked from paid LMS actions via `requireActiveCompanySubscription` (`HTTP 402`).
- **Payment Reconciliation**: Restricted to `PLATFORM_ADMIN` manual reconciliation or verified webhook signatures (`x-payment-webhook-secret`).
- **External Dependency**: Live automated merchant gateway integration remains an outstanding external launch gate.
