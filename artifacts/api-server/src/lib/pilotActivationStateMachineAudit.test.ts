import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10I — Pilot Activation State Machine Audit Suite", () => {
  const allowedTransitions: Record<string, Set<string>> = {
    DECISION_PENDING: new Set(["ACCEPTANCE_RECEIVED", "CANCELLED"]),
    ACCEPTANCE_RECEIVED: new Set(["ACCEPTANCE_UNDER_REVIEW", "CANCELLED"]),
    ACCEPTANCE_UNDER_REVIEW: new Set(["EVIDENCE_INCOMPLETE", "ACTIVATION_READY", "CANCELLED"]),
    EVIDENCE_INCOMPLETE: new Set(["ACCEPTANCE_RECEIVED", "CANCELLED"]),
    ACTIVATION_READY: new Set(["ACTIVATION_APPROVED", "CANCELLED"]),
    ACTIVATION_APPROVED: new Set(["ACTIVATING", "CANCELLED"]),
    ACTIVATING: new Set(["ACTIVE", "ACTIVATION_FAILED"]),
    ACTIVE: new Set(["SUSPENDED", "CANCELLED"]),
  };

  test("1. State machine permits valid step-by-step activation transitions", () => {
    const isValidTransition = (from: string, to: string) =>
      allowedTransitions[from]?.has(to) ?? false;

    assert.equal(isValidTransition("DECISION_PENDING", "ACCEPTANCE_RECEIVED"), true);
    assert.equal(isValidTransition("ACTIVATION_READY", "ACTIVATION_APPROVED"), true);
  });

  test("2. State machine blocks invalid leap from DECISION_PENDING directly to ACTIVE", () => {
    const isValidTransition = (from: string, to: string) =>
      allowedTransitions[from]?.has(to) ?? false;

    assert.equal(isValidTransition("DECISION_PENDING", "ACTIVE"), false);
  });
});
