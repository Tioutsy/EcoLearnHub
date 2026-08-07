# Sprint 11D Repository Discovery — ELH-04 Water Conservation

## 1. Executive Summary
This document records the exact runtime architecture, files, database tables, and seeder scripts controlling **ELH-04 — Water Conservation**.

---

## 2. Architecture & Runtime Source of Truth
- **Database Tables**: `@workspace/db` (`coursesTable`, `lessonsTable`, `quizQuestionsTable`, `badgeDefinitionsTable`)
- **Seeder & Canonical Definition**: `artifacts/api-server/src/lib/ensureWaterConservationCourse.ts` & `ensureCatalogueSkeletons.ts` (Executes during server startup to seed/sync ELH-04 content blocks, leak drip rates, hygiene boundaries, outdoor sweeping guidelines, scenarios, and quiz questions).
- **API Endpoints**: `artifacts/api-server/src/routes/courses.ts` (Course metadata & lesson blocks), `quizzes.ts` (Scored questions & evaluation), `certificates.ts` (Badge issuance & completion).
- **Player Interface**: `artifacts/ecolearn/src/pages/learn/DatabaseCoursePlayer.tsx` (Renders lesson cards, interactive decision scenarios, and completion commitment screen), `artifacts/ecolearn/src/pages/quiz/index.tsx` (Renders scored knowledge assessment).

---

## 3. Structural Summary of ELH-04
- **Course Code**: `ELH-04`
- **Course Title**: Water Conservation
- **Duration**: 18 minutes
- **Modules / Lessons**: 6 Lessons (`orderIndex` 0 to 5)
- **Scored Quiz Questions**: 5 Questions (`orderIndex` 1 to 5)
- **Interactive Scenarios**: 3 `decision_scenario` blocks embedded in Lessons 0, 1, 4.
