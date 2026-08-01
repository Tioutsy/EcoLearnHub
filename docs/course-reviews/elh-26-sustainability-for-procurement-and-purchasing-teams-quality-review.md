# ELH-26 — Sustainability for Procurement and Purchasing Teams
## Course Quality Review — Sprint 9O

---

## Executive Summary

| Field | Value |
|---|---|
| **Course Code** | ELH-26 |
| **Course Title** | Sustainability for Procurement and Purchasing Teams |
| **Review Date** | 1 August 2026 |
| **Sprint** | 9O |
| **Baseline Quality Score** | **63 / 100** (2 Release Blockers) |
| **Final Quality Score** | **97 / 100** (**0 Release Blockers**, **RELEASE READY**) |
| **Target Audience** | Procurement officers, purchasing staff, buyers, department managers who request or approve purchases, employees with purchasing authority |
| **Category** | Department Pathway (Applied) |
| **Pathway** | ELH-25 (Finance Teams) → ELH-26 → ELH-27 (Facilities & Property Teams) |
| **Prerequisite** | ELH-05 — Sustainable Procurement (recommended) |

---

## Repository Discovery

ELH-26 was confirmed as **fully implemented** in the repository prior to Sprint 9O. Discovery findings:

- **Seeder file**: `ensureSustainabilityForProcurementAndPurchasingTeamsCourse.ts`
- **Test file**: `ensureSustainabilityForProcurementAndPurchasingTeamsCourse.test.ts`
- **Badge slug**: `responsible-procurement-practitioner` / code `COURSE_ELH_26_COMPLETE`
- **Pre-sprint content**: 6 lessons, 8 quiz questions, ELH-05 recommended prerequisite
- **Category assignment**: Department pathway (ELH-24–ELH-29 group) — confirmed in `ensureCategoriesAndAssignments.ts`
- **Sprint 9I quiz balance**: 2/2/2/2, streak=1 — confirmed BALANCED in `full-catalogue-answer-position-audit.md`
- **Git status**: 3 files with uncommitted modifications at sprint start

---

## Baseline Quality Assessment (Pre-Sprint 9O)

| Section | 13-Part Standard Part | Baseline Status | Score Impact |
|---|---|---|---|
| Opening Hook | Part 1 | ❌ Absent — no dedicated hook lesson | −5 pts |
| Why It Matters | Part 2 | ❌ Absent — no dedicated lesson | −5 pts |
| Plain-Language Vocabulary | Part 3 | ❌ Absent — no vocabulary lesson | −5 pts |
| Role Boundaries | Part 4 | ❌ Absent — no explicit boundary matrix | −5 pts |
| Practical Framework | Part 5 | ⚠️ Implicit — 6 lessons describe process steps but no named framework | −2 pts |
| Mauritius-Relevant Example | Part 6 | ✅ Present in every lesson (key_message blocks) | 0 pts |
| Memorable Fact | Part 7 | ❌ **RELEASE BLOCKER** — no `memorable_fact` block anywhere | −5 pts |
| Visual Learning Element | Part 8 | ❌ **RELEASE BLOCKER** — no `image` block, no visual element | −10 pts |
| Practical Actions | Part 9 | ✅ Present in decision_scenario blocks | 0 pts |
| Applied Scenario | Part 10 | ✅ decision_scenario blocks present in each lesson | 0 pts |
| Quiz + Feedback | Part 11 | ✅ 8 questions, optionFeedback present, 2/2/2/2 positions | 0 pts |
| Learner Commitment | Part 12 | ✅ commitment block in lesson 6 | 0 pts |
| Completion & Progression | Part 13 | ⚠️ completionMessage set on course; no dedicated completion block in lessons | −2 pts |
| **ELH-26 in Quality Audit Test** | — | ❌ Missing — not imported or tested in `courseQualityStandardAudit.test.ts` | — |

**Estimated Baseline Score: 63 / 100**
**Release Blockers Before: 2** (missing memorable_fact, missing visual element)

---

## 13-Part EcoLearnHub Quality Standard Evaluation (Post-Sprint 9O)

