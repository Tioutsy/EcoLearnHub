import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluatePilotCandidateLegitimacy } from "../routes/pilots";

describe("Sprint 10J — Candidate Legitimacy Checkpoint Audit Suite", () => {
  const completeCandidate = {
    id: 101,
    isTestRecord: false,
    recordEnvironment: "external_pilot",
    legitimacyVerified: true,
    primaryContactName: "Jean Dupont",
    primaryContactEmail: "j.dupont@coralbay.mu",
  };

  test("1. Returns legitimate = true when candidate contact and domain are verified", () => {
    const result = evaluatePilotCandidateLegitimacy(completeCandidate);
    assert.equal(result.legitimate, true);
    assert.equal(result.failedChecks.length, 0);
  });

  test("2. Fails when candidate record is classified as test data", () => {
    const testCandidate = { ...completeCandidate, isTestRecord: true };
    const result = evaluatePilotCandidateLegitimacy(testCandidate);

    assert.equal(result.legitimate, false);
    assert.ok(result.failedChecks.some((f) => f.code === "TEST_RECORD_CLASSIFICATION"));
  });

  test("3. Fails when primary contact email is missing", () => {
    const missingContact = { ...completeCandidate, primaryContactEmail: null };
    const result = evaluatePilotCandidateLegitimacy(missingContact);

    assert.equal(result.legitimate, false);
    assert.ok(result.failedChecks.some((f) => f.code === "PRIMARY_CONTACT_MISSING"));
  });
});
