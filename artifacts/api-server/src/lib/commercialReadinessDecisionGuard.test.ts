import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluateCommercialReadinessGuard } from "../routes/pilots";

describe("Sprint 10D — Commercial Readiness Decision Guard Audit Suite", () => {
  test("1. Returns CONDITIONAL_GO when only test or candidate records exist", () => {
    const pilots = [
      { isTestRecord: true, recordEnvironment: "test", pilotStatus: "completed" },
      { isTestRecord: false, recordEnvironment: "external_pilot", pilotStatus: "preparing" },
    ];

    const result = evaluateCommercialReadinessGuard(pilots);
    assert.equal(result.gateDecision, "CONDITIONAL_GO");
    assert.equal(result.gateStatus, "CONDITIONAL_GO_READY_FOR_FIRST_EXTERNAL_PILOT");
  });

  test("2. Returns GO only when a real non-test external pilot reaches completed status", () => {
    const pilots = [
      { isTestRecord: false, recordEnvironment: "external_pilot", pilotStatus: "completed" },
    ];

    const result = evaluateCommercialReadinessGuard(pilots);
    assert.equal(result.gateDecision, "GO");
    assert.equal(result.gateStatus, "GO_COMMERCIAL_ONBOARDING_AUTHORIZED");
  });

  test("3. Decision reasons state evidence source explicitly", () => {
    const result = evaluateCommercialReadinessGuard([]);
    assert.ok(result.reason.includes("Internal technical validation and governance framework complete"));
  });
});
