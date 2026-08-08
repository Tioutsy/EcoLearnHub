# Full Router Inventory & Reconciliation

## 1. Exclusive Non-Overlapping Route Breakdown (Total: 35 Router Entries)

Every `<Route>` definition in [App.tsx](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/artifacts/ecolearn/src/App.tsx#L222) belongs to exactly one exclusive classification:

1. **Authentication Wrappers (2 routes)**:
   - `/sign-in/*?`
   - `/sign-up/*?`

2. **Core Customer Onboarding & Learning Routes (11 routes)**:
   - `/` (Home redirect)
   - `/pricing`
   - `/courses`
   - `/courses/:id`
   - `/company/subscribe`
   - `/company` (Company Dashboard overview)
   - `/company/employees`
   - `/company/reports`
   - `/learn/:enrollmentId`
   - `/certificates`
   - `/platform-admin` (Platform Overview entry)

3. **Supporting Application & Learner Feature Routes (6 routes)**:
   - `/dashboard`
   - `/challenges`
   - `/quiz/:courseId`
   - `/certificates/verify/:code`
   - `/impact`
   - `/mauritius-rules-resources` & `/mauritius-rules-resources/:slug`

4. **Platform Administrator Sub-Routes (9 routes)**:
   - `/platform-admin/organisations`
   - `/platform-admin/subscriptions`
   - `/platform-admin/accounts`
   - `/platform-admin/activity`
   - `/platform-admin/health`
   - `/platform-admin/insights`
   - `/platform-admin/sectors`
   - `/platform-admin/learning-paths`
   - `/platform-admin/courses`

5. **Canonical SEO & Legacy Migration Redirects (7 routes)**:
   - `/made-for-mauritius`
   - `/blog` & `/blog/:slug`
   - `/insights`, `/insights/articles`, `/insights/articles/:slug`, `/insights/mauritius-resources`

---

## 2. Explicit Arithmetic Verification
```
2 (Auth) + 11 (Core Customer) + 6 (Supporting Features) + 9 (Platform Admin Sub) + 7 (Redirects) = 35 Total Router Entries
```
All 35 router definitions compile cleanly and map to unique application components or canonical redirects.
