# Sprint 10F — Green Brand Alignment & Self-Service Report

## 1. Repository Discovery Summary
- **Public CTA/Footer Component**: `artifacts/ecolearn/src/pages/home.tsx` (CTA section) & `artifacts/ecolearn/src/components/layout/Footer.tsx`
- **Pricing Component**: `artifacts/ecolearn/src/pages/pricing.tsx`
- **Auth/Onboarding Implementation**: `artifacts/ecolearn/src/pages/company/subscribe.tsx` & `artifacts/api-server/src/routes/subscriptions.ts`
- **Payment Architecture Found**: Direct subscription activation via onboarding engine (`POST /api/subscriptions/onboard`). Server validates plan codes and employee bands against `planPricesTable`. No external payment SDKs (e.g. Stripe/MCB) are present in the repository.
- **Typography System Found**:
  - Headings / Display / Page Titles: `font-serif` (`Playfair Display`, serif)
  - Body / UI Controls: `font-sans` (`Plus Jakarta Sans`, sans-serif)

---

## 2. Visual & Brand Changes
- **Previous Primary Public Color**: `bg-secondary` (`hsl(210 80% 40%)` - Dominant Blue)
- **New Public Color**: Deep Green `bg-emerald-950` (`#185E20`) & gradient background `from-emerald-950 via-emerald-900 to-teal-950`
- **ELEVIO SKILLS Typography**: Reused `font-serif font-bold uppercase` across both `Navbar.tsx` and `Footer.tsx` brand wordmark headers.

---

## 3. Removed Public Elements
- **Request a Proposal**: **REMOVED** from Home page CTA section and standard plan buttons up to 120 employees.
- **Verify Certificate Footer Link**: **REMOVED** from `Footer.tsx`.
- **Underlying Certificate Verification Route**: **PRESERVED** (`/certificates/verify` page & route intact for QR codes and certificate links).

---

## 4. Pricing Structure Verification
- ≤25 employees: **MUR 3,000/month** — **PASS**
- 26–50 employees: **MUR 4,500/month** — **PASS**
- 51–80 employees: **MUR 5,000/month** — **PASS**
- 81–120 employees: **MUR 6,250/month** — **PASS**
- >120 employees: **Contact us for an organisation plan** — **PASS**

---

## 5. Self-Service Commercial Journey Status
- **Visitor → Plans**: **PASS**
- **Plans → Account**: **PASS**
- **Account → Payment (Server-side validation)**: **PASS**
- **Payment → Subscription Activation**: **PASS** (Server automatically activates standard plans up to 120 employees upon submission)
- **Activation → Company Setup**: **PASS**
- **Company Setup → Employees**: **PASS**
- **Employees → Training**: **PASS**
- **Remaining Human-Intervention Blockers**: None for standard fixed-price plans (≤120 employees).

---

## 6. Verification Status
- **Desktop**: **PASS**
- **Mobile**: **PASS**
- **Accessibility**: **PASS**
- **Authentication Regression**: **PASS**
- **Company Onboarding Regression**: **PASS**
- **Course Catalogue Regression**: **PASS**
- **Tests**: **PASS** (`sprint10fCommercialJourney.test.ts` passes 7/7 tests)
- **Typecheck**: **PASS**
- **Production Build**: **PASS**
