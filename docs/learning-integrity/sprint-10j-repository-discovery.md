# Sprint 10J — Repository Discovery Document (Learning Integrity)

## Executive Summary
This document records the repository discovery conducted for **Sprint 10J — Platform-Wide French Translation, Module 2 Interaction & Quiz Answer-Bias Recovery**.

---

## 1. Active Course Content Architecture

- **Course Range**: ELH-01 through ELH-29 (29 active micro-learning courses).
- **Primary Source of Truth**: Database seed files located in `artifacts/api-server/src/lib/ensure*.ts` combined with database tables `coursesTable`, `lessonsTable`, `quizQuestionsTable`.
- **French Localisation Engine**: `frenchCourseRegistry` in `artifacts/api-server/src/lib/frenchCourseContent.ts` and UI dictionary `translations.ts`.
- **Quiz Option Distribution**: Managed in seed files and database `quiz_questions` with 1-indexed `correctOption` pointers.

---

## 2. Root Cause Analysis of Previous Audits

1. **Localisation Scope**: Previous tests verified translation dictionary key presence, but did not assert 100% field-level coverage across all 29 courses in `frenchCourseRegistry`.
2. **Module 2 Interaction**: Previous tests checked for the presence of lesson blocks, but did not strictly enforce that Module 2 contains a decision-based interaction block (`decision_scenario` or `knowledge_check`) with options and feedback.
3. **Quiz Position Distribution**: Quiz rebalancing scripts existed, but required automated assertions enforcing global thresholds (Position 1 <= 30%, no position > 35%, each position >= 20%) across all 29 courses.
