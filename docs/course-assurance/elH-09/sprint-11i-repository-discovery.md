# Sprint 11I Repository Discovery — ELH-09 ESG Basics

## 1. Executive Summary
This document records the exact runtime architecture, files, database tables, and seeder scripts controlling **ELH-09 — ESG Basics**.

---

## 2. Architecture & Runtime Source of Truth
- **Database Tables**: `@workspace/db` (`coursesTable`, `lessonsTable`, `quizQuestionsTable`, `badgeDefinitionsTable`)
- **Seeder & Canonical Definition**: `artifacts/api-server/src/lib/ensureEsgBasicsCourse.ts` & `ensureCatalogueSkeletons.ts` (Executes during server startup to seed/sync ELH-09 content blocks, E/S/G pillar definitions, ISSB 80% tender evaluation benchmark, Check–Record–Report–Confirm protocol, scenarios, and quiz questions).
- **API Endpoints**: `artifacts/api-server/src/routes/courses.ts` (Course metadata & lesson blocks), `quizzes.ts` (Scored questions & evaluation), `certificates.ts` (Badge issuance & completion).
- **Player Interface**: `artifacts/ecolearn/src/pages/learn/DatabaseCoursePlayer.tsx` (Renders lesson cards, interactive decision scenarios, and completion commitment screen), `artifacts/ecolearn/src/pages/quiz/index.tsx` (Renders scored knowledge assessment).

---

## 3. Structural Summary of ELH-09
- **Course Code**: `ELH-09`
- **Course Title**: ESG Basics
- **Duration**: 18 minutes
- **Modules / Lessons**: 6 Lessons (`orderIndex` 0 to 5)
- **Scored Quiz Questions**: 5 Questions (`orderIndex` 1 to 5)
- **Interactive Scenarios**: 3 `decision_scenario` blocks embedded in Lessons 0, 1, 4.
