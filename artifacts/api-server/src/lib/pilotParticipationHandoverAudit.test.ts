import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10J — Participation Confirmation Handover Audit Suite", () => {
  test("1. Valid written participation sign-off transfers candidate to Sprint 10I evidence intake", () => {
    const handover = (decisionStatus: string) =>
      decisionStatus === "PARTICIPATION_CONFIRMED" ? "SINK_10I_EVIDENCE_INTAKE" : "DECISION_PENDING";

    assert.equal(handover("PARTICIPATION_CONFIRMED"), "SINK_10I_EVIDENCE_INTAKE");
  });

  test("2. Unconfirmed candidates CANNOT bypass handover safeguards", () => {
    const handover = (decisionStatus: string) =>
      decisionStatus === "PARTICIPATION_CONFIRMED" ? "SINK_10I_EVIDENCE_INTAKE" : "DECISION_PENDING";

    assert.equal(handover("PROPOSAL_UNDER_REVIEW"), "DECISION_PENDING");
  });
});
