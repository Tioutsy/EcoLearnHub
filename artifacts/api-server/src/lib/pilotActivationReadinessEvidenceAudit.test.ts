import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluatePilotActivationReadiness } from "../routes/pilots";

describe("Sprint 10I — Evidence-Backed Activation Readiness Audit Suite", () => {
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

  test("1. Returns ready = true when all 18 evidence-backed gates pass", () => {
    const result = evaluatePilotActivationReadiness(completePilot);
    assert.equal(result.ready, true);
    assert.equal(result.gatesPassed, 18);
    assert.equal(result.gatesBlocked, 0);
  });

  test("2. Returns ready = false and blocks activation when written evidence is missing", () => {
    const pending = { ...completePilot, evidenceStatus: "NO_EVIDENCE" };
    const result = evaluatePilotActivationReadiness(pending);

    assert.equal(result.ready, false);
    assert.ok(result.gatesBlocked > 0);
  });
});
