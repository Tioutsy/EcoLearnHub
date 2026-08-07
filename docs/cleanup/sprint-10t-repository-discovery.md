# Sprint 10T Repository Discovery

## 1. Executive Summary
This discovery document records the initial findings for **Sprint 10T — Internationalisation Rollback, Translation Infrastructure Removal, Dead-Code Cleanup & English-Only Production Reconciliation**.

---

## 2. Identified i18n Artifacts to Remove
- `artifacts/ecolearn/src/context/LanguageContext.tsx`
- `artifacts/ecolearn/src/components/layout/LanguageSelector.tsx`
- `artifacts/ecolearn/src/config/translations.ts`
- `artifacts/api-server/src/lib/frenchCourseContent.ts`
- Translation-specific unit/E2E test files (`frenchLocalizationAudit.test.ts`, `liveFrenchE2eAudit.test.ts`, `bilingualQuizEquivalenceAudit.test.ts`, `frenchCourseContentAudit.test.ts`, `mixedLanguageRuntimeAudit.test.ts`, `apiLocaleIntegration.test.ts`).

---

## 3. Shared Files to Clean & Reconcile
- `artifacts/ecolearn/src/App.tsx` (Remove `LanguageProvider` wrapper)
- `artifacts/api-server/src/routes/courses.ts` (Remove `getFrenchCoursePackage` import and fallback)
- `artifacts/api-server/src/routes/quizzes.ts` (Remove `getFrenchCoursePackage` import and fallback)
- `artifacts/api-server/src/routes/certificates.ts` (Remove `getFrenchCoursePackage` import and fallback)
- Shared test files (`firstCustomerSuccessAudit.test.ts`, `multiCompanyCommercialScaleAudit.test.ts`, etc.) (Remove `frenchCourseRegistry` imports)

---

## 4. Retained Functionality Safeguard
All role permissions, navigation fixes, course player features, Module 2 interactive scenarios, quiz answer position balancing, Recyclean branding, and cross-tenant security boundaries remain 100% intact.
