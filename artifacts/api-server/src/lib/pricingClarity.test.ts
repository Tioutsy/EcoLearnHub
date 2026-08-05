import assert from "node:assert/strict";
import test from "node:test";
import { PER_EMPLOYEE_COST_MAP, INDICATIVE_CALCULATION_NOTE } from "./pricingConstants";

test("Pricing Page Per-Employee Cost Clarity Verification", () => {
  // 1. Verify exact supporting copy for every employee band
  assert.equal(
    PER_EMPLOYEE_COST_MAP["UP_TO_25"],
    "From MUR 120 per employee/month",
    "Up to 25 employees must show 'From MUR 120 per employee/month'"
  );

  assert.equal(
    PER_EMPLOYEE_COST_MAP["FROM_26_TO_50"],
    "From MUR 90 per employee/month",
    "26–50 employees must show 'From MUR 90 per employee/month'"
  );

  assert.equal(
    PER_EMPLOYEE_COST_MAP["FROM_51_TO_80"],
    "From MUR 62.50 per employee/month",
    "51–80 employees must show 'From MUR 62.50 per employee/month'"
  );

  assert.equal(
    PER_EMPLOYEE_COST_MAP["FROM_81_TO_120"],
    "From MUR 52.08 per employee/month",
    "81–120 employees must show 'From MUR 52.08 per employee/month'"
  );

  assert.equal(
    PER_EMPLOYEE_COST_MAP["OVER_120"],
    "Per-employee cost calculated with your quote",
    "More than 120 employees must show 'Per-employee cost calculated with your quote'"
  );

  // 2. Verify discreet calculation note exact wording
  assert.equal(
    INDICATIVE_CALCULATION_NOTE,
    "Indicative per-employee amounts are calculated using the maximum number of employees included in each band. Your company subscription remains a fixed monthly fee based on your employee category.",
    "Explanatory calculation note text must match exact prompt requirement"
  );
});
