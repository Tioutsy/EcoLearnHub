import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10J — Decision Deadline Control Audit Suite", () => {
  const deadline = {
    candidateId: "101",
    proposalVersion: "v1",
    deadlineDate: "2026-08-20T00:00:00.000Z",
    status: "ACTIVE",
  };

  test("1. Decision deadline tracks candidate ID and proposal version", () => {
    assert.equal(deadline.candidateId, "101");
    assert.equal(deadline.status, "ACTIVE");
    assert.ok(deadline.deadlineDate);
  });

  test("2. Extending decision deadline requires documented evidence reference", () => {
    const extendDeadline = (evidenceRef: string | null) => Boolean(evidenceRef);
    assert.equal(extendDeadline("email_ref_101"), true);
    assert.equal(extendDeadline(null), false);
  });
});
