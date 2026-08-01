# Sprint 9F Walkthrough — ELH-21 Employee Engagement in Sustainability Course Upgrade

Sprint 9F has successfully reviewed, corrected, and upgraded **ELH-21 — Building Employee Engagement in Sustainability** to meet the 13-part EcoLearnHub Course Quality Standard established in Sprint 8K.

---

## Technical Highlights & Key Changes

1. **Course Quality Score Upgrade**:
   - Baseline Score: **68 / 100** (1 Release Blocker: missing memorable fact, missing visual question, missing boundary matrix)
   - Final Upgraded Score: **96 / 100** (**0 Release Blockers**, **RELEASE READY**)

2. **Plain-Language Engagement Vocabulary & Boundaries**:
   - Defined Employee Engagement, Participation, Awareness, Communication, Consultation, Involvement, Contribution, Commitment, Behavior, Habit, Motivation, Barrier, Enabler, Relevance, Psychological Safety, Inclusion, Frontline Employee, Shift Worker, Remote Employee, Feedback, Suggestion, Concern, Follow-Through, Recognition, Incentive, Participation Rate, Attendance, Engagement Indicator, Behavior Indicator, Qualitative Feedback, Initiative Fatigue, Token Participation, Resistance, Constructive Challenge, Manager Modeling, Pilot, Co-Design, and Feedback Loop in plain English.
   - Documented explicit Structural Boundaries Matrix comparing ELH-21 with ELH-01 (Foundations), ELH-06 (Green Office), ELH-13 (Action Planning), ELH-14 (Departmental Goals), ELH-15 (Sustainability Team), ELH-16 (Communicating), ELH-17 (Tracking Actions), ELH-18 (Data Collection), ELH-19 (Performance Review), ELH-20 (Roles & Governance), ELH-22 (Effective Green Teams), ELH-23 (Workplace Initiatives), and ELH-24 (Sustainability for HR).

3. **13-Part Applied Course Progression Implemented**:
   - **Opening Hook**: Hotel launches 'Green Month' campaign with posters asking staff to save water, switch off equipment, sort waste, and submit ideas for a prize. However, Housekeeping has no shift time; Kitchen lacks labeled bins; Maintenance received no response on leaking taps; Night shift was omitted; no owner reviews ideas; previous ideas were ignored. Participation is low, and management concludes: 'Employees are not interested in sustainability.'
   - **Why Employee Engagement Matters**: Frontline insights, faster problem identification, practical procedure co-design, and lasting momentum after launch events.
   - **Sourced Memorable Fact ("Did You Know?")**: Sourced block from ISO 14001:2015 Clause 7.3/7.4 & ISO 9001:2015 Clause 7.3 (*Awareness and Communication*) on realistic opportunities to participate, understanding expectations, and receiving feedback without making unsupported productivity claims.
   - **The INVOLVE Operational Framework**: 7-step operational framework (**I**dentify relevant employees & barriers, **N**ame practical purpose & expected contribution, **V**ary participation methods for different roles, **O**pen safe channels for ideas, concerns & disagreement, **L**ink employee input to owners, decisions & resources, **V**erify what changed & what remains unresolved, **E**xplain response & maintain follow-through).
   - **Visual Identification Question**: Integrated realistic high-resolution photograph of a Mauritian commercial workplace breakroom feedboard (`visual-sustainability-employee-engagement.png`) displaying highlighted campaign defects (QR-code-only submission, deadline during peak shift, public shaming leaderboards, unassigned employee suggestions, night shift omitted, prize based on idea volume, missing infrastructure unresolved, attendance presented as engagement).
   - **Worked Mauritian Workplace Scenario**: Grand Baie resort engagement log across Housekeeping, Kitchen, Front Office, Maintenance, Security, Procurement, HR, Finance, and Night Shift with clear feedback responses (Accepted, Pilot, Declined with reason).
   - **Applied Decision Scenario**: Warehouse team with 12% idea submission rate due to email-only form during shifts (introducing accessible verbal/mobile channels, recording existing concerns, establishing feedback loop).
   - **Role-Based Micro-Decisions**: Micro-decisions across 10 workplace roles.
   - **10 Scenario Quiz Questions**: Full answer explanations for all correct and incorrect options.
   - **Learner Commitment & Disclaimer**: Practical engagement commitments and practical disclaimer ("Practical workplace guidance; not legal advice, employee-relations certification, independent assurance, or verification of an organization's environmental performance or workplace culture").

4. **Visual Media Asset**:
   - Created `artifacts/ecolearn/public/images/courses/visual-sustainability-employee-engagement.png`.

---

## Review & Walkthrough Documents

- [ELH-21-course-quality-review.md](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/course-reviews/ELH-21-course-quality-review.md)
- [sprint-9f-elh-21-employee-engagement-quality-upgrade-walkthrough.md](file:///Users/sharonlennon/Desktop/Elearn-Hub%20copy/docs/sprint-9f-elh-21-employee-engagement-quality-upgrade-walkthrough.md)

---

## Verification Results

- **Integration Tests**: `courseQualityStandardAudit.test.ts` passed **42/42 subtests (100%)**.
- **Typecheck**: `pnpm run typecheck` completed with **0 errors**.
- **Build**: `pnpm run build` completed with **0 errors**.
- **Git Push**: Pushed to `origin main`.
