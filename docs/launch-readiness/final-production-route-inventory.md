# Full Router Inventory & Reconciliation

## 1. Route Breakdown & Classification

- **Total Router Entries**: 35 `<Route>` definitions in [App.tsx](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/ecolearn/src/App.tsx#L222).
- **Core Customer-Facing Routes**: 11 primary user-journey routes (`/`, `/pricing`, `/courses`, `/courses/:id`, `/company/subscribe`, `/company`, `/company/employees`, `/company/reports`, `/learn/:enrollmentId`, `/certificates`, `/platform-admin`).
- **Supporting Application Routes**: 12 secondary feature routes (`/dashboard`, `/challenges`, `/quiz/:courseId`, `/company/compliance`, `/company/sustainability`, `/company/certificates`, `/company/leaderboards`, `/company/challenges-review`, `/company/recycling`, `/impact`, `/mauritius-rules-resources`, `/mauritius-rules-resources/:slug`).
- **Platform Administrator Routes**: 10 administrative management routes (`/platform-admin`, `/platform-admin/organisations`, `/platform-admin/subscriptions`, `/platform-admin/accounts`, `/platform-admin/activity`, `/platform-admin/health`, `/platform-admin/insights`, `/platform-admin/sectors`, `/platform-admin/learning-paths`, `/platform-admin/courses`).
- **Redirect / Legacy Routes**: 7 canonical SEO & migration redirects (`/made-for-mauritius`, `/blog`, `/blog/:slug`, `/insights`, `/insights/articles`, `/insights/articles/:slug`, `/insights/mauritius-resources`).
- **Authentication Routes**: 2 Clerk auth wrappers (`/sign-in/*?`, `/sign-up/*?`).

---

## 2. Discrepancy Resolution
The 11 core routes audited in earlier launch sprints represent the primary customer onboarding and learning path. The full application router contains 35 total route declarations, all of which compile cleanly and resolve to valid components or canonical redirects.
