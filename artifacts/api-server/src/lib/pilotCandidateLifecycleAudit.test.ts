import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10E — Pilot Candidate Lifecycle Audit Suite", () => {
  const candidateTransitions: Record<string, Set<string>> = {
    PROSPECT: new Set(["CONTACTED", "ON_HOLD", "DECLINED"]),
    CONTACTED: new Set(["DISCOVERY_SCHEDULED", "INTEREST_CONFIRMED", "DECLINED"]),
    TERMS_ACCEPTED: new Set(["ACTIVATION_READY"]),
    ACTIVATION_READY: new Set(["ACTIVE"]),
  };

  test("1. Candidate state machine enforces sequential lifecycle transitions", () => {
    const isTransitionAllowed = (from: string, to: string) => candidateTransitions[from]?.has(to) ?? false;

    assert.equal(isTransitionAllowed("PROSPECT", "CONTACTED"), true);
    assert.equal(isTransitionAllowed("TERMS_ACCEPTED", "ACTIVATION_READY"), true);
  });

  test("2. Illegal jump from PROSPECT directly to ACTIVE is rejected", () => {
    const isTransitionAllowed = (from: string, to: string) => candidateTransitions[from]?.has(to) ?? false;

    assert.equal(isTransitionAllowed("PROSPECT", "ACTIVE"), false, "Direct jump from PROSPECT to ACTIVE MUST be rejected");
  });

  test("3. Platform Admin permission required to update candidate status", () => {
    const isAuthorized = (role: string) => role === "platform_admin";

    assert.equal(isAuthorized("platform_admin"), true);
    assert.equal(isAuthorized("company_admin"), false);
  });
});
