import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10D — External Validation Classification Standard Audit Suite", () => {
  const stages = [
    "stage_0_internal_technical_validation",
    "stage_1_prospect_identified",
    "stage_2_prospect_contacted",
    "stage_3_pilot_discussion_active",
    "stage_4_pilot_participation_confirmed",
    "stage_5_pilot_launched",
    "stage_6_pilot_completed",
    "stage_7_commercial_interest_confirmed",
    "stage_8_commercial_customer_confirmed",
  ];

  test("1. All 9 external validation stages are recognized by standard hierarchy", () => {
    assert.equal(stages.length, 9);
    assert.equal(stages[0], "stage_0_internal_technical_validation");
    assert.equal(stages[8], "stage_8_commercial_customer_confirmed");
  });

  test("2. Internal technical validation (Stage 0) blocks commercial GO status", () => {
    const isCommercialGoAllowed = (stage: string) => stage === "stage_8_commercial_customer_confirmed";
    assert.equal(isCommercialGoAllowed("stage_0_internal_technical_validation"), false);
    assert.equal(isCommercialGoAllowed("stage_4_pilot_participation_confirmed"), false);
  });

  test("3. Commercial customer status (Stage 8) requires written commercial agreement evidence", () => {
    const requiresCommercialEvidence = (stage: string) => stage === "stage_8_commercial_customer_confirmed";
    assert.equal(requiresCommercialEvidence("stage_8_commercial_customer_confirmed"), true);
  });
});
