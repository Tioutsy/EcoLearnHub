# Sprint 9V — English/French Internationalisation Architecture & Core Interface Foundation Walkthrough

## Summary

Sprint 9V establishes the technical foundation for English (`en`) and French (`fr`) internationalisation across Elevio:

1. **Architecture & Resource Dictionaries**: Created a lightweight, zero-dependency `LanguageContext` and structured translation resources in [`config/translations.ts`](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/ecolearn/src/config/translations.ts).
2. **Language Selector**: Created an accessible `LanguageSelector` component rendering `English` and `Français` options with keyboard navigation and dynamic HTML document `lang` tag updates.
3. **Preference Persistence**: Configured multi-tier preference resolution:
   1. Authenticated user preference via Clerk `user.publicMetadata.preferredLanguage`.
   2. Unauthenticated local storage (`elevio_language_preference`).
   3. Browser locale (`navigator.language`).
   4. Default English (`en`) fallback.
4. **Core Interface Shell Translated**: Translated main layout elements (Navbar, Footer, Auth labels, Pricing page headers, Not Found error views, and Course Catalogue badges).
5. **Course Language Separation**: Added explicit `Course available in English` / `Cours disponible en anglais` indicator badges to course cards so learners know course content remains English-only without masking content availability.
6. **Governance Standard**: Documented the English/French terminology glossary and translation rules in [`docs/i18n-glossary-and-governance-standard.md`](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/i18n-glossary-and-governance-standard.md).

---

## Files Created / Modified
1. `artifacts/ecolearn/src/config/translations.ts` [NEW]
2. `artifacts/ecolearn/src/context/LanguageContext.tsx` [NEW]
3. `artifacts/ecolearn/src/components/layout/LanguageSelector.tsx` [NEW]
4. `artifacts/ecolearn/src/components/layout/Navbar.tsx` [MODIFY]
5. `artifacts/ecolearn/src/components/layout/Footer.tsx` [MODIFY]
6. `artifacts/ecolearn/src/pages/pricing.tsx` [MODIFY]
7. `artifacts/ecolearn/src/pages/courses/index.tsx` [MODIFY]
8. `artifacts/ecolearn/src/pages/not-found.tsx` [MODIFY]
9. `artifacts/ecolearn/src/App.tsx` [MODIFY]
10. `artifacts/api-server/src/lib/translations.ts` [NEW]
11. `artifacts/api-server/src/lib/internationalizationAudit.test.ts` [NEW]
12. `docs/i18n-glossary-and-governance-standard.md` [NEW]
13. `docs/sprint-9v-internationalisation-architecture-walkthrough.md` [NEW]

---

## Automated Test & Build Verification Results
- **i18n Audit Suite**: `node --test --import tsx ./src/lib/internationalizationAudit.test.ts` passed (6/6 pass).
- **Workspace Typecheck**: `pnpm run typecheck` passed (0 errors across 4 projects).
- **Production Build**: `pnpm --filter @workspace/ecolearn run build` passed clean (5.57s).
