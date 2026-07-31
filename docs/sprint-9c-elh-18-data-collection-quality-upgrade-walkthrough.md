# Sprint 9C Walkthrough — ELH-18 Sustainability Data Collection Course Upgrade

Sprint 9C has successfully reviewed, corrected, and upgraded **ELH-18 — Data Collection for Sustainability** to meet the 13-part EcoLearnHub Course Quality Standard established in Sprint 8K.

---

## Technical Highlights & Key Changes

1. **Course Quality Score Upgrade**:
   - Baseline Score: **68 / 100** (1 Release Blocker: missing memorable fact, missing visual question, missing boundary matrix)
   - Final Upgraded Score: **96 / 100** (**0 Release Blockers**, **RELEASE READY**)

2. **Plain-Language Data Collection Vocabulary & Boundaries**:
   - Defined Sustainability Data, Data Point, Data Source, Source Record, Primary/Secondary Data, Quantitative Data, Qualitative Information, Activity Data, Meter Reading, Invoice, Delivery Note, Purchase Record, Waste Collection Record, Fuel Record, Travel Record, Maintenance Record, Observation, Estimate, Assumption, Calculation, Conversion Factor, Emission Factor, Unit of Measure, Reporting Period, Baseline, Indicator, Total, Average, Rate, Percentage, Frequency, Data Owner, Data Collector, Reviewer, Approver, Collection Method, Data Boundary, Included/Excluded Data, Missing Data, Duplicate Data, Outlier, Data Gap, Correction, Version History, Evidence File, Retention, Verification, Traceability, Confidential Information, and Personal Data in plain English.
   - Documented explicit Structural Boundaries Matrix comparing ELH-18 with ELH-09 (ESG Basics), ELH-13 (Action Planning), ELH-14 (Departmental Goals), ELH-16 (Communicating), ELH-17 (Tracking Actions), ELH-19 (Performance Review), ELH-20 (Roles & Governance), and ELH-23 (Sustainability Initiatives).

3. **13-Part Applied Course Progression Implemented**:
   - **Opening Hook**: Mauritian hotel monthly spreadsheet reporting Electricity: 42 (no unit, cost vs kWh), Water: 1,850 (no unit, 6-week period), Waste Recycled: 65% (no denominator), Diesel: blank, Food Waste: 0 (entered as zero because nobody recorded it).
   - **Why Reliable Data Matters**: Operational efficiency, target tracking, period comparisons, procurement decisions, honest communication, and audit-ready continuity.
   - **Sourced Memorable Fact ("Did You Know?")**: Sourced block from ISO 14001:2015 Clause 9.1 & ISO 9001:2015 Clause 9.1 (*Monitoring, measurement, analysis & evaluation*) on retaining appropriate documented information as evidence of monitoring results without making unsupported performance claims.
   - **The SOURCE Data-Quality Framework**: 6-step operational framework (**S**elect correct source, **O**bserve period/boundary/unit, **U**pload or preserve supporting record, **R**ecord estimates & assumptions, **C**heck for gaps/duplicates/unusual values, **E**scalate unresolved issues & preserve corrections).
   - **Distinguishing Primary vs Secondary vs Estimates vs Missing Data**: Clear breakdown showing why entering zero for missing data distorts totals and why currency cost must never replace physical consumption units.
   - **High-Risk Mistakes & Safeguards**: Explicit rules against mixing currency costs with physical units, combining mismatched reporting periods, double-entry of invoices, replacing missing values with zero, or saving evidence in inaccessible personal drives.
   - **Worked Mauritian Workplace Scenario**: Grand Baie hotel monthly data collection log covering electricity (kWh), water (m³), generator diesel (L), general waste (tonnes), recyclable plastic (kg), food waste, and supplier packaging with clear units, boundaries, file links, and validation checks.
   - **Visual Identification Question**: Integrated realistic high-resolution photograph of a Mauritian commercial workplace office desk (`visual-sustainability-data-quality-check.png`) displaying a printed Monthly Sustainability Data Log Sheet with red sticky notes marking missing units for water ('1850'), zero entered for missing diesel fuel data ('0'), duplicate invoice references, and unverified percentages.
   - **Applied Decision Scenario**: Commercial facilities manager requesting monthly electricity data before the CEB invoice arrives (calculating sub-meter photo logs labelled as provisional meter readings).
   - **Role-Based Micro-Decisions**: Micro-decisions across 10 workplace roles.
   - **10 Scenario Quiz Questions**: Full answer explanations for all correct and incorrect options.
   - **Learner Commitment & Disclaimer**: Practical data collection commitments and practical disclaimer ("Practical workplace guidance; not independent assurance, environmental accreditation, statutory reporting certification, legal advice, or verification of an organization's environmental performance").

4. **Visual Media Asset**:
   - Created `artifacts/ecolearn/public/images/courses/visual-sustainability-data-quality-check.png`.

---

## Verification Results

- **Integration Tests**: `courseQualityStandardAudit.test.ts` passed **36/36 subtests (100%)**.
- **Typecheck**: `pnpm run typecheck` completed with **0 errors**.
- **Build**: `pnpm run build` completed with **0 errors**.
