# Sprint 10T — Translation Footprint Register

## 1. Executive Summary
This register details the initial footprint discovery for **Sprint 10T — Internationalisation Rollback, Translation Infrastructure Removal, Dead-Code Cleanup & English-Only Production Reconciliation**.

---

## 2. Translation Footprint Inventory

| File / Component | Translation Purpose | Runtime or Non-Runtime | Shared with Other Functionality? | Action |
| :--- | :--- | :---: | :---: | :---: |
| `src/context/LanguageContext.tsx` | Language Provider / Context | Runtime | No | **DELETE** |
| `src/components/layout/LanguageSelector.tsx` | Language Switch UI | Runtime | No | **DELETE** |
| `src/config/translations.ts` | UI Translation Dictionary | Runtime | No | **DELETE** |
| `artifacts/api-server/src/lib/frenchCourseContent.ts` | French Course Data Registry | Runtime | No | **DELETE** |
| `artifacts/api-server/src/routes/courses.ts` | Locale query handling (`getFrenchCoursePackage`) | Runtime | Yes | **MODIFY** (Remove FR lookup) |
| `artifacts/api-server/src/routes/quizzes.ts` | Locale query handling (`getFrenchCoursePackage`) | Runtime | Yes | **MODIFY** (Remove FR lookup) |
| `artifacts/api-server/src/routes/certificates.ts` | Locale query handling (`getFrenchCoursePackage`) | Runtime | Yes | **MODIFY** (Remove FR lookup) |
| `artifacts/api-server/src/lib/frenchLocalizationAudit.test.ts` | French Localization Test | Test only | No | **DELETE** |
| `artifacts/api-server/src/lib/liveFrenchE2eAudit.test.ts` | Live French E2E Audit Test | Test only | No | **DELETE** |
| `artifacts/api-server/src/lib/bilingualQuizEquivalenceAudit.test.ts` | Bilingual Quiz Audit Test | Test only | No | **DELETE** |
| `artifacts/api-server/src/lib/frenchCourseContentAudit.test.ts` | French Content Audit Test | Test only | No | **DELETE** |
| `artifacts/api-server/src/lib/mixedLanguageRuntimeAudit.test.ts` | Mixed Language Test | Test only | No | **DELETE** |
| `artifacts/api-server/src/lib/apiLocaleIntegration.test.ts` | API Locale Test | Test only | No | **DELETE** |
| `artifacts/api-server/src/lib/firstCustomerSuccessAudit.test.ts` | Success Audit Test | Test only | Yes | **MODIFY** (Remove FR imports) |
| `artifacts/api-server/src/lib/multiCompanyCommercialScaleAudit.test.ts` | Commercial Audit Test | Test only | Yes | **MODIFY** (Remove FR imports) |
| `artifacts/api-server/src/lib/controlledProductionOnboardingAudit.test.ts` | Onboarding Audit Test | Test only | Yes | **MODIFY** (Remove FR imports) |
| `artifacts/api-server/src/lib/endToEndProductionReadinessAudit.test.ts` | Production Audit Test | Test only | Yes | **MODIFY** (Remove FR imports) |
| `artifacts/api-server/src/lib/fullPlatformLearningIntegrityAudit.test.ts` | Integrity Audit Test | Test only | Yes | **MODIFY** (Remove FR imports) |
| `artifacts/api-server/src/lib/module2ScenarioAudit.test.ts` | Scenario Audit Test | Test only | Yes | **MODIFY** (Assert DB scenarios) |
| `artifacts/api-server/src/lib/englishOnlyArchitectureAudit.test.ts` | English Architecture Guard | Test only | No | **NEW** (Add guard) |
