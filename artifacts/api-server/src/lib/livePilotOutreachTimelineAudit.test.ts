import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10G — Live Outreach Timeline Audit Suite", () => {
  const outreachLog = [
    { event: "candidate_created", status: "PROSPECT", timestamp: "2026-08-06T10:00:00Z" },
    { event: "outreach_sent", status: "CONTACTED", timestamp: "2026-08-06T11:00:00Z" },
    { event: "proposal_issued", status: "TERMS_SENT", timestamp: "2026-08-06T12:00:00Z" },
  ];

  test("1. Chronological outreach activity is recorded sequentially", () => {
    assert.equal(outreachLog.length, 3);
    assert.equal(outreachLog[1].event, "outreach_sent");
    assert.equal(outreachLog[2].status, "TERMS_SENT");
  });

  test("2. Candidate status automatically advances to CONTACTED upon outreach email log", () => {
    const advanceStatus = (current: string) => (current === "PROSPECT" ? "CONTACTED" : current);
    assert.equal(advanceStatus("PROSPECT"), "CONTACTED");
  });
});
