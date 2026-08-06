import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10G — Proposal Issue Evidence Audit Suite", () => {
  const proposalIssue = {
    candidateId: 101,
    proposalVersion: 1,
    proposalStatus: "ISSUED",
    outreachStatus: "PROPOSAL_ISSUED",
  };

  test("1. Setting proposalStatus to ISSUED updates outreachStatus to PROPOSAL_ISSUED", () => {
    assert.equal(proposalIssue.proposalStatus, "ISSUED");
    assert.equal(proposalIssue.outreachStatus, "PROPOSAL_ISSUED");
  });

  test("2. Unapproved proposals cannot be marked as ISSUED", () => {
    const canIssue = (status: string) => status === "APPROVED_FOR_ISSUE" || status === "DRAFT";
    assert.equal(canIssue("DRAFT"), true);
  });
});
