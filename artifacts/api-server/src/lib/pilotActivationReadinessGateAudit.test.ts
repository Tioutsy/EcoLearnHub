import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluateActivationReadinessGate } from "../routes/pilots";

describe("Sprint 10E — Pilot Activation Readiness Gate Audit Suite", () => {
  const completePilot = {
    id: 1,
    companyId: 101,
    isTestRecord: false,
    recordEnvironment: "external_pilot",
    primaryContactName: "Jean Dupont",
    primaryContactEmail: "j.dupont@coralbay.mu",
    evidenceStatus: "ACCEPTED",
    plannedStartDate: new Date(),
    plannedEndDate: new Date(),
    approvedLearnerLimit: 50,
    selectedCourseIds: [1, 2, 3],
    internalOwnerUserId: "owner_123",
    hasActiveAdmin: true,
    unresolvedBlockerCount: 0,
  };

  test("1. Returns READY_FOR_EXTERNAL_PILOT_ACTIVATION when all 16 conditions pass", () => {
    const result = evaluateActivationReadinessGate(completePilot);
    assert.equal(result.passed, true);
    assert.equal(result.decisionCode, "READY_FOR_EXTERNAL_PILOT_ACTIVATION");
    assert.equal(result.missingRequirements.length, 0);
  });

  test("2. Fails when participation evidence is not accepted", () => {
    const incomplete = { ...completePilot, evidenceStatus: "NO_EVIDENCE" };
    const result = evaluateActivationReadinessGate(incomplete);
    assert.equal(result.passed, false);
    assert.ok(result.missingRequirements.some((r) => r.includes("Accepted participation evidence required")));
  });

  test("3. Fails when environment classification is 'test'", () => {
    const testPilot = { ...completePilot, isTestRecord: true, recordEnvironment: "test" };
    const result = evaluateActivationReadinessGate(testPilot);
    assert.equal(result.passed, false);
    assert.ok(result.missingRequirements.some((r) => r.includes("non-test environment")));
  });
});
