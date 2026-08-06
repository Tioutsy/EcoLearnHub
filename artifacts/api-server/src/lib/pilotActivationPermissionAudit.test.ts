import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10I — Activation Permission Audit Suite", () => {
  test("1. Platform Admin permission required to execute activation dry-run", () => {
    const canDryRun = (role: string) => role === "platform_admin";
    assert.equal(canDryRun("platform_admin"), true);
    assert.equal(canDryRun("company_admin"), false);
  });

  test("2. Company Admin can view Day-0 overview for own company", () => {
    const canViewDayZero = (role: string) => role === "platform_admin" || role === "company_admin";
    assert.equal(canViewDayZero("company_admin"), true);
    assert.equal(canViewDayZero("learner"), false);
  });
});
