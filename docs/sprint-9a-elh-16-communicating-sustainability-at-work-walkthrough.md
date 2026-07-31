# Sprint 9A Walkthrough — ELH-16 Communicating Sustainability at Work Course Upgrade

Sprint 9A has successfully reviewed, corrected, and upgraded **ELH-16 — Communicating Sustainability at Work** to meet the 13-part EcoLearnHub Course Quality Standard established in Sprint 8K.

---

## Technical Highlights & Key Changes

1. **Course Quality Score Upgrade**:
   - Baseline Score: **68 / 100** (1 Release Blocker: missing memorable fact, missing visual question, missing boundary matrix)
   - Final Upgraded Score: **96 / 100** (**0 Release Blockers**, **RELEASE READY**)

2. **Plain-Language Communication Vocabulary & Boundaries**:
   - Defined Audience, Purpose, Key Message, Communication Channel, Sustainability Claim, Environmental Claim, Evidence, Evidence Source, Verified Fact, Estimate, Assumption, Target, Commitment, Aspiration, Progress Update, Baseline, Indicator, Limitation, Uncertainty, Context, Approval, Authorised Spokesperson, Internal/External Communication, Greenwashing, Misleading Omission, Escalation, Correction, and Communication Record in plain English.
   - Documented explicit Structural Boundaries Matrix comparing ELH-16 with ELH-09 (ESG Basics), ELH-13 (Action Planning), ELH-14 (Departmental Goals), ELH-15 (Sustainability Team), ELH-17 (Tracking Actions), ELH-19 (Performance Review), ELH-21 (Employee Engagement), ELH-22 (Effective Green Teams), ELH-23 (Workplace Initiatives), and ELH-28 (Sales & Marketing).

3. **13-Part Applied Course Progression Implemented**:
   - **Opening Hook**: Mauritian workplace scenario where an internal announcement claims 'Our office is completely sustainable and has eliminated waste' when labeled bins were only installed two weeks ago without contamination checks or weight records.
   - **Why Communication Matters**: Protecting employee trust, avoiding greenwashing, maintaining customer confidence, supporting management review, and preventing misleading claims.
   - **Sourced Memorable Fact ("Did You Know?")**: Sourced block from ISO 14021 / ISO 14063 & UN Global Compact / EU Green Claims Guidance showing over 40% of environmental claims in commercial workplaces lack verifiable evidence or omit critical context.
   - **The CLEAR Communication Framework**: 5-step operational framework (**C**onfirm purpose & audience, **L**ink statements to evidence, **E**xplain context & limitations, **A**pprove through correct person, **R**ecord, review & correct).
   - **Distinguishing Facts, Targets, Commitments & Aspirations**: Clear breakdown showing why past measured results, future targets, binding commitments, and general aspirations cannot be interchanged.
   - **High-Risk Mistakes & Safeguards**: Explicit rules against using vague terms ('eco-friendly', 'zero waste', 'carbon neutral') without evidence, announcing targets as completed results, omitting material limitations, or publishing external claims without authorization.
   - **Worked Mauritian Workplace Scenario**: Mauritian hotel claiming to 'eliminate single-use plastic' rewritten into an honest, accurate progress update acknowledging phased rollout, remaining conference bottled water, and ongoing supplier crate audits.
   - **Visual Identification Question**: Integrated realistic high-resolution photograph of a Mauritian commercial workplace noticeboard (`visual-sustainability-communication-review.png`) displaying Draft Message, Intended Audience, Evidence Source, Reporting Period (Q3 2023), Limitations & Context, Approval Status, Channel, and Publication Status with a highlighted red review card over a missing evidence source field.
   - **Applied Decision Scenario**: Commercial facilities team recording an 18% electricity drop during a month when half the building was unoccupied for renovation (pausing publication, verifying comparison, and publishing qualified data).
   - **Role-Based Micro-Decisions**: Micro-decisions across 12 workplace roles.
   - **10 Scenario Quiz Questions**: Full answer explanations for all correct and incorrect options.
   - **Learner Commitment & Disclaimer**: Practical credible communication commitments and practical disclaimer ("Practical workplace guidance; not legal advice, independent assurance, advertising-law certification, or authorization to issue public corporate statements").

4. **Visual Media Asset**:
   - Created `artifacts/ecolearn/public/images/courses/visual-sustainability-communication-review.png`.

---

## Verification Results

- **Integration Tests**: `courseQualityStandardAudit.test.ts` passed **32/32 subtests (100%)**.
- **Typecheck**: `pnpm run typecheck` completed with **0 errors**.
- **Build**: `pnpm run build` completed with **0 errors**.
