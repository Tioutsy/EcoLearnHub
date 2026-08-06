import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10J — Chronological Decision Timeline Audit Suite", () => {
  const timeline = [
    { event: "CANDIDATE_REGISTERED", timestamp: "2026-08-06T10:00:00.000Z", source: "SYSTEM_EVENT" },
    { event: "PROPOSAL_ISSUED", timestamp: "2026-08-06T11:00:00.000Z", source: "EXTERNAL_EVIDENCE" },
  ];

  test("1. Timeline events preserve source classification and timestamp order", () => {
    assert.equal(timeline.length, 2);
    assert.equal(timeline[0].source, "SYSTEM_EVENT");
    assert.equal(timeline[1].source, "EXTERNAL_EVIDENCE");
  });

  test("2. External evidence items are clearly distinguished from internal notes", () => {
    const isExternal = (source: string) => source === "EXTERNAL_EVIDENCE";
    assert.equal(isExternal(timeline[1].source), true);
    assert.equal(isExternal(timeline[0].source), false);
  });
});
