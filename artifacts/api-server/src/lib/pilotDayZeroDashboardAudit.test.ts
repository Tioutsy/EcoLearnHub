import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10I — Day-0 Activation Dashboard Audit Suite", () => {
  const dashboardPayload = {
    pilotId: 101,
    companyId: 1,
    decisionStatus: "PROPOSAL_UNDER_REVIEW",
    proposalVersion: "v1",
    writtenAcceptanceStatus: "NO_EVIDENCE",
    acceptanceValidated: false,
    activationLifecycleStatus: "DECISION_PENDING",
    activationBlockedReason: "Written participation confirmation pending",
    finalDecision: "ACTIVATION_BLOCKED_REQUIRED_EVIDENCE_OUTSTANDING",
  };

  test("1. Day-0 dashboard overview payload reports correct evidence state", () => {
    assert.equal(dashboardPayload.pilotId, 101);
    assert.equal(dashboardPayload.acceptanceValidated, false);
    assert.equal(dashboardPayload.finalDecision, "ACTIVATION_BLOCKED_REQUIRED_EVIDENCE_OUTSTANDING");
  });

  test("2. Activation blocked reason is accurately populated", () => {
    assert.equal(dashboardPayload.activationBlockedReason, "Written participation confirmation pending");
  });
});
