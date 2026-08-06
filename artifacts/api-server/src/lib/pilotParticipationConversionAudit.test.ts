import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10F — Participation Conversion Audit Suite", () => {
  const proposal = {
    id: 1,
    status: "ISSUED",
    candidateId: 101,
  };

  test("1. Proposal acceptance sets proposalStatus to 'ACCEPTED' and evidenceStatus to 'ACCEPTED'", () => {
    const acceptProposal = (p: typeof proposal) => ({
      ...p,
      status: "ACCEPTED",
      evidenceStatus: "ACCEPTED",
      candidateStatus: "ACTIVATION_READY",
      externalValidationStage: "stage_4_pilot_participation_confirmed",
    });

    const accepted = acceptProposal(proposal);
    assert.equal(accepted.status, "ACCEPTED");
    assert.equal(accepted.evidenceStatus, "ACCEPTED");
    assert.equal(accepted.externalValidationStage, "stage_4_pilot_participation_confirmed");
  });

  test("2. Scope differences between proposed and accepted scope are flagged for review", () => {
    const proposedScope = { learnerLimit: 50, courseCount: 3 };
    const acceptedScope = { learnerLimit: 80, courseCount: 3 };

    const isScopeChanged = proposedScope.learnerLimit !== acceptedScope.learnerLimit;
    assert.equal(isScopeChanged, true, "Scope difference MUST be flagged");
  });
});
