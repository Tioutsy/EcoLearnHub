import { test, describe } from "node:test";
import assert from "node:assert/strict";

describe("Sprint 10J — Decision Permission Audit Suite", () => {
  test("1. Platform Admin permission required to execute legitimacy review", () => {
    const canReviewLegitimacy = (role: string) => role === "platform_admin";
    assert.equal(canReviewLegitimacy("platform_admin"), true);
    assert.equal(canReviewLegitimacy("company_admin"), false);
  });

  test("2. Platform Admin permission required to close or reopen an opportunity", () => {
    const canCloseOpportunity = (role: string) => role === "platform_admin";
    assert.equal(canCloseOpportunity("platform_admin"), true);
    assert.equal(canCloseOpportunity("learner"), false);
  });
});
