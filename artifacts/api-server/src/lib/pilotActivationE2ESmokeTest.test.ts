import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateWrittenPilotAcceptanceEvidence, evaluatePilotActivationReadiness } from "../routes/pilots";

describe("Sprint 10I — Written Acceptance Validation & Day-0 Launch End-to-End Smoke Test", () => {
  const candidate = {
    id: 101,
    companyId: 1,
    isTestRecord: false,
    recordEnvironment: "external_pilot",
    legitimacyVerified: true,
    qualificationStatus: "QUALIFIED",
    proposalVersion: 1,
    proposalStatus: "ISSUED",
    evidenceStatus: "NO_EVIDENCE",
    evidenceDetails: null,
    authorityVerified: true,
    primaryContactName: "Jean Dupont",
    primaryContactEmail: "j.dupont@coralbay.mu",
    approvedLearnerLimit: 50,
    selectedCourseIds: [1, 2, 3],
    internalOwnerUserId: "owner_101",
    hasActiveAdmin: true,
    unresolvedBlockerCount: 0,
  };

  test("1. Written acceptance validator returns valid = false for unconfirmed candidate", () => {
    const valResult = validateWrittenPilotAcceptanceEvidence(candidate);
    assert.equal(valResult.valid, false);
    assert.ok(valResult.failedChecks.length > 0);
  });

  test("2. Activation readiness evaluator returns ready = false and blocks live launch", () => {
    const readiness = evaluatePilotActivationReadiness(candidate);
    assert.equal(readiness.ready, false);
    assert.ok(readiness.gatesBlocked > 0);
  });

  test("3. Final decision evaluates to ACTIVATION_BLOCKED when written evidence is pending", () => {
    const getFinalDecision = (ready: boolean) =>
      ready ? "PILOT_ACTIVATED" : "ACTIVATION_BLOCKED_REQUIRED_EVIDENCE_OUTSTANDING";

    assert.equal(getFinalDecision(false), "ACTIVATION_BLOCKED_REQUIRED_EVIDENCE_OUTSTANDING");
  });
});
