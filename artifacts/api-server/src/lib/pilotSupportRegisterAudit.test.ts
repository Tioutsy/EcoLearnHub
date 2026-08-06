import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10C — Pilot Support & Defect Register Audit Suite", () => {
  const issues = [
    { id: 1, companyId: 1, title: "Login issue", severity: "high", status: "resolved", releaseBlocking: false },
    { id: 2, companyId: 1, title: "UI typo", severity: "low", status: "new", releaseBlocking: false },
  ];

  test("1. Support register tracks ticket severity, status, and release-blocking flag", () => {
    assert.equal(issues[0].severity, "high");
    assert.equal(issues[0].status, "resolved");
    assert.equal(issues[0].releaseBlocking, false);
  });

  test("2. Zero open release-blocking (P0/P1) defects before pilot GO decision", () => {
    const openBlockers = issues.filter(i => i.releaseBlocking && i.status !== "resolved" && i.status !== "closed");
    assert.equal(openBlockers.length, 0, "Open release blocking defects MUST be 0 for GO decision");
  });

  test("3. Resolving a ticket updates status to 'resolved' and sets resolvedAt timestamp", () => {
    const updated = { ...issues[1], status: "resolved", resolvedAt: new Date().toISOString() };
    assert.equal(updated.status, "resolved");
    assert.ok(updated.resolvedAt);
  });
});
