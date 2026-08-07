# Sprint ELH-30 Repository Discovery — ELH-30 Climate Risk & Workplace Resilience

## 1. Executive Summary
This document records the exact runtime architecture, files, database tables, seeder scripts, catalogue ordering logic, and badge/certificate pipelines for introducing **ELH-30 — Climate Risk & Workplace Resilience**.

---

## 2. Architecture & Runtime Source of Truth
- **Database Tables**: `@workspace/db` (`coursesTable`, `lessonsTable`, `quizQuestionsTable`, `badgeDefinitionsTable`, `coursePrerequisitesTable`, `courseRecommendationsTable`)
- **Catalogue Skeletons Bootstrap**: `artifacts/api-server/src/lib/ensureCatalogueSkeletons.ts`
- **Course Content Seeder**: `artifacts/api-server/src/lib/ensureClimateRiskCourse.ts` (To be created, seeding ELH-30 metadata, lessons, 5-stage resilience framework, decision scenarios, and quiz questions).
- **Badge Metadata Seeder**: `artifacts/api-server/src/lib/ensureAppliedCourseBadges.ts`
- **Categories & Assignments**: `artifacts/api-server/src/lib/ensureCategoriesAndAssignments.ts`
- **Subscription Entitlements**: `artifacts/api-server/src/lib/ensureHybridSubscriptions.ts`
- **Server Bootstrap Orchestrator**: `artifacts/api-server/src/index.ts`
- **API Endpoints**: `artifacts/api-server/src/routes/courses.ts`, `quizzes.ts`, `certificates.ts`
- **Player & Catalogue UI**: `artifacts/ecolearn/src/pages/learn/DatabaseCoursePlayer.tsx`, `artifacts/ecolearn/src/pages/courses/index.tsx`, `artifacts/ecolearn/src/pages/pricing.tsx`

---

## 3. Structural Definition of ELH-30
- **Course Code**: `ELH-30`
- **Course Slug**: `climate-risk-and-workplace-resilience`
- **Course Title**: Climate Risk & Workplace Resilience
- **Category**: Departmental / Applied Workplace Practice
- **Duration**: 18 minutes
- **Level**: Advanced / Applied Workplace Practice
- **Badge Name**: Workplace Climate Resilience Practitioner
- **Badge Slug**: `workplace-climate-resilience`
- **Prerequisite**: `ELH-07` (Carbon Footprint Awareness) or `ELH-12` (Final Certification)
- **Scored Quiz Questions**: 10 Scored Multiple Choice Questions
- **Interactive Scenarios**: 3 `decision_scenario` blocks
