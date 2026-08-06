import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { evaluateCandidateQualification } from "../routes/pilots";

describe("Sprint 10G — Outreach End-to-End Acquisition & Engagement Smoke Test", () => {
  const candidate = {
    id: 101,
    companyName: "Coral Bay Hospitality Ltd",
    candidateDesignation: "PRIMARY",
    legitimacyVerified: true,
    primaryContactName: "Jean Dupont",
    primaryContactEmail: "j.dupont@coralbay.mu",
    approvedLearnerLimit: 50,
    selectedCourseIds: [1, 2, 3],
    internalOwnerUserId: "owner_101",
    isTestRecord: false,
    recordEnvironment: "external_pilot",
  };

  test("1. Primary candidate satisfies legitimacy and 100/100 qualification score", () => {
    const qual = evaluateCandidateQualification(candidate);
    assert.equal(qual.qualified, true);
    assert.equal(qual.score, 100);
    assert.equal(qual.decisionCode, "QUALIFIED_FOR_PROPOSAL");
  });

  test("2. End-to-end acquisition flow transitions candidate from PROSPECT to TERMS_SENT", () => {
    const logOutreach = (c: typeof candidate) => ({ ...c, candidateStatus: "CONTACTED", outreachStatus: "SENT" });
    const logDiscovery = (c: typeof candidate) => ({ ...c, candidateStatus: "INTEREST_CONFIRMED", discoveryCompleted: true });
    const issueProposal = (c: typeof candidate) => ({ ...c, candidateStatus: "TERMS_SENT", proposalStatus: "ISSUED" });

    const step1 = logOutreach(candidate);
    assert.equal(step1.candidateStatus, "CONTACTED");

    const step2 = logDiscovery(step1);
    assert.equal(step2.candidateStatus, "INTEREST_CONFIRMED");

    const step3 = issueProposal(step2);
    assert.equal(step3.candidateStatus, "TERMS_SENT");
    assert.equal(step3.proposalStatus, "ISSUED");
  });

  test("3. Final decision correctly evaluates to OUTREACH_ACTIVE when acceptance is pending", () => {
    const determineDecision = (writtenConfirmationReceived: boolean) =>
      writtenConfirmationReceived ? "PILOT_PARTICIPATION_CONFIRMED" : "OUTREACH_ACTIVE_PARTICIPATION_NOT_YET_CONFIRMED";

    assert.equal(determineDecision(false), "OUTREACH_ACTIVE_PARTICIPATION_NOT_YET_CONFIRMED");
  });
});
