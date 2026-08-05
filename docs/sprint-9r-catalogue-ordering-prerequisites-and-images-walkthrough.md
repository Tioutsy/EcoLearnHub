# Sprint 9R — Catalogue Ordering, Prerequisite UX & Course Image Consistency Walkthrough

## Summary

Sprint 9R resolves three specific catalogue usability and visual presentation issues across the Elevio learner and company-admin experience:

1. **Numerical Course Ordering**: Enforced strict numerical sorting (`ELH-01` → `ELH-02` → `ELH-09` → `ELH-10` → ... → `ELH-29`).
2. **Compact Prerequisite Presentation**: Replaced long inline prerequisite lists beneath course titles with compact indicators (`Prerequisites required`, `3 prerequisites`) and interactive popover details.
3. **Realistic Imagery for ELH-26 & ELH-29**: Verified visual imagery for ELH-26 (*Sustainability for Procurement and Purchasing Teams*) and ELH-29 (*Sustainability for Operations and Frontline Teams*).

---

## Workstream Details

### Workstream A — Numerical Course Ordering
- Created shared utility [`sortCoursesByCode`](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/ecolearn/src/lib/courseSorting.ts).
- Updated API endpoint `GET /api/courses` in [`courses.ts`](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/api-server/src/routes/courses.ts) to sort by numeric course code.
- Applied sorting to catalogue views in [`courses/index.tsx`](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/ecolearn/src/pages/courses/index.tsx) and [`company/compliance.tsx`](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/ecolearn/src/pages/company/compliance.tsx).

### Workstream B — Compact Prerequisite Presentation
- Redesigned prerequisite notice blocks in [`courses/index.tsx`](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/ecolearn/src/pages/courses/index.tsx).
- Display compact count badges (`Prerequisite required` or `N prerequisites required`) with an accessible `View details` popover tooltip.

### Workstream C — ELH-26 and ELH-29 Course Images
- ELH-26 (*Sustainability for Procurement and Purchasing Teams*): `/images/courses/sustainability-for-procurement-and-purchasing-teams.jpg`
- ELH-29 (*Sustainability for Operations and Frontline Teams*): `/images/courses/sustainability-for-operations-and-frontline-teams.jpg`

---

## Verification & Test Execution

### Automated Tests
- Created [`courseOrdering.test.ts`](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/api-server/src/lib/courseOrdering.test.ts) covering 7 numerical sorting scenarios.
- Executed `node --test --import tsx ./src/lib/courseOrdering.test.ts` (7/7 passed).
- Executed `node --test --import tsx ./src/lib/legacyBrandAudit.test.ts` (1/1 passed).
- Executed `pnpm run typecheck` across workspace (0 errors).
- Executed `pnpm --filter @workspace/ecolearn run build` (build succeeded in 5.86s).

---

## Files Changed
1. `artifacts/ecolearn/src/lib/courseSorting.ts` [NEW]
2. `artifacts/api-server/src/lib/courseOrdering.test.ts` [NEW]
3. `artifacts/api-server/src/routes/courses.ts` [MODIFY]
4. `artifacts/ecolearn/src/pages/courses/index.tsx` [MODIFY]
5. `artifacts/ecolearn/src/pages/company/compliance.tsx` [MODIFY]
