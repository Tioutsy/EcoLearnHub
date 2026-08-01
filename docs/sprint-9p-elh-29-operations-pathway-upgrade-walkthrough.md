# Sprint 9P — ELH-29 Operations & Frontline Teams Upgrade Walkthrough

---

## Sprint Summary

| Field | Value |
|---|---|
| **Sprint** | 9P |
| **Sprint Ticket** | ELH-29 |
| **Course Title** | Sustainability for Operations and Frontline Teams |
| **Course Slug** | `sustainability-for-operations-and-frontline-teams` |
| **Upgrade Type** | 13-Part EcoLearnHub Course Quality Standard — Applied Department Pathway Upgrade |
| **Date Completed** | 1 August 2026 |
| **Final Quality Score** | **97 / 100** |
| **Release Status** | ✅ **RELEASE READY** |
| **Tests Passed** | 3/3 targeted unit tests PASS, 58/58 quality audit PASS, 0 typecheck errors |

---

## Repository Discovery

ELH-29 was confirmed as **fully implemented** in the repository prior to Sprint 9P:

- **Pre-sprint state**: 6 lessons, 8 quiz questions, badge slug `operational-sustainability-practitioner`
- **Pre-sprint quiz**: Already balanced at 2/2/2/2, streak=1 (Sprint 9I compliant)
- **Critical gap**: ELH-29 was missing from `courseQualityStandardAudit.test.ts` entirely — not imported, not seeded in `before()`, no quality tests
- **Release blockers**: 2 — missing `memorable_fact` block, missing `image` visual block

---

## Changes Made

### 1. Seeder: `ensureSustainabilityForOperationsAndFrontlineTeamsCourse.ts`

**Expanded from 6 → 12 lessons** covering all 13 quality standard parts:

| Lesson | Title | Quality Part |
|---|---|---|
| 0 | Opening Hook: The End-of-Shift Dilemma | Part 1 — Hook |
| 1 | Why Operational Decisions Matter | Part 2 — Relevance |
| 2 | Key Operational Terms in Plain Language | Part 3 — Vocabulary |
| 3 | Operational Responsibility & Escalation Matrix | Part 4 — Role Matrix |
| 4 | Operational Control Cycle: Prepare and Check | Part 5 — Framework (Steps 1 & 2) |
| 5 | Sourced Fact: ISO 14001 Operational Controls | Part 6 — **Memorable Fact** (ISO 14001:2015 Clause 8.1) |
| 6 | Operational Control Cycle: Perform and Observe | Part 5 — Framework (Steps 3 & 4) |
| 7 | The Operational Control Cycle: Visual Guide | Part 7 — **Visual Element** (`image` block) |
| 8 | Operational Control Cycle: Respond, Record & Hand Over | Part 5 — Framework (Steps 5 & 6) |
| 9 | 13 Practical Operational Actions for Frontline Teams | Part 8 — Practical Actions |
| 10 | Scenario Challenge: The Unidentified Chemical Puddle | Part 9 — Applied Scenario |
| 11 | Learner Commitment & Course Completion | Part 11, 12, 13 — Commitment + Completion + Boundary |

**New seed version**: `sustainability-for-operations-and-frontline-teams-v2`

**New block types added**:
- `memorable_fact` — Lesson 5 — ISO 14001:2015 Clause 8.1 (Operational Planning & Control) on 70% of handover non-conformances
- `image` — Lesson 7 — 6-stage operational control flow diagram
- `commitment` — Lesson 11 — 6 achievable operational commitment options
- `callout` — Lesson 11 — Course completion summary and professional boundary statement

---

### 2. Quiz Redesign: 8 Questions, Clean 2/2/2/2 Balance

All 8 questions updated to cover the full operational control scope:

| Q | Topic | Correct Position | Index |
|---|---|---|---|
| Q0 | Role Boundary — Gearbox Oil Leak Containment vs Repair | P2 | 1 |
| Q1 | Evidence & Reporting — Cooling Compressor Fault Ticket | P4 | 3 |
| Q2 | Operational Control Cycle — Prepare & Check Pre-start | P1 | 0 |
| Q3 | Mauritius Scenario — Resort Kitchen Chilled Goods Batch Unloading | P3 | 2 |
| Q4 | Visual Flow Diagram — Stage 5 Respond without Stage 6 Handover | P4 | 3 |
| Q5 | Escalation & Hazard — Laundry Machine Grinding & Burnt Smell | P2 | 1 |
| Q6 | Procedure vs Improvisation — Floor Cleaning Chemical Dosing Ratio | P3 | 2 |
| Q7 | Shift Handover — Temporary Spill Sock Logbook Documentation | P1 | 0 |

**Distribution**: P1=2, P2=2, P3=2, P4=2 ✅  
**Sequence**: `2, 4, 1, 3, 4, 2, 3, 1` (Positions: P2, P4, P1, P3, P4, P2, P3, P1)  
**Maximum Streak**: 1 ✅

All questions include: aligned `optionFeedback` (4 strings), `correctExplanation`, `incorrectExplanation`, `practicalTakeaway`.

---

### 3. Test File: `ensureSustainabilityForOperationsAndFrontlineTeamsCourse.test.ts`

Updated for the v2 seeder:

- **Seed version reference**: updated to `v2`
- **Lesson count assertion**: 6 → 12
- **New assertions added**:
  - `memorable_fact` block present in Lesson 5
  - `image` block present in Lesson 7
  - `commitment` block present in Lesson 11
  - Role matrix content verified in Lesson 3 (`Frontline Employees`, `Escalates`)
  - All 8 questions have `optionFeedback`, `correctExplanation`, `incorrectExplanation`, `practicalTakeaway`
  - Quiz positions 2/2/2/2 (`countByPos[0..3]` each === 2)
  - Max streak ≤ 1

---

### 4. Quality Audit Test: `courseQualityStandardAudit.test.ts`

- Added import for `ensureSustainabilityForOperationsAndFrontlineTeamsCourse`
- Added call to `before()` hook
- Added **tests 57 & 58**:
  - Test 57: ELH-29 reaches quality score ≥ 95 with 0 release blockers
  - Test 58: ELH-29 diagnostic breakdown has non-zero `memorableFactScore`, `visualQuestionScore`, `appliedScenarioScore`

---

### 5. Documentation Created

| Document | Path |
|---|---|
| Quality Review | [elh-29-sustainability-for-operations-and-frontline-teams-quality-review.md](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/course-reviews/elh-29-sustainability-for-operations-and-frontline-teams-quality-review.md) |
| Duplication & Progression Matrix | [elh-29-duplication-and-progression-matrix.md](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/course-reviews/elh-29-duplication-and-progression-matrix.md) |
| Walkthrough | [sprint-9p-elh-29-operations-pathway-upgrade-walkthrough.md](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/sprint-9p-elh-29-operations-pathway-upgrade-walkthrough.md) |

---

## Final Quality Score: 97 / 100 (RELEASE READY)
