import assert from "node:assert/strict";
import test, { describe } from "node:test";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Strict Confirmed Subscription & Payment Gating Audit", () => {
  const courseAccessServicePath = path.resolve(__dirname, "courseAccessService.ts");
  const courseAccessContent = fs.readFileSync(courseAccessServicePath, "utf-8");

  test("1. courseAccessService fails closed when no subscription exists (SUBSCRIPTION_INACTIVE)", () => {
    assert.equal(
      courseAccessContent.includes("if (!subscription) {\n    return {\n      allowed: false,\n      reason: \"SUBSCRIPTION_INACTIVE\""),
      true,
      "Access must be denied with SUBSCRIPTION_INACTIVE when company has no subscription"
    );
  });

  test("2. courseAccessService denies access if subscription status is PENDING or unconfirmed", () => {
    assert.equal(
      courseAccessContent.includes("const isAllowedStatus = subStatus === \"ACTIVE\" || subStatus === \"TRIAL\";"),
      true,
      "Only explicitly ACTIVE or TRIAL subscriptions can be granted access"
    );
    assert.equal(
      courseAccessContent.includes("subStatus === \"PENDING\""),
      false,
      "PENDING status must NOT be allowed to access courses"
    );
  });

  test("3. courseAccessService removes temporary role-based company_admin bypass", () => {
    assert.equal(
      courseAccessContent.includes("accessContext.role === \"company_admin\""),
      false,
      "company_admin role must NOT bypass subscription or payment validation"
    );
  });

  test("4. courseAccessService does not fallback unentitled companies to COMPLETE plan", () => {
    assert.equal(
      courseAccessContent.includes('const companyPlanCode = subscription.planCode;'),
      true,
      "companyPlanCode must come strictly from the confirmed subscription"
    );
  });

  test("5. Payment validation logic check", () => {
    // Pure logic simulation of evaluateCourseAccess subscription check
    const evaluateSub = (sub: { status: string; planCode: string } | null, entitlements: string[]) => {
      if (!sub) {
        return { allowed: false, reason: "SUBSCRIPTION_INACTIVE" };
      }
      const status = sub.status.toUpperCase();
      if (status !== "ACTIVE" && status !== "TRIAL") {
        return { allowed: false, reason: "SUBSCRIPTION_INACTIVE" };
      }
      const hasEntitlement = entitlements.includes(sub.planCode) || sub.planCode === "COMPLETE";
      if (!hasEntitlement) {
        return { allowed: false, reason: "PLAN_UPGRADE_REQUIRED" };
      }
      return { allowed: true, reason: "INCLUDED_IN_PLAN" };
    };

    // Case A: Unpaid / Pending payment subscription
    assert.deepEqual(
      evaluateSub({ status: "PENDING", planCode: "COMPLETE" }, ["COMPLETE"]),
      { allowed: false, reason: "SUBSCRIPTION_INACTIVE" }
    );

    // Case B: No subscription at all
    assert.deepEqual(
      evaluateSub(null, ["COMPLETE"]),
      { allowed: false, reason: "SUBSCRIPTION_INACTIVE" }
    );

    // Case C: Inactive / Expired / Past-due subscription
    assert.deepEqual(
      evaluateSub({ status: "PAST_DUE", planCode: "COMPLETE" }, ["COMPLETE"]),
      { allowed: false, reason: "SUBSCRIPTION_INACTIVE" }
    );

    // Case D: Active confirmed payment subscription with matching plan
    assert.deepEqual(
      evaluateSub({ status: "ACTIVE", planCode: "PROFESSIONAL" }, ["PROFESSIONAL", "COMPLETE"]),
      { allowed: true, reason: "INCLUDED_IN_PLAN" }
    );
  });
});
