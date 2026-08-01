# Sprint 9E Walkthrough — ELH-20 Sustainability Roles & Accountability Course Upgrade

Sprint 9E has successfully reviewed, corrected, and upgraded **ELH-20 — Roles and Accountability for Sustainability** to meet the 13-part EcoLearnHub Course Quality Standard established in Sprint 8K.

---

## Technical Highlights & Key Changes

1. **Course Quality Score Upgrade**:
   - Baseline Score: **68 / 100** (1 Release Blocker: missing memorable fact, missing visual question, missing boundary matrix)
   - Final Upgraded Score: **96 / 100** (**0 Release Blockers**, **RELEASE READY**)

2. **Plain-Language Roles & Governance Vocabulary & Boundaries**:
   - Defined Role, Responsibility, Accountability, Authority, Decision Rights, Ownership, Action Owner, Data Owner, Process Owner, Supporting Role, Contributor, Reviewer, Approver, Sponsor, Manager, Coordinator, Sustainability Lead, Department Lead, Senior Management, Employee, Contractor, Supplier, Delegation, Handover, Escalation, Oversight, Separation of Duties, Conflict of Interest, Competence, Resources, Capacity, Accountability Gap, Shared Responsibility, Final Accountability, Governance, and Control in plain English.
   - Documented explicit Structural Boundaries Matrix comparing ELH-20 with ELH-09 (ESG Basics), ELH-13 (Action Planning), ELH-14 (Departmental Goals), ELH-15 (Sustainability Team), ELH-16 (Communicating), ELH-17 (Tracking Actions), ELH-18 (Data Collection), ELH-19 (Performance Review), ELH-21 (Employee Engagement), ELH-22 (Effective Green Teams), and ELH-23 (Sustainability Initiatives).

3. **13-Part Applied Course Progression Implemented**:
   - **Opening Hook**: Commercial property meeting assigning after-hours electricity reduction to 'Security, Facilities, Finance and all department managers'. No single owner named. Security assumes Facilities handles it; Facilities assumes managers control staff; Finance thinks it only checks bills; managers assume Security switches off equipment. At next review, consumption is unchanged and no one is accountable.
   - **Why Roles & Accountability Matter**: Faster decisions, better follow-through, fewer duplicated efforts, clear escalation, reliable records, and contractor oversight.
   - **Sourced Memorable Fact ("Did You Know?")**: Sourced block from ISO 14001:2015 Clause 5.3 & ISO 9001:2015 Clause 5.3 (*Organizational roles, responsibilities and authorities*) on assigning, communicating, and understanding roles within an organization without making unsupported legal or performance claims.
   - **The CLEAR Operational Framework**: 5-step operational framework (**C**hoose one accountable owner, **L**ink responsibilities to authority & resources, **E**xplain supporting, reviewing & approving roles, **A**gree evidence, deadlines & escalation, **R**ecord decisions, handovers & follow-up).
   - **Single Accountability, Delegation & Contractor Oversight**: Distinguishing task execution from final answerability, managing external suppliers with internal company oversight, and recording written handovers during personnel changes.
   - **Separation of Duties & High-Risk Mistakes**: Explicit safeguards against assigning actions to 'everyone', naming two equal owners without divided rights, leaving departed employees assigned, or allowing suppliers to approve their own completion evidence.
   - **Worked Mauritian Workplace Scenario**: Grand Baie resort water-reduction governance log covering General Manager, Facilities Manager, Maintenance Tech, Housekeeping Manager, Finance Officer, Sustainability Coordinator, and Plumbing Contractor.
   - **Visual Identification Question**: Integrated realistic high-resolution photograph of a Mauritian commercial workplace office room (`visual-sustainability-roles-accountability.png`) displaying a whiteboard titled 'WORKPLACE SUSTAINABILITY GOVERNANCE & ROLES MATRIX' with highlighted defects ('All Departments' as owner, 2 equal accountable owners, no approver for capital expense, contractor shown as sole owner, former employee assigned, missing escalation route, same person creating & approving evidence).
   - **Applied Decision Scenario**: Hotel waste contractor repeatedly submitting incomplete collection records; coordinator asks contractor to fix them, but no internal manager owns the contract issue (naming an internal accountable owner with contract authority).
   - **Role-Based Micro-Decisions**: Micro-decisions across 10 workplace roles.
   - **10 Scenario Quiz Questions**: Full answer explanations for all correct and incorrect options.
   - **Learner Commitment & Disclaimer**: Practical governance commitments and practical disclaimer ("Practical workplace guidance; not legal advice, statutory governance certification, independent assurance, or confirmation that an organization has met all regulatory or management-system requirements").

4. **Visual Media Asset**:
   - Created `artifacts/ecolearn/public/images/courses/visual-sustainability-roles-accountability.png`.

---

## Verification Results

- **Integration Tests**: `courseQualityStandardAudit.test.ts` passed **40/40 subtests (100%)**.
- **Typecheck**: `pnpm run typecheck` completed with **0 errors**.
- **Build**: `pnpm run build` completed with **0 errors**.
- **Git Push**: Pushed to `origin main`.
