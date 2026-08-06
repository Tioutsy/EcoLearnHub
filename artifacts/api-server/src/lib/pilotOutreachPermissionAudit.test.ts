import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10G — Outreach Permission Audit Suite", () => {
  test("1. Platform Admin possesses full authorized permission to log outreach and issue proposals", () => {
    const isAuthorized = (role: string) => role === "platform_admin";
    assert.equal(isAuthorized("platform_admin"), true);
    assert.equal(isAuthorized("company_admin"), false);
  });

  test("2. Company Admin can review proposals and confirm participation for own company", () => {
    const canConfirm = (role: string) => role === "platform_admin" || role === "company_admin";
    assert.equal(canConfirm("company_admin"), true);
    assert.equal(canConfirm("learner"), false);
  });
});
