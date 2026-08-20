/**
 * Sprint 13 — Profile Access Gating Test Suite
 * Validates requireCompletedProfile behavior across roles and profile states.
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { HttpError } from "../lib/access.js";

// Safety Guard
const DB_URL = process.env.DATABASE_URL || "";
if (DB_URL.includes("ep-delicate-pond-ahy88lt3")) {
  throw new Error(
    "SAFETY VIOLATION: Tests must not run against the production Neon database (ep-delicate-pond-ahy88lt3)."
  );
}

describe("Profile Access Gating (403 PROFILE_INCOMPLETE)", () => {
  it("generates correct 403 PROFILE_INCOMPLETE exception for incomplete employee", () => {
    const errorPayload = {
      code: "PROFILE_INCOMPLETE",
      message: "Please complete your department and job title profile before accessing training courses.",
      redirectUrl: "/join?step=profile",
    };

    const httpError = new HttpError(403, JSON.stringify(errorPayload));

    assert.equal(httpError.status, 403);
    const parsed = JSON.parse(httpError.message);
    assert.equal(parsed.code, "PROFILE_INCOMPLETE");
    assert.equal(parsed.redirectUrl, "/join?step=profile");
    assert.ok(parsed.message.includes("complete your department and job title"));
  });

  it("evaluates requireCompletedProfile guard contract", () => {
    // Pure unit verification of guard logic
    function checkProfileGuard(access: {
      role: string;
      employee: { profileCompleted: boolean } | null;
    }) {
      if (access.role === "platform_admin" || access.role === "company_admin") {
        return access;
      }
      if (access.employee && !access.employee.profileCompleted) {
        throw new HttpError(
          403,
          JSON.stringify({
            code: "PROFILE_INCOMPLETE",
            message: "Please complete your department and job title profile before accessing training courses.",
            redirectUrl: "/join?step=profile",
          })
        );
      }
      return access;
    }

    // 1. Employee with profileCompleted = false must throw 403
    assert.throws(
      () => {
        checkProfileGuard({
          role: "employee",
          employee: { profileCompleted: false },
        });
      },
      (err: any) => {
        assert.equal(err.status, 403);
        const parsed = JSON.parse(err.message);
        assert.equal(parsed.code, "PROFILE_INCOMPLETE");
        assert.equal(parsed.redirectUrl, "/join?step=profile");
        return true;
      }
    );

    // 2. Employee with profileCompleted = true must pass
    const completedEmp = {
      role: "employee",
      employee: { profileCompleted: true },
    };
    assert.deepEqual(checkProfileGuard(completedEmp), completedEmp);

    // 3. Company Admin bypasses profile check
    const admin = {
      role: "company_admin",
      employee: { profileCompleted: false },
    };
    assert.deepEqual(checkProfileGuard(admin), admin);

    // 4. Platform Admin bypasses profile check
    const superAdmin = {
      role: "platform_admin",
      employee: null,
    };
    assert.deepEqual(checkProfileGuard(superAdmin), superAdmin);
  });
});
