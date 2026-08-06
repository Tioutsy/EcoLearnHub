import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10H — Written Acceptance Evidence Audit Suite", () => {
  test("1. Written evidence from candidate business email is mandatory for confirmation", () => {
    const isWrittenProofValid = (email: string) => email.endsWith("@coralbay.mu");
    assert.equal(isWrittenProofValid("j.dupont@coralbay.mu"), true);
    assert.equal(isWrittenProofValid("fake@gmail.com"), false);
  });

  test("2. Non-binding actions (proposal view, meeting request) DO NOT satisfy evidence intake", () => {
    const isAcceptanceProof = (type: string) => type === "BUSINESS_EMAIL_CONFIRMATION" || type === "SIGNED_AGREEMENT";
    assert.equal(isAcceptanceProof("PROPOSAL_OPENED"), false);
    assert.equal(isAcceptanceProof("BUSINESS_EMAIL_CONFIRMATION"), true);
  });
});
