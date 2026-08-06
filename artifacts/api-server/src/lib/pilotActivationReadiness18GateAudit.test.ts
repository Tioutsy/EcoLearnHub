import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluate18ReadinessGates } from "../routes/pilots";

describe("Sprint 10H — 18 Controlled Activation Readiness Gates Audit Suite", () => {
  const completePilot = {
    id: 101,
    companyId: 1,
    isTestRecord: false,
    recordEnvironment: "external_pilot",
    legitimacyVerified: true,
    qualificationStatus: "QUALIFIED",
    proposalStatus: "ACCEPTED",
    evidenceStatus: "ACCEPTED",
    authorityVerified: true,
    primaryContactName: "Jean Dupont",
    primaryContactEmail: "j.dupont@coralbay.mu",
    approvedLearnerLimit: 50,
    selectedCourseIds: [1, 2, 3],
    internalOwnerUserId: "owner_101",
    hasActiveAdmin: true,
    unresolvedBlockerCount: 0,
  };

  test("1. Returns ACTIVATION_READY_CONFIRMED when all 18 gates pass", () => {
    const result = evaluate18ReadinessGates(completePilot);
    assert.equal(result.allGatesPassed, true);
    assert.equal(result.decisionCode, "ACTIVATION_READY_CONFIRMED");
    assert.equal(result.gateResults.length, 18);
  });

  test("2. Fails when Gate 4 (Written Acceptance) is incomplete", () => {
    const pending = { ...completePilot, evidenceStatus: "NO_EVIDENCE" };
    const result = evaluate18ReadinessGates(pending);

    assert.equal(result.allGatesPassed, false);
    assert.equal(result.decisionCode, "DECISION_PENDING_PARTICIPATION_UNCONFIRMED");
    const gate4 = result.gateResults.find((g) => g.gateNumber === 4);
    assert.equal(gate4?.passed, false);
  });

  test("3. Fails when environment classification is test", () => {
    const testPilot = { ...completePilot, isTestRecord: true };
    const result = evaluate18ReadinessGates(testPilot);

    assert.equal(result.allGatesPassed, false);
  });
});
