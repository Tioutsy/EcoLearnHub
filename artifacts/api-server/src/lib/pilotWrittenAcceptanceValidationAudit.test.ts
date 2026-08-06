import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { validateWrittenPilotAcceptanceEvidence } from "../routes/pilots";

describe("Sprint 10I — Written Pilot Acceptance Evidence Validator Audit Suite", () => {
  const completePilot = {
    id: 101,
    companyId: 1,
    proposalVersion: 1,
    proposalStatus: "ISSUED",
    evidenceStatus: "ACCEPTED",
    evidenceDetails: "Signed agreement uploaded: coral_bay_acceptance_v1.pdf",
    authorityVerified: true,
    primaryContactName: "Jean Dupont",
    primaryContactEmail: "j.dupont@coralbay.mu",
    approvedLearnerLimit: 50,
    selectedCourseIds: [1, 2, 3],
  };

  test("1. Returns valid = true when all 18 written acceptance criteria pass", () => {
    const result = validateWrittenPilotAcceptanceEvidence(completePilot);
    assert.equal(result.valid, true);
    assert.equal(result.failedChecks.length, 0);
    assert.equal(result.proposalVersion, "v1");
  });

  test("2. Fails when evidence details reference is missing", () => {
    const missingDetails = { ...completePilot, evidenceDetails: "" };
    const result = validateWrittenPilotAcceptanceEvidence(missingDetails);

    assert.equal(result.valid, false);
    assert.ok(result.failedChecks.some((f) => f.code === "EVIDENCE_DETAILS_MISSING"));
  });

  test("3. Fails when representative authority is unverified", () => {
    const unverified = { ...completePilot, authorityVerified: false };
    const result = validateWrittenPilotAcceptanceEvidence(unverified);

    assert.equal(result.valid, false);
    assert.ok(result.failedChecks.some((f) => f.code === "AUTHORITY_UNVERIFIED"));
  });
});