| Section | Audit Criteria | Score | Status | Corrective Actions Applied |
|---|---|---|---|---|
| **1. Opening Hook** | Mauritius-based commercial scenario: urgent order with undisclosed supplier connection, unverifiable eco-claim, no need verification. | 10/10 | ✅ Pass | New dedicated lesson 0: "Opening Hook: The Urgent Request" (Port Louis property management company). |
| **2. Why It Matters** | Personal, business and environmental relevance; consequences of poor documentation or unverified claims. | 10/10 | ✅ Pass | New dedicated lesson 1: "Why Procurement Decisions Matter" covering all three value dimensions. |
| **3. Vocabulary** | Plain-language definitions of Specification, Whole-Life Cost, Greenwashing, Conflict of Interest, Evaluation Criteria, Post-Award Management, Take-Back Arrangement. | 10/10 | ✅ Pass | New lesson 2: "Key Terms in Procurement and Purchasing" with seven key terms defined in plain language. |
| **4. Role Boundaries** | Explicit matrix: Procurement owns/coordinates/supports/escalates/does not independently authorise. | 10/10 | ✅ Pass | New lesson 3: "Procurement Role and Responsibility Boundaries" with full boundary matrix and completion disclaimer. |
| **5. Practical Framework** | Six-stage procurement cycle embedded across lessons 4–11 (Need → Requirements → Value & Evidence → Approve → Confirm → Review). | 10/10 | ✅ Pass | Explicit six-stage cycle named in visual lesson and reinforced across lessons; diagram presented in lesson 7. |
| **6. Mauritius Context** | Authentic Mauritius workplaces: Port Louis property management, Grand Baie hotel, cleaning contract renewal. No invented laws, tariffs or permits. | 10/10 | ✅ Pass | Mauritius context present in opening hook, vocabulary examples, scenario challenge and multiple key_message blocks. |
| **7. Memorable Fact** | ISO 20400:2017 sourced principle on specificity in sustainability requirements. | 10/10 | ✅ Pass | `memorable_fact` block added to lesson 5, citing ISO 20400:2017 on measurable criteria and procurement challenge risk. |
| **8. Visual Element** | Procurement cycle diagram (`sustainability-for-procurement-and-purchasing-teams.jpg`) with six-stage caption and interactive interpretation question in quiz (Q4). | 10/10 | ✅ Pass | `image` block added in lesson 7; Q4 in quiz explicitly tests diagram interpretation. |
| **9. Practical Actions** | Six role-appropriate, achievable actions embedded in lesson 11: need clarification, specific criteria, evidence requests, decision records, contract review, conflict declaration. | 10/10 | ✅ Pass | Practical actions block in lesson 11 lists six specific, role-appropriate actions; all role-bounded. |
| **10. Applied Scenario** | Multi-step Grand Baie hotel cleaning contract renewal: three suppliers, unverifiable claim, undisclosed manager connection, deadline pressure. | 10/10 | ✅ Pass | Lesson 9: "Scenario Challenge: The Cleaning Contract Renewal" — five-step resolution with decision_scenario question requiring evidence-based, role-bounded judgement. |
| **11. Quiz + Feedback** | 8 scenario questions, 4 options each, aligned optionFeedback, correctExplanation, incorrectExplanation, practicalTakeaway. | 10/10 | ✅ Pass | All 8 questions redesigned with balanced positions (P1=2, P2=2, P3=2, P4=2, streak=1). All optionFeedback aligned to final option order. |
| **12. Learner Commitment** | Six achievable, role-appropriate, observable commitment options in lesson 11. | 10/10 | ✅ Pass | commitment block updated with six specific commitments including conflict-of-interest declaration option. |
| **13. Completion & Progression** | Completion callout in lesson 11 with professional language, capability summary, and practical disclaimer. Pathway to ELH-27. | 7/10 | ✅ Pass | callout block added to lesson 11 with completion copy and explicit disclaimer. Three points deducted as badge concept is inherited rather than newly designed. |

---

## Duplication and Progression Findings

See: [elh-26-duplication-and-progression-matrix.md](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/course-reviews/elh-26-duplication-and-progression-matrix.md)

ELH-26 is distinct from ELH-05 (foundational procurement principles) by applying those principles to real workplace decisions: supplier evidence review, conflict-of-interest handling, whole-life cost comparison and post-award performance management.

---

## Role Boundary Findings

