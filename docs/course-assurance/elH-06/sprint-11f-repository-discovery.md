# Sprint 11F Repository Discovery — ELH-06 Green Office Practices

## 1. Executive Summary
This document records the exact runtime architecture, files, database tables, and seeder scripts controlling **ELH-06 — Green Office Practices**.

---

## 2. Architecture & Runtime Source of Truth
- **Database Tables**: `@workspace/db` (`coursesTable`, `lessonsTable`, `quizQuestionsTable`, `badgeDefinitionsTable`)
- **Seeder & Canonical Definition**: `artifacts/api-server/src/lib/ensureGreenOfficePracticesCourse.ts` & `ensureCatalogueSkeletons.ts` (Executes during server startup to seed/sync ELH-06 content blocks, 5-stage working day framework, digital vs paper boundaries, confidential shredding rules, critical IT boundaries, scenarios, and quiz questions).
- **API Endpoints**: `artifacts/api-server/src/routes/courses.ts` (Course metadata & lesson blocks), `quizzes.ts` (Scored questions & evaluation), `certificates.ts` (Badge issuance & completion).
- **Player Interface**: `artifacts/ecolearn/src/pages/learn/DatabaseCoursePlayer.tsx` (Renders lesson cards, interactive decision scenarios, and completion commitment screen), `artifacts/ecolearn/src/pages/quiz/index.tsx` (Renders scored knowledge assessment).

---

## 3. Structural Summary of ELH-06
- **Course Code**: `ELH-06`
- **Course Title**: Green Office Practices
- **Duration**: 18 minutes
- **Modules / Lessons**: 6 Lessons (`orderIndex` 0 to 5)
- **Scored Quiz Questions**: 5 Questions (`orderIndex` 1 to 5)
- **Interactive Scenarios**: 3 `decision_scenario` blocks embedded in Lessons 0, 1, 4.
