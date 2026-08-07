# Live Route Inventory

## 1. Executive Summary
This document provides the authoritative inventory of all **32 active application routes** discovered from `artifacts/ecolearn/src/App.tsx`.

---

## 2. Complete Application Route Inventory

| Route Index | Route Path | Access Role | Component / Destination | Live French Tested |
| :---: | :--- | :--- | :--- | :---: |
| 1 | `/` | Public | `HomeRedirect` | Yes |
| 2 | `/sign-in/*?` | Public | `SignInPage` (Clerk Auth) | Yes |
| 3 | `/sign-up/*?` | Public | `SignUpPage` (Clerk Auth) | Yes |
| 4 | `/courses` | Public / Learner | `Courses` | Yes |
| 5 | `/courses/:id` | Public / Learner | `CourseDetail` | Yes |
| 6 | `/challenges` | Public / Learner | `Challenges` | Yes |
| 7 | `/learn/:enrollmentId` | Learner | `Learn` (`DatabaseCoursePlayer`) | Yes |
| 8 | `/quiz/:courseId` | Learner | `Quiz` | Yes |
| 9 | `/certificates` | Learner | `Certificates` | Yes |
| 10 | `/certificates/verify/:code` | Public | `VerifyCertificate` | Yes |
| 11 | `/dashboard` | Learner | `Dashboard` | Yes |
| 12 | `/impact` | Public / All | `ImpactDashboard` | Yes |
| 13 | `/pricing` | Public / All | `Pricing` | Yes |
| 14 | `/mauritius-rules-resources` | Public / All | `MauritiusResourcesList` | Yes |
| 15 | `/mauritius-rules-resources/:slug`| Public / All | `MauritiusResourceDetail` | Yes |
| 16 | `/company` | Company Admin / Manager | `CompanyDashboard` | Yes |
| 17 | `/company/subscribe` | Company Admin | `Subscribe` | Yes |
| 18 | `/company/challenges-review` | Company Admin / Manager | `ChallengesReview` | Yes |
| 19 | `/company/employees` | Company Admin | `CompanyEmployees` | Yes |
| 20 | `/company/certificates` | Company Admin / Manager | `CompanyCertificates` | Yes |
| 21 | `/company/leaderboards` | Company Admin / Manager | `CompanyLeaderboards` | Yes |
| 22 | `/company/compliance` | Company Admin | `CompanyCompliance` | Yes |
| 23 | `/company/reports` | Company Admin / Manager | `CompanyReports` | Yes |
| 24 | `/company/recycling` | Company Admin / Manager | `CompanyRecycling` | Yes |
| 25 | `/company/sustainability` | Company Admin | `SustainabilityImpact` | Yes |
| 26 | `/platform-admin` | Platform Admin | `PlatformAdminOverview` | Yes |
| 27 | `/platform-admin/insights` | Platform Admin | `PlatformAdminInsights` | Yes |
| 28 | `/platform-admin/sectors` | Platform Admin | `PlatformAdminSectors` | Yes |
| 29 | `/platform-admin/learning-paths` | Platform Admin | `PlatformAdminLearningPaths` | Yes |
| 30 | `/platform-admin/courses` | Platform Admin | `PlatformAdminCourses` | Yes |
| 31 | `/platform-admin/subscriptions` | Platform Admin | `PlatformAdminSubscriptions` | Yes |
| 32 | `/platform-admin/sdg-mapping` | Platform Admin | `PlatformAdminSdgMapping` | Yes |

---

## 3. Inventory Summary
- **Total Application Routes**: 32
- **Routes Runtime Tested in French**: 32/32 (100%)
- **Untested Active Routes**: 0
