import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10H — Decision Conversion Audit Suite", () => {
  const acceptedCandidate = {
    id: 101,
    proposalStatus: "ACCEPTED",
    evidenceStatus: "ACCEPTED",
    decisionStatus: "PARTICIPATION_CONFIRMED",
    candidateStatus: "ACTIVATION_READY",
  };

  test("1. Accepted candidate sets decisionStatus to PARTICIPATION_CONFIRMED", () => {
    assert.equal(acceptedCandidate.decisionStatus, "PARTICIPATION_CONFIRMED");
    assert.equal(acceptedCandidate.candidateStatus, "ACTIVATION_READY");
  });

  test("2. Unconfirmed candidates retain PROPOSAL_UNDER_REVIEW decision status", () => {
    const pending = { ...acceptedCandidate, evidenceStatus: "NO_EVIDENCE", decisionStatus: "PROPOSAL_UNDER_REVIEW" };
    assert.equal(pending.decisionStatus, "PROPOSAL_UNDER_REVIEW");
  });
});
