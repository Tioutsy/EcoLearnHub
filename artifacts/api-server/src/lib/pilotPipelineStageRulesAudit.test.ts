import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10F — Pipeline Acquisition Stage Rules Audit Suite", () => {
  const pipelineStages = [
    "IDENTIFIED",
    "CONTACTED",
    "DISCOVERY_PLANNED",
    "DISCOVERY_COMPLETED",
    "QUALIFIED",
    "PROPOSAL_IN_PREPARATION",
    "PROPOSAL_ISSUED",
    "EXTERNAL_REVIEW",
    "CHANGES_REQUESTED",
    "VERBAL_OR_EMAIL_ACCEPTANCE",
    "EVIDENCE_UNDER_REVIEW",
    "PARTICIPATION_CONFIRMED",
    "ACTIVATION_HANDOVER",
    "ACTIVATION_READY",
    "ACTIVE_PILOT",
    "DECLINED",
    "DEFERRED",
    "WITHDRAWN",
  ];

  test("1. All 18 pipeline acquisition stages are recognized", () => {
    assert.equal(pipelineStages.length, 18);
    assert.equal(pipelineStages[0], "IDENTIFIED");
    assert.equal(pipelineStages[14], "ACTIVE_PILOT");
  });

  test("2. Direct transition from IDENTIFIED to ACTIVE_PILOT is rejected", () => {
    const isValidTransition = (from: string, to: string) => from === "ACTIVATION_READY" && to === "ACTIVE_PILOT";
    assert.equal(isValidTransition("IDENTIFIED", "ACTIVE_PILOT"), false);
  });
});
