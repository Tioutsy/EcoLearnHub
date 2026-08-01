# Sprint 9O — ELH-26 Procurement & Purchasing Teams Upgrade Walkthrough

---

## Sprint Summary

| Field | Value |
|---|---|
| **Sprint** | 9O |
| **Sprint Ticket** | ELH-26 |
| **Course** | Sustainability for Procurement and Purchasing Teams |
| **Upgrade Type** | 13-Part EcoLearnHub Course Quality Standard — Applied Department Pathway Upgrade |
| **Date Completed** | 1 August 2026 |
| **Final Quality Score** | 97 / 100 |
| **Release Status** | ✅ RELEASE READY |
| **Tests Passed** | 3/3 targeted, 56/56 quality audit, 0 typecheck errors |

---

## Repository Discovery

ELH-26 was found in the repository as fully implemented prior to Sprint 9O:

- **Pre-sprint state**: 6 lessons, 8 quiz questions, badge slug `responsible-procurement-practitioner`
- **Pre-sprint quiz**: Already balanced at 2/2/2/2, streak=1 (Sprint 9I compliant)
- **Critical gap**: ELH-26 was absent from `courseQualityStandardAudit.test.ts` entirely — not imported, not seeded in `before()`, no quality tests
- **Release blockers**: 2 — no `memorable_fact` block, no `image` block

---

## Changes Made

### 1. Seeder: `ensureSustainabilityForProcurementAndPurchasingTeamsCourse.ts`

**Expanded from 6 → 12 lessons** covering all 13 quality standard parts:

| Lesson | Title | Quality Part |
|---|---|---|
| 0 | Opening Hook: The Urgent Request | Part 1 — Hook |
| 1 | Why Procurement Decisions Matter | Part 2 — Relevance |
| 2 | Key Terms in Procurement and Purchasing | Part 3 — Vocabulary |
| 3 | Procurement Role and Responsibility Boundaries | Part 4 — Role Matrix |
| 4 | Start With the Need, Not the Product | Part 5 — Framework (Step 1) |
| 5 | Write Clear Requirements and Evaluate Evidence | Part 5 + 7 — Framework (Step 2) + **Memorable Fact** |
| 6 | Compare Whole-Life Value, Not Price Alone | Part 5 — Framework (Step 3) |
| 7 | The Procurement Cycle: A Visual Guide | Part 8 — **Visual Element** |
| 8 | Test Supplier Claims and Evidence | Part 5 — Framework (Step 4) |
| 9 | Scenario Challenge: The Cleaning Contract Renewal | Part 10 — Applied Scenario |
| 10 | Make and Record a Defensible Decision | Part 5 + 6 — Framework (Step 5) + Mauritius |
| 11 | Manage the Supplier After Award | Part 5 + 9 + 12 + 13 — Actions + Commitment + Completion |

**New seed name**: `sustainability-for-procurement-and-purchasing-teams-v2`

**New block types added**:
- `memorable_fact` — lesson 5 — ISO 20400:2017 on specificity as the key characteristic of usable sustainability requirements
- `image` — lesson 7 — six-stage procurement cycle diagram

**Duration updated**: 18 → 20 minutes

---

### 2. Quiz Redesign: 8 Questions, Clean 2/2/2/2 Balance

All 8 questions redesigned to cover the full applied procurement scope:

| Q | Topic | Correct Position |
|---|---|---|
| Q0 | Role boundary — carbon claim verification | P2 (index 1) |
| Q1 | Evidence quality — biodegradability claim | P4 (index 3) |
| Q2 | Framework — need verification first | P1 (index 0) |
| Q3 | Mauritius scenario — hotel furniture specification | P3 (index 2) |
| Q4 | Visual interpretation — procurement cycle diagram | P2 (index 1) |
| Q5 | Escalation — undisclosed financial interest | P4 (index 3) |
| Q6 | Action completion — supplier non-delivery | P1 (index 0) |
| Q7 | Credibility risk — vague decision note | P3 (index 2) |

**Distribution**: P1=2, P2=2, P3=2, P4=2 ✅  
**Sequence**: 2,4,1,3,2,4,1,3 — no consecutive position repeats, max streak = 1 ✅

All questions include: aligned `optionFeedback` (4 strings), `correctExplanation`, `incorrectExplanation`, `practicalTakeaway`.

---

### 3. Test File: `ensureSustainabilityForProcurementAndPurchasingTeamsCourse.test.ts`

Updated for the v2 seeder:

- **Seed name reference**: updated to `v2`
- **Lesson count assertion**: 6 → 12
- **New assertions added**:
  - `memorable_fact` block present in lesson 5
  - `image` block present in lesson 7
  - `commitment` block present in lesson 11
  - Role boundary content verified in lesson 3 (`Procurement owns`, `escalates`)
  - All 8 questions have `optionFeedback`, `correctExplanation`, `incorrectExplanation`, `practicalTakeaway`
  - Quiz positions 2/2/2/2 (countByPos[0..3] each === 2)
  - Max streak ≤ 1

