# Sprint 8R Walkthrough — ELH-07 Carbon Footprint Awareness Course Upgrade

Sprint 8R has successfully reviewed, corrected, and upgraded **ELH-07 — Carbon Footprint Awareness** to meet the 13-part EcoLearnHub Course Quality Standard established in Sprint 8K.

---

## Technical Highlights & Key Changes

1. **Course Quality Score Upgrade**:
   - Baseline Score: **68 / 100** (1 Release Blocker)
   - Final Upgraded Score: **96 / 100** (**0 Release Blockers**, **RELEASE READY**)

2. **Plain-Language Carbon Vocabulary & Scope 1–3 Framework**:
   - Defined Greenhouse Gases (GHG), Carbon Footprint, $CO_2e$, Activity Data (litres, kWh, km), and Emission Factors in plain English.
   - Introduced Scope 1 (Direct emissions: fuel, AC refrigerants), Scope 2 (Purchased energy: electricity), and Scope 3 (Value-chain emissions: goods, travel, waste).
   - Documented explicit Duplication & Progression Matrix in review document.

3. **13-Part Course Progression Applied**:
   - **Opening Hook**: Realistic manager query on footprint increase, contrasting guessed claims vs. operational data.
   - **Sourced Memorable Fact ("Did You Know?")**: Sourced block from IPCC / GHG Protocol on fluorinated refrigerant gas warming potentials (up to 2,000x $CO_2$).
   - **The Workplace Carbon Map**: Energy, Transport, Goods & Services, Waste, and Refrigerants & Leaks.
   - **Carbon Claims Safeguards**: Controlled guidance forbidding guessed activity figures or unverified "zero-carbon" marketing claims.
   - **Visual Identification Question**: Integrated realistic high-resolution photograph of a Mauritian operations desk (`visual-workplace-carbon-data.png`) assessing activity data receipts vs. direct refrigerant leaks vs. unsupported public claims.
   - **Applied Workplace Scenario**: Footprint increase scenario where electricity fell but total footprint rose due to generator diesel fuel or AC refrigerant leaks.
   - **5 Comprehensive Quiz Questions**: Full answer explanations for all correct and incorrect options.
   - **Learner Commitment**: Daily workplace carbon awareness commitments.

4. **Visual Media Asset**:
   - Created `artifacts/ecolearn/public/images/courses/visual-workplace-carbon-data.png`.

---

## Verification Results

- **Integration Tests**: `courseQualityStandardAudit.test.ts` passed **14/14 subtests (100%)**.
- **Typecheck**: `pnpm run typecheck` completed with **0 errors**.
- **Build**: `pnpm run build` completed with **0 errors**.
