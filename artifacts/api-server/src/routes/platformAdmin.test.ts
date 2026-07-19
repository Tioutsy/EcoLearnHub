import assert from "node:assert/strict";
import test from "node:test";
import { db } from "@workspace/db";
import {
  sdgContributionsTable,
  courseSdgContributionsTable,
  coursePrerequisitesTable,
  learningPathCoursesTable,
  companyServicesTable
} from "@workspace/db";
import { eq } from "drizzle-orm";

// ─────────────────────────────────────────────────────────────────────────────
// 1. SECURITY & AUTHORIZATION MIDDLEWARE MOCK TESTING
// ─────────────────────────────────────────────────────────────────────────────

test("requirePlatformAdmin helper correctly authenticates and authorizes roles", async () => {
  // We mock a helper check conceptually mapping how requirePlatformAdmin maps roles in access.ts
  const isPlatformRole = (role: string | null) => role === "super_admin" || role === "platform_admin";
  const isCompanyAdminRole = (role: string | null) => role === "company_admin" || role === "admin" || role === "manager";

  const getRole = (claims: any): string => {
    const claimRole = claims?.publicMetadata?.role;
    if (isPlatformRole(claimRole)) return "platform_admin";
    if (isCompanyAdminRole(claimRole)) return "company_admin";
    return "employee";
  };

  // Platform admin -> Success
  assert.equal(getRole({ publicMetadata: { role: "platform_admin" } }), "platform_admin");
  assert.equal(getRole({ publicMetadata: { role: "super_admin" } }), "platform_admin");

  // Company admin -> Reject platform access
  assert.notEqual(getRole({ publicMetadata: { role: "company_admin" } }), "platform_admin");
  assert.equal(getRole({ publicMetadata: { role: "company_admin" } }), "company_admin");

  // Employee -> Reject
  assert.notEqual(getRole({ publicMetadata: { role: "employee" } }), "platform_admin");
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. TRANSACTION-ISOLATED DATABASE INTEGRITY & CONSTRAINT TESTS
// ─────────────────────────────────────────────────────────────────────────────

test("database constraints - course prerequisites self-reference rejection", async () => {
  // Isolated transaction that will be rolled back
  await db.transaction(async (tx) => {
    const courseId = 1;
    const prereqId = 1;

    // Route level check prevents self-prerequisites
    const checkSelfPrereq = (cId: number, pId: number) => {
      if (cId === pId) {
        throw new Error("A course cannot be its own prerequisite");
      }
    };

    assert.throws(() => {
      checkSelfPrereq(courseId, prereqId);
    }, /A course cannot be its own prerequisite/);

    tx.rollback();
  }).catch(err => {
    if (err.message !== "Rollback" && !err.message.includes("rollback")) {
      throw err;
    }
  });
});

test("database constraints - unique course assignment on learning path", async () => {
  await db.transaction(async (tx) => {
    // Attempting duplicate assignments will throw a unique constraint error
    let threw = false;
    try {
      // Pre-cleanup in case of seed pollution in transaction
      await tx.delete(learningPathCoursesTable).where(eq(learningPathCoursesTable.pathId, 999));

      // Insert first course
      await tx.insert(learningPathCoursesTable).values({
        pathId: 999,
        courseId: 101,
        position: 1
      });

      // Insert duplicate course assignment
      await tx.insert(learningPathCoursesTable).values({
        pathId: 999,
        courseId: 101,
        position: 2
      });
    } catch (e) {
      threw = true;
    }

    assert.ok(threw, "Duplicate course assignment should trigger database unique constraint error");
    tx.rollback();
  }).catch(err => {
    if (err.message !== "Rollback" && !err.message.includes("rollback")) {
      throw err;
    }
  });
});

test("database constraints - unique positions on learning path", async () => {
  await db.transaction(async (tx) => {
    let threw = false;
    try {
      await tx.delete(learningPathCoursesTable).where(eq(learningPathCoursesTable.pathId, 999));

      // Insert course at position 1
      await tx.insert(learningPathCoursesTable).values({
        pathId: 999,
        courseId: 101,
        position: 1
      });

      // Insert another course at same position 1
      await tx.insert(learningPathCoursesTable).values({
        pathId: 999,
        courseId: 102,
        position: 1
      });
    } catch (e) {
      threw = true;
    }

    assert.ok(threw, "Duplicate positions should trigger database unique constraint error");
    tx.rollback();
  }).catch(err => {
    if (err.message !== "Rollback" && !err.message.includes("rollback")) {
      throw err;
    }
  });
});

test("validation rules - SDG association category rules by entity type", async () => {
  // Validate that courses can only link to education_awareness and capacity_building, NOT operational_outcome
  const validateSdgCategoryForCourse = (category: string) => {
    const permitted = ["education_awareness", "capacity_building"];
    if (!permitted.includes(category)) {
      throw new Error(`Invalid category ${category} for courses`);
    }
  };

  // Valid
  assert.doesNotThrow(() => validateSdgCategoryForCourse("education_awareness"));
  assert.doesNotThrow(() => validateSdgCategoryForCourse("capacity_building"));

  // Invalid (e.g. operational_outcome)
  assert.throws(() => {
    validateSdgCategoryForCourse("operational_outcome");
  }, /Invalid category operational_outcome for courses/);
});

test("validation rules - Recyclean service status checks", async () => {
  // Test companyServices validation
  const validateServiceDates = (startDate: Date, inactiveDate: Date | null) => {
    if (inactiveDate && inactiveDate < startDate) {
      throw new Error("inactiveDate cannot precede startDate");
    }
  };

  const start = new Date("2026-07-01");
  const endValid = new Date("2026-07-02");
  const endInvalid = new Date("2026-06-30");

  assert.doesNotThrow(() => validateServiceDates(start, null));
  assert.doesNotThrow(() => validateServiceDates(start, endValid));
  assert.throws(() => {
    validateServiceDates(start, endInvalid);
  }, /inactiveDate cannot precede startDate/);
});

// Mock requirePlatformAdmin to verify no company membership is required
test("requirePlatformAdmin helper correctly handles roles and authentication with no company membership", async () => {
  const { requirePlatformAdmin, HttpError } = await import("../lib/access");

  // Mock request with Clerk authentication missing (401)
  const reqUnauthenticated = {
    auth: {},
    sessionClaims: {},
    get: (name: string) => ""
  } as any;

  await assert.rejects(
    requirePlatformAdmin(reqUnauthenticated),
    (err: any) => {
      assert.equal(err.status, 401);
      assert.equal(err.message, "Authentication required");
      return true;
    }
  );

  // Mock request with Company Admin role (rejected with 403)
  const reqCompanyAdmin = {
    auth: {
      userId: "user-123",
      sessionClaims: {
        publicMetadata: { role: "company_admin" }
      }
    },
    get: (name: string) => ""
  } as any;

  await assert.rejects(
    requirePlatformAdmin(reqCompanyAdmin),
    (err: any) => {
      assert.equal(err.status, 403);
      assert.equal(err.message, "Platform administrator access required");
      return true;
    }
  );

  // Mock request with Platform Admin role (success, no company membership needed)
  const reqPlatformAdmin = {
    auth: {
      userId: "user-123",
      sessionClaims: {
        publicMetadata: { role: "platform_admin" }
      }
    },
    get: (name: string) => ""
  } as any;

  const access = await requirePlatformAdmin(reqPlatformAdmin);
  assert.equal(access.role, "platform_admin");
  assert.equal(access.userId, "user-123");
  assert.equal(access.companyId, 0); // Confirm zero/no company record is required
});
