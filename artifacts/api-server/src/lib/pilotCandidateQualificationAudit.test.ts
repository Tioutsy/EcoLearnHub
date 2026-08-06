import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluateCandidateQualification } from "../routes/pilots";

describe("Sprint 10F — Candidate Qualification Audit Suite", () => {
  const completeCandidate = {
    primaryContactName: "Jean Dupont",
    primaryContactEmail: "j.dupont@coralbay.mu",
    approvedLearnerLimit: 50,
    selectedCourseIds: [1, 2, 3],
    internalOwnerUserId: "owner_101",
  };

  test("1. Candidate meeting all criteria evaluates as QUALIFIED_FOR_PROPOSAL", () => {
    const result = evaluateCandidateQualification(completeCandidate);
    assert.equal(result.qualified, true);
    assert.equal(result.score, 100);
    assert.equal(result.decisionCode, "QUALIFIED_FOR_PROPOSAL");
  });

  test("2. Candidate missing contact email fails qualification criteria", () => {
    const incomplete = { ...completeCandidate, primaryContactEmail: null };
    const result = evaluateCandidateQualification(incomplete);
    assert.equal(result.qualified, false);
    assert.equal(result.score, 75);
    assert.ok(result.missingCriteria.some((c) => c.includes("contact details missing")));
  });

  test("3. Qualification score threshold (>= 75) is enforced", () => {
    const lowScore = { primaryContactName: "Jean", primaryContactEmail: "j@coralbay.mu", approvedLearnerLimit: 5 };
    const result = evaluateCandidateQualification(lowScore);
    assert.equal(result.qualified, false);
  });
});
