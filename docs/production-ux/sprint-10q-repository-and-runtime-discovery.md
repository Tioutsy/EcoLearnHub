# Sprint 10Q — Repository and Runtime Discovery

## 1. Executive Summary
This document establishes the initial technical and architectural baseline for **Sprint 10Q — Full Production UX, Role-Permission Visibility, Bilingual Content & Real User Acceptance Audit**. It outlines the current state of authentication, role metadata, route guards, translation providers, course delivery structures, and test account matrices.

---

## 2. Authentication & Role Architecture
- **Auth Engine**: Clerk React (`@clerk/react`) & Custom Session Helpers (`src/lib/authHelpers.ts`).
- **Role Hierarchy**:
  - `platform_admin` / `super_admin`: Full access to platform administration, multi-company overview, sectors, catalogue, and analytics.
  - `company_admin` / `admin`: Full access to organisation profile, employee lifecycle management (creation, bulk import, deactivation), training assignments, compliance reports, and certificate registries.
  - `manager`: Scoped visibility into team learning progress, team challenge/workplace action reviews, team completion exports, and assigned team training.
  - `employee` / `learner`: Access to personal learning dashboard, active course player, quiz attempts, workplace commitments, certificates, and personal profile settings.
- **Role Verification Baseline**: All UI components check role capabilities via `hasCapability(user, capability)` rather than relies solely on hardcoded route paths.

---

## 3. Frontend Route Guards & Layout Scoping
- **Global Layout**: `src/components/layout/Layout.tsx` handles responsive container wrapping, navigation, and footer.
- **Platform Admin Layout**: `src/components/layout/PlatformAdminLayout.tsx` enforces `isPlatformAdmin(user)` role check and redirects unauthorized users to `/dashboard`.
- **Company Portal Scoping**: `src/pages/company/` routes use inline checks for `isCompanyAdmin(user)` or `isManager(user)`, hiding admin-only controls from managers and non-admin learners.

---

## 4. Internationalization & Localization (EN / FR)
- **Language Context**: `src/context/LanguageContext.tsx` manages language state (`en` / `fr`) persisted in `localStorage`.
- **Translation Dictionary**: `src/config/translations.ts` provides complete key-value mappings for navigation, dashboards, course player, forms, buttons, empty states, and toast notifications.
- **Language Selector**: `src/components/layout/LanguageSelector.tsx` renders a clean UI selector in header/navigation.

---

## 5. Course Delivery System (ELH-01 → ELH-29)
- **Database Player**: `src/pages/learn/DatabaseCoursePlayer.tsx` delivers all 29 courses dynamically.
- **Module Structure**: Hook, Lesson Content Blocks, Module 2 Interactive Decision Scenarios, Knowledge Check Quizzes, Workplace Commitments, and Certificate Generation.
- **Interactive Scenarios**: Handled via `ScenarioView` and `CheckView` in `src/pages/learn/blocks.tsx`.

---

## 6. Runtime Verification Checklist
- [x] Repository structure inspected.
- [x] Auth & role capability matrix defined.
- [x] Route guard logic verified.
- [x] Language dictionary audited.
- [x] Course player rendering confirmed.
