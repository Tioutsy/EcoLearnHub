# Sprint 8Y Walkthrough — ELH-14 Setting Departmental Sustainability Goals Course Upgrade

Sprint 8Y has successfully reviewed, corrected, and upgraded **ELH-14 — Setting Departmental Sustainability Goals** to meet the 13-part EcoLearnHub Course Quality Standard established in Sprint 8K.

---

## Technical Highlights & Key Changes

1. **Course Quality Score Upgrade**:
   - Baseline Score: **68 / 100** (1 Release Blocker: missing memorable fact, missing visual question, missing duplication matrix)
   - Final Upgraded Score: **96 / 100** (**0 Release Blockers**, **RELEASE READY**)

2. **Plain-Language Departmental Goal Vocabulary**:
   - Defined Company Priority, Departmental Goal, Baseline, Current Condition, Objective, Target, Activity, Output, Outcome, Indicator, Evidence Source, Goal Owner, Supporting Role, Direct Control, Influence, Dependency, Constraint, Trade-off, Review Period, and Escalation in plain English.
   - Documented explicit Duplication & Progression Matrix comparing ELH-14 with ELH-12, ELH-13, ELH-17, ELH-18, ELH-19, ELH-20, and ELH-24..29.

3. **13-Part Applied Course Progression Implemented**:
   - **Opening Hook**: Mauritian workplace scenario where a general company announcement to 'reduce waste & energy' results in Facilities, HR, Procurement, Finance, and Operations proposing disconnected activities because no department agreed on its specific contribution.
   - **Why Departmental Goals Matter**: Translating broad company priorities into practical responsibility, preventing duplicated effort, and establishing operational authority boundaries.
   - **Sourced Memorable Fact ("Did You Know?")**: Sourced block from ISO 14001 & UN Global Compact showing structured departmental goals aligned with corporate priorities and assigned owners increase target completion by >75%.
   - **The ALIGN Goal-Setting Framework**: 5-step operational framework (**A**ssess role, **L**ink priority, **I**dentify baseline/result, **G**ive ownership/timing/evidence, **N**egotiate constraints).
   - **Direct Control vs Influence vs Concern**: Clear classification of direct control, influence, and concern requiring escalation.
   - **High-Risk Mistakes & Safeguards**: Explicit rules prohibiting copying another company's targets, setting percentages without baselines, adopting goals outside departmental authority, or hiding missed targets.
   - **Worked Mauritian Workplace Scenario**: Multi-department Mauritian hotel waste reduction goals across Kitchen (Head Chef Jean-Pierre), Housekeeping (Meera R.), Procurement (Davin K.), Facilities (Raj S.), and HR (Sarah M.).
   - **Visual Identification Question**: Integrated realistic high-resolution photograph of a Mauritian commercial workplace planning board (`visual-departmental-sustainability-goals.png`) linking company priority to aligned columns for Kitchen, Housekeeping, Procurement, Facilities, and HR with named owners, target dates, evidence indicators, and review dates.
   - **Applied Decision Scenario**: Retail store manager translating a company 20% power reduction target without sub-metering or capital budget into a realistic departmental goal (shutdown checklist & Facilities thermostat coordination).
   - **Role-Based Micro-Decisions**: Micro-decisions across 10 workplace roles.
   - **10 Scenario Quiz Questions**: Full answer explanations for all correct and incorrect options.
   - **Learner Commitment & Disclaimer**: Daily departmental goal commitments and practical disclaimer ("Practical operational tool; not statutory ESG reporting or legal compliance certification").

4. **Visual Media Asset**:
   - Created `artifacts/ecolearn/public/images/courses/visual-departmental-sustainability-goals.png`.

---

## Verification Results

- **Integration Tests**: `courseQualityStandardAudit.test.ts` passed **28/28 subtests (100%)**.
- **Typecheck**: `pnpm run typecheck` completed with **0 errors**.
- **Build**: `pnpm run build` completed with **0 errors**.
