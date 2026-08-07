# Sprint 10F — Repository Discovery Report

## 1. Component & Structure Discovery

- **Public Homepage**: `artifacts/ecolearn/src/pages/home.tsx`
- **CTA / Footer Section**: Lines 244–270 in `artifacts/ecolearn/src/pages/home.tsx`
- **Footer Component**: `artifacts/ecolearn/src/components/layout/Footer.tsx`
- **Navbar Component**: `artifacts/ecolearn/src/components/layout/Navbar.tsx`
- **Pricing / Corporate Plans Page**: `artifacts/ecolearn/src/pages/pricing.tsx`
- **Onboarding / Subscribe Flow**: `artifacts/ecolearn/src/pages/company/subscribe.tsx`
- **Backend Subscription Routes**: `artifacts/api-server/src/routes/subscriptions.ts`
- **Certificate Verification Page**: `artifacts/ecolearn/src/pages/certificates/verify.tsx`

---

## 2. Commercial Flow & Self-Service Architecture

- **Standard Plan Journey (≤120 Employees)**:
  `Visitor -> Corporate Plans (/pricing) -> Select Employee Band -> Click "Get Started" -> Sign In / Account -> Onboarding (/company/subscribe) -> Subscription Activation`
- **Activation Behavior**:
  - `POST /api/subscriptions/onboard` creates or updates the company record and sets subscription status to **`ACTIVE`** for standard fixed-price bands (up to 120 employees).
  - For `OVER_120`, status is set to **`PENDING`** (Tailored quote required).

---

## 3. Payment Architecture Findings

- **Status**: **Absence of external Payment Gateway SDKs / Payment Processors**.
- **Evidence**:
  - No `stripe`, `@stripe/stripe-js`, `checkout`, or payment provider packages in `package.json`.
  - Subscription creation (`POST /api/subscriptions/onboard`) validates plan codes and employee bands server-side against database price records (`planPricesTable`), directly activating standard tiers without an external payment gateway.
- **Reporting Gate**: As required by Sprint 10F Section 8, payment architecture is reported as **Direct Subscription Activation via Onboarding Engine (No payment provider mock fabricated)**.

---

## 4. Brand Typography & Color Tokens Found

- **Font System**:
  - Headings / Display / Page Titles: `font-serif` (`Playfair Display`, serif)
  - Body / UI Controls: `font-sans` (`Plus Jakarta Sans`, sans-serif)
- **Previous Public CTA/Footer Color**:
  - `bg-secondary` (`hsl(210 80% 40%)` - Dominant Blue)
- **New Green Visual System**:
  - Deep Green background: `bg-emerald-950` / `bg-emerald-900` (`#185E20`)
  - Accent / Primary Green: `bg-emerald-600` / `text-emerald-700` (`#43A047`)
  - Light Green Tint: `bg-emerald-500/10` / `bg-emerald-50` (`#E8F5E9`)
