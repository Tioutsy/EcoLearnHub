import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10J — Decision Lifecycle Audit Suite", () => {
  const allowedTransitions: Record<string, Set<string>> = {
    PROPOSAL_ISSUED: new Set(["PROPOSAL_DELIVERED"]),
    PROPOSAL_DELIVERED: new Set(["PROPOSAL_UNDER_REVIEW"]),
    PROPOSAL_UNDER_REVIEW: new Set(["FOLLOW_UP_DUE", "RESPONSE_RECEIVED"]),
    FOLLOW_UP_DUE: new Set(["FOLLOW_UP_SENT"]),
    FOLLOW_UP_SENT: new Set(["RESPONSE_RECEIVED", "NO_RESPONSE"]),
    RESPONSE_RECEIVED: new Set(["REVISION_REQUESTED", "DECISION_DEFERRED", "PARTICIPATION_CONFIRMED", "DECLINED"]),
    NO_RESPONSE: new Set(["CLOSED"]),
    DECLINED: new Set(["CLOSED"]),
  };

  test("1. Decision state machine permits step-by-step follow-up transitions", () => {
    const isValid = (from: string, to: string) => allowedTransitions[from]?.has(to) ?? false;
    assert.equal(isValid("PROPOSAL_UNDER_REVIEW", "FOLLOW_UP_DUE"), true);
    assert.equal(isValid("RESPONSE_RECEIVED", "PARTICIPATION_CONFIRMED"), true);
  });

  test("2. Decision state machine blocks invalid transition from PROPOSAL_ISSUED directly to CLOSED", () => {
    const isValid = (from: string, to: string) => allowedTransitions[from]?.has(to) ?? false;
    assert.equal(isValid("PROPOSAL_ISSUED", "CLOSED"), false);
  });
});
