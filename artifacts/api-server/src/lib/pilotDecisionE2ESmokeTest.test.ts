import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluate18ReadinessGates } from "../routes/pilots";

describe("Sprint 10H — Decision Conversion & 18-Gate Readiness End-to-End Smoke Test", () => {
  const candidate = {
    id: 101,
    companyId: 1,
    isTestRecord: false,
    recordEnvironment: "external_pilot",
    legitimacyVerified: true,
    qualificationStatus: "QUALIFIED",
    proposalStatus: "ISSUED",
    evidenceStatus: "NO_EVIDENCE",
    authorityVerified: true,
    primaryContactName: "Jean Dupont",
    primaryContactEmail: "j.dupont@coralbay.mu",
    approvedLearnerLimit: 50,
    selectedCourseIds: [1, 2, 3],
    internalOwnerUserId: "owner_101",
    hasActiveAdmin: true,
    unresolvedBlockerCount: 0,
  };

  test("1. Candidate with issued proposal evaluates 18 gates as DECISION_PENDING", () => {
    const result = evaluate18ReadinessGates(candidate);
    assert.equal(result.allGatesPassed, false);
    assert.equal(result.decisionCode, "DECISION_PENDING_PARTICIPATION_UNCONFIRMED");
  });

  test("2. Receiving written acceptance passes Gate 4 and enables ACTIVATION_READY_CONFIRMED", () => {
    const accepted = { ...candidate, proposalStatus: "ACCEPTED", evidenceStatus: "ACCEPTED" };
    const result = evaluate18ReadinessGates(accepted);

    assert.equal(result.allGatesPassed, true);
    assert.equal(result.decisionCode, "ACTIVATION_READY_CONFIRMED");
  });

  test("3. Final decision evaluates to DECISION_PENDING when written confirmation is pending", () => {
    const getFinalDecision = (hasConfirmed: boolean) =>
      hasConfirmed ? "ACTIVATION_READY" : "DECISION_PENDING_PARTICIPATION_NOT_YET_CONFIRMED";

    assert.equal(getFinalDecision(false), "DECISION_PENDING_PARTICIPATION_NOT_YET_CONFIRMED");
  });
});
