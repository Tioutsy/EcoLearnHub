# Sprint 11A Repository Discovery — ELH-01 Sustainability Foundations

## 1. Executive Summary
This document records the exact runtime architecture, files, database tables, and seeder scripts controlling **ELH-01 — Sustainability Foundations**.

---

## 2. Architecture & Runtime Source of Truth
- **Database Tables**: `@workspace/db` (`coursesTable`, `lessonsTable`, `quizQuestionsTable`, `badgeDefinitionsTable`)
- **Seeder & Canonical Definition**: `artifacts/api-server/src/lib/ensureFoundationsCourse.ts` (Executes during server startup to seed/sync ELH-01 content blocks, scenario options, and quiz questions).
- **API Endpoints**: `artifacts/api-server/src/routes/courses.ts` (Course metadata & lesson blocks), `quizzes.ts` (Scored questions & evaluation), `certificates.ts` (Badge issuance & completion).
- **Frontend Player**: `artifacts/ecolearn/src/pages/learn/DatabaseCoursePlayer.tsx` (Renders lesson cards, interactive decision scenarios, and completion commitment screen), `artifacts/ecolearn/src/pages/quiz/index.tsx` (Renders scored knowledge assessment).

---

## 3. Structural Summary of ELH-01
- **Course Code**: `ELH-01`
- **Course Title**: Sustainability Foundations
- **Duration**: 20 minutes
- **Modules / Lessons**: 6 Lessons (`orderIndex` 0 to 5)
- **Scored Quiz Questions**: 7 Questions (`orderIndex` 0 to 6)
- **Interactive Scenarios**: 5 `decision_scenario` blocks embedded in Lessons 0, 1, 3, 4.
