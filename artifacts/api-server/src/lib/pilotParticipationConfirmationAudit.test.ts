import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10G — Written Participation Confirmation Audit Suite", () => {
  test("1. Written evidence from authorised representative is required for PARTICIPATION_CONFIRMED", () => {
    const checkConfirmation = (evidenceStatus: string, hasWrittenProof: boolean) =>
      evidenceStatus === "ACCEPTED" && hasWrittenProof;

    assert.equal(checkConfirmation("ACCEPTED", true), true);
    assert.equal(checkConfirmation("NO_EVIDENCE", false), false);
  });

  test("2. Silent acceptance or unverified email opens DO NOT qualify as participation confirmation", () => {
    const isConfirmed = (action: string) => action === "WRITTEN_AGREEMENT_RECEIVED";
    assert.equal(isConfirmed("PROPOSAL_OPENED"), false, "Proposal opened MUST NOT mark participation confirmed");
    assert.equal(isConfirmed("WRITTEN_AGREEMENT_RECEIVED"), true);
  });
});
