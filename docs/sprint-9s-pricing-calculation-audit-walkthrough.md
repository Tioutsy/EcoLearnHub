# Sprint 9S — Pricing Calculation Audit & Per-Employee Presentation Correction Walkthrough

## Summary

Sprint 9S audits and corrects all pricing calculations, per-employee equivalent figures, display rounding, boundary handling, and explanatory notes across the Elevio platform.

---

## 1. Confirmed Pricing & Per-Employee Calculations

Official monthly company pricing and maximum-headcount per-employee equivalents:

| Employee Band | Monthly Company Price | Maximum Headcount | Calculated Per-Employee Equivalent | Display Wording |
| :--- | :--- | :--- | :--- | :--- |
| **Up to 25 employees** | MUR 3,000 | 25 | MUR 120.00 | `From MUR 120 per employee/month` |
| **26–50 employees** | MUR 4,500 | 50 | MUR 90.00 | `From MUR 90 per employee/month` |
| **51–80 employees** | MUR 5,000 | 80 | MUR 62.50 | `From MUR 62.50 per employee/month` |
| **81–120 employees** | MUR 6,250 | 120 | MUR 52.0833... → **MUR 52.08** | `From MUR 52.08 per employee/month` |
| **Over 120 employees** | Tailored quote | N/A | Calculated with quote | `Per-employee cost calculated with your quote` |

---

## 2. Defects Identified & Corrected

1. **Precision & Rounding Defect**: The `81–120` band previously displayed `From MUR 52.10 per employee/month` in configuration files. Corrected to `From MUR 52.08 per employee/month` ($6,250 \div 120 = 52.0833...$).
2. **Explanatory Note**: Confirmed presence of clear calculation disclosure on pricing displays:
   > *"Indicative per-employee amounts are calculated using the maximum number of employees included in each band. Your company subscription remains a fixed monthly fee based on your employee category."*

---

## 3. Files Updated
- `artifacts/ecolearn/src/config/pricing.ts`: Updated `FROM_81_TO_120` in `PER_EMPLOYEE_COST_MAP` and `PRICING_PLANS`.
- `artifacts/api-server/src/lib/pricingConstants.ts`: Updated `FROM_81_TO_120` string.
- `artifacts/api-server/src/lib/pricingClarity.test.ts`: Updated test assertion to `From MUR 52.08 per employee/month`.
- `artifacts/api-server/src/lib/pricingAudit.test.ts`: Added comprehensive test suite covering all 12 boundary counts, division math, rounding rules, and custom quote fallbacks.

---

## 4. Verification & Testing

### Automated Test Suites
- **`pricingAudit.test.ts`**: 16/16 subtests passed (`node --env-file=.env --test --import tsx ./src/lib/pricingAudit.test.ts`).
- **`pricingClarity.test.ts`**: 1/1 passed (`node --env-file=.env --test --import tsx ./src/lib/pricingClarity.test.ts`).
- **`legacyBrandAudit.test.ts`**: 1/1 passed (`node --test --import tsx ./src/lib/legacyBrandAudit.test.ts`).
- **Workspace Typecheck**: `pnpm run typecheck` passed (0 errors across all 4 workspace projects).
- **Production Build**: `pnpm --filter @workspace/ecolearn run build` passed (5.84s).
