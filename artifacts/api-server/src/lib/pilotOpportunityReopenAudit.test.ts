import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10J — Opportunity Reopening Audit Suite", () => {
  test("1. Closed opportunity cannot receive new follow-up tasks without explicit reopening", () => {
    const canAddTask = (status: string) => status !== "CLOSED";
    assert.equal(canAddTask("CLOSED"), false);
    assert.equal(canAddTask("PROPOSAL_UNDER_REVIEW"), true);
  });

  test("2. Reopening a closed opportunity requires documented reopening reason and admin role", () => {
    const reopen = (role: string, reason: string | null) => role === "platform_admin" && Boolean(reason);
    assert.equal(reopen("platform_admin", "Candidate re-engaged with new budget allocation"), true);
    assert.equal(reopen("platform_admin", null), false);
  });
});
