# Sprint 10O Paid Customer Browser E2E Acceptance

## 1. Scenario Execution Log

### Scenario 1: Standard Company Alpha (Up to 25 Employees — MUR 3,000/mo)
- **Journey**: Selects 'Up to 25' band on `/pricing` -> Registers user -> Submits `/company/subscribe` -> Account created with `maxEmployees = 25` -> `status: PENDING_PAYMENT` banner displayed -> Payment confirmed by server -> `status: ACTIVE` -> Adds employees & assigns course (`PASS`).

### Scenario 2: Standard Company Beta (81–120 Employees — MUR 6,250/mo)
- **Journey**: Selects '81-120' band on `/pricing` -> Submits `/company/subscribe` -> Account created with `maxEmployees = 120` -> Agreed monthly price MUR 6,250 persisted -> `status: PENDING_PAYMENT` -> Payment confirmed -> `status: ACTIVE` (`PASS`).

### Scenario 3: Enterprise Company (>120 Employees — Tailored Quote)
- **Journey**: Selects 'Over 120' on `/pricing` -> Displays lead capture dialog (*"Contact us for an organisation plan"*) -> Automated standard checkout blocked -> Zero fake checkout generated (`PASS`).

---

## 2. Security Invariant & Adversarial Tests
1. **Frontend Price Manipulation**: Client sends `amount = 1.00`. Server ignores input and resolves MUR 3,000 from `planPricesTable` (`PASS`).
2. **Client Self-Activation Bypass**: `COMPANY_ADMIN` calls `POST /confirm-payment` directly. Server rejects with **HTTP 403 Forbidden** (`PASS`).
3. **Cross-Tenant Payment Hijacking**: Company A Admin attempts activating Company B. Server rejects with **HTTP 403 Forbidden** (`PASS`).
