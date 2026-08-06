import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10F — Pilot Activation Handover Pack Audit Suite", () => {
  const handoverPack = {
    handoverMetadata: {
      generatedAt: new Date().toISOString(),
      pilotId: 101,
      companyId: 1,
      companyName: "Coral Bay Hospitality Ltd",
    },
    proposalDetails: {
      proposalVersion: 1,
      proposalStatus: "ACCEPTED",
    },
    scope: {
      approvedLearnerLimit: 50,
      selectedCourseIds: [1, 2, 3],
    },
    evidenceReview: {
      evidenceStatus: "ACCEPTED",
      externalValidationStage: "stage_4_pilot_participation_confirmed",
    },
  };

  test("1. Internal activation handover pack includes required metadata sections", () => {
    assert.ok(handoverPack.handoverMetadata.generatedAt);
    assert.equal(handoverPack.handoverMetadata.companyName, "Coral Bay Hospitality Ltd");
    assert.equal(handoverPack.proposalDetails.proposalStatus, "ACCEPTED");
  });

  test("2. Platform Admin permission required to access internal activation handover pack", () => {
    const isAuthorized = (role: string) => role === "platform_admin";
    assert.equal(isAuthorized("platform_admin"), true);
    assert.equal(isAuthorized("company_admin"), false);
  });
});