**All 3 test suites pass**:
- ✅ Course 26 Seeding & Integrity Unit Tests
- ✅ Course 26 Learner Data Preservation Unit Tests
- ✅ Course 26 Transactional Rollback Atomicity Unit Tests

---

### 4. Quality Audit Test: `courseQualityStandardAudit.test.ts`

- Added import for `ensureSustainabilityForProcurementAndPurchasingTeamsCourse`
- Added call to `before()` block
- Added **tests 55 & 56**:
  - Test 55: ELH-26 reaches quality score ≥ 95 with 0 release blockers
  - Test 56: ELH-26 diagnostic breakdown has non-zero `memorableFactScore`, `visualQuestionScore`, `appliedScenarioScore`

---

### 5. Documentation Created

| Document | Path |
|---|---|
| Quality Review | [elh-26-sustainability-for-procurement-and-purchasing-teams-quality-review.md](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/course-reviews/elh-26-sustainability-for-procurement-and-purchasing-teams-quality-review.md) |
| Duplication & Progression Matrix | [elh-26-duplication-and-progression-matrix.md](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/course-reviews/elh-26-duplication-and-progression-matrix.md) |
| This Walkthrough | [sprint-9o-elh-26-procurement-purchasing-upgrade-walkthrough.md](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/sprint-9o-elh-26-procurement-purchasing-upgrade-walkthrough.md) |

---

## Safeguards Maintained

### Sprint 9I Quiz Answer Position Safeguards
- ✅ 2/2/2/2 distribution confirmed in both seeder design and test assertions
- ✅ Max streak 1 confirmed
- ✅ `optionFeedback` order matches final `options` order (no mismatched feedback)

### Learner Data Preservation
- ✅ Seed name `v2` — existing v1 seed records prevent re-seeding on databases where v1 ran
- ✅ Lesson progress check before lesson delete-and-reinsert
- ✅ Quiz attempts check before question delete-and-reinsert
- ✅ Transaction wraps all writes — rollback test passes

### Idempotency
- ✅ Running the seeder a second time in the same test transaction is no-op (seed record check)
- ✅ Running the seeder on a fresh database creates all required records

---

## Role-Boundary Compliance

ELH-26 explicitly bounds the procurement role across four categories throughout the course, including a dedicated lesson (Lesson 3 — Role and Responsibility Boundaries), and a completion disclaimer on the final lesson:

> "This course provides practical workplace guidance on procurement principles. It does not constitute formal legal advice, a professional procurement qualification, or authorisation to make independent technical, environmental or regulatory determinations."

---

## Audit Trail: What Changed

```diff
artifacts/api-server/src/lib/ensureSustainabilityForProcurementAndPurchasingTeamsCourse.ts
  - SEED_NAME: "...-v1"
  + SEED_NAME: "...-v2"
  - 6 lessons
  + 12 lessons (added hook, why-matters, vocabulary, role-boundaries, visual element, scenario challenge)
  + memorable_fact block (ISO 20400:2017) in lesson 5
  + image block (procurement cycle diagram) in lesson 7
  + commitment block with 6 options in lesson 11
  + callout completion block with professional disclaimer in lesson 11
  - 8 quiz questions (original, position balance from Sprint 9I)
  + 8 quiz questions (redesigned, same 2/2/2/2 balance, new topics including visual interpretation)
  + durationMinutes: 18 → 20

artifacts/api-server/src/lib/ensureSustainabilityForProcurementAndPurchasingTeamsCourse.test.ts
  - Seed name reference: v1
  + Seed name reference: v2
  - Lesson count assertion: 6
  + Lesson count assertion: 12
  + Assertions: memorable_fact, image, commitment, role-boundary content
  + Sprint 9I position safeguard assertions: countByPos[0..3] each === 2, maxStreak ≤ 1
  + Per-question assertions: optionFeedback, correctExplanation, incorrectExplanation, practicalTakeaway

artifacts/api-server/src/lib/courseQualityStandardAudit.test.ts
  + Import: ensureSustainabilityForProcurementAndPurchasingTeamsCourse
  + before() call: await ensureSustainabilityForProcurementAndPurchasingTeamsCourse()
  + Test 55: ELH-26 score >= 95, 0 release blockers, isReleaseReady = true
  + Test 56: memorableFactScore > 0, visualQuestionScore > 0, appliedScenarioScore > 0

docs/course-reviews/elh-26-sustainability-for-procurement-and-purchasing-teams-quality-review.md  [NEW]
docs/course-reviews/elh-26-duplication-and-progression-matrix.md  [NEW]
docs/sprint-9o-elh-26-procurement-purchasing-upgrade-walkthrough.md  [NEW]
```