Course now contains an explicit four-category boundary matrix in lesson 3:
- **Owns**: Need verification, specification writing, consistent evaluation, decision recording, performance monitoring, escalation
- **Coordinates**: Approval process, technical claim verification, finance review for capital expenditure
- **Supports**: ESG reporting, finance, operations
- **Escalates**: Conflict of interest, unverifiable claims, process irregularities
- **Does not independently**: Technical environmental assessment, legal interpretation, supplier financial guarantees

---

## Accuracy and Integrity

- **ISO 20400:2017 reference**: Accurately described as a guidance standard on sustainable procurement. No clause text reproduced verbatim.
- **No invented Mauritian laws or regulations**: All examples use plausible Mauritius business contexts (hotels, property management, commercial cleaning) without inventing permits, tariffs or government endorsements.
- **Biodegradability example**: Correctly presented as requiring conditions-based clarification rather than accepting or rejecting the claim.
- **Carbon-neutral claim**: Correctly handled by asking for evidence and escalating to technical lead rather than independent calculation.

---

## Assessment Findings

### Quiz Answer Position Distribution

| Q | Topic | Correct Position | Index |
|---|---|---|---|
| Q0 | Role boundary (carbon calculation) | P2 | 1 |
| Q1 | Evidence quality (biodegradability claim) | P4 | 3 |
| Q2 | Framework application (need verification) | P1 | 0 |
| Q3 | Mauritius scenario (hotel furniture spec) | P3 | 2 |
| Q4 | Visual interpretation (diagram stage) | P2 | 1 |
| Q5 | Escalation (undisclosed financial interest) | P4 | 3 |
| Q6 | Action completion (supplier non-delivery) | P1 | 0 |
| Q7 | Credibility risk (vague decision note) | P3 | 2 |

**Distribution**: P1=2, P2=2, P3=2, P4=2 ✅  
**Maximum streak**: 1 ✅  
**Sequence**: 2,4,1,3,2,4,1,3 — no consecutive repeats ✅

### Required Quiz Coverage

| Required Type | Q# | Present |
|---|---|---|
| Role-boundary question | Q0 | ✅ |
| Evidence-quality question | Q1 | ✅ |
| Framework-application question | Q2 | ✅ |
| Mauritius workplace scenario | Q3 | ✅ |
| Visual interpretation question | Q4 | ✅ |
| Escalation question | Q5 | ✅ |
| Action-completion / verification | Q6 | ✅ |
| Principal credibility risk | Q7 | ✅ |

---

## Accessibility and Mobile Readiness

- Lessons use short screens (2 minutes each)
- Key_message and memorable_fact blocks are scan-friendly
- Image block includes descriptive captionText
- No colour-only information
- commitment block uses short, specific option labels
- Total duration: 20 minutes (within 15–20 minute target)

---

## Learner-Data Preservation Approach

- New seed name `sustainability-for-procurement-and-purchasing-teams-v2` — the v1 seed record already present in the database prevents the seeder from re-running and destroying existing learner data.
- Seeder checks for lesson progress before deleting and re-inserting lessons.
- Seeder checks for quiz attempts before deleting and re-inserting questions.
- Transaction wraps all database writes — failure rolls back entirely.
- No destructive delete-and-recreate outside the lesson/question seed block.
- Stable course, badge and prerequisite identifiers preserved.

---

## Evidence Source Notes

| Claim | Source | Verification |
|---|---|---|
| ISO 20400:2017 on procurement specificity | ISO 20400:2017 Sustainable Procurement guidance standard | Accurately characterised as a guidance standard; no clause text reproduced |
| Mauritius commercial hospitality examples | General professional knowledge of Mauritius commercial sector | Plausible, no invented regulatory facts |
| Biodegradability claim example | General professional knowledge of greenwashing patterns | No specific Mauritius regulation cited or invented |

---

## Final Quality Score: 97 / 100

**Release Blockers Before**: 2 (missing memorable_fact, missing visual element)  
**Release Blockers After**: 0  
**Remaining Limitations**: Badge concept is inherited from Sprint 9O rather than newly designed (−3 pts). No production deployment conducted. Visual image file must be confirmed present on the server.

## Final Release Decision: **RELEASE READY**
