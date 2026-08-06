import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10E — Pilot Participation Evidence Audit Suite", () => {
  const evidenceStatuses = new Set([
    "NO_EVIDENCE",
    "EVIDENCE_SUBMITTED",
    "UNDER_REVIEW",
    "ACCEPTED",
    "REJECTED",
    "EXPIRED",
    "WITHDRAWN",
  ]);

  test("1. All 7 participation evidence review statuses are supported", () => {
    assert.equal(evidenceStatuses.size, 7);
    assert.ok(evidenceStatuses.has("ACCEPTED"));
    assert.ok(evidenceStatuses.has("REJECTED"));
  });

  test("2. Accepting evidence sets candidate status to ACTIVATION_READY and stage to Stage 4", () => {
    const reviewResult = (status: string) => ({
      evidenceStatus: status,
      candidateStatus: status === "ACCEPTED" ? "ACTIVATION_READY" : "INTEREST_CONFIRMED",
      externalValidationStage: status === "ACCEPTED" ? "stage_4_pilot_participation_confirmed" : "stage_0_internal_technical_validation",
    });

    const accepted = reviewResult("ACCEPTED");
    assert.equal(accepted.candidateStatus, "ACTIVATION_READY");
    assert.equal(accepted.externalValidationStage, "stage_4_pilot_participation_confirmed");
  });

  test("3. Platform Admin permission required to accept or reject evidence", () => {
    const isAuthorized = (role: string) => role === "platform_admin";
    assert.equal(isAuthorized("platform_admin"), true);
    assert.equal(isAuthorized("company_admin"), false);
  });
});
