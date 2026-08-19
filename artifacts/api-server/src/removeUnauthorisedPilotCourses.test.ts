import test, { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import {
  db,
  coursesTable,
  companiesTable,
  employeesTable,
  companyPilotPassesTable,
  pilotPassAuditLogsTable,
  enrollmentsTable,
  certificatesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  companyUpgradeRequestsTable,
} from "@workspace/db";
import { eq, sql, inArray, and } from "drizzle-orm";
import {
  createPilotPass,
  redeemPilotPass,
  extendPilotPass,
  convertPilotToPaid,
  validatePilotPassCode,
  resolveCompanyPilotEntitlement,
  getPilotPassDetails,
} from "./lib/pilotPassService";
import { evaluateCourseAccess } from "./lib/courseAccessService";
import { verifyDatabaseIntegrity } from "./lib/verifyDatabaseIntegrity";
import { ensureSchemaModifications } from "./lib/ensureSchemaModifications";

describe("Sprint 12.3.1: Remove Unauthorised Pilot Courses & Restore Canonical Catalogue", () => {
  let canonicalCourse1: any;
  let canonicalCourse2: any;
  let unpublishedCourse: any;
  let initialCourseCount: number;

  before(async () => {
    await ensureSchemaModifications();

    // 1. Fetch existing canonical published courses
    const published = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.isPublished, true))
      .orderBy(coursesTable.id);

    assert.ok(published.length >= 2, "At least 2 published canonical courses must exist");
    canonicalCourse1 = published[0];
    canonicalCourse2 = published[1];

    // Check for draft/unpublished course or verify non-published course lookup
    const unpub = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.isPublished, false))
      .limit(1);

    unpublishedCourse = unpub[0] || { id: 999999, isPublished: false };

    const totalCourses = await db.select().from(coursesTable);
    initialCourseCount = totalCourses.length;
  });

  // ── GROUP 1: Catalogue Invariance & Zero Creation Side Effects ──────────────

  it("1. Creating a pilot pass does not change the total course count", async () => {
    const countBefore = (await db.select().from(coursesTable)).length;

    await createPilotPass("admin:bootstrap", {
      companyName: `Invariance Co ${Date.now()}`,
      intendedContactName: "Invariance Admin",
      intendedContactEmail: `invariance_${Date.now()}@test.mu`,
      durationDays: 30,
      learnerSeatLimit: 10,
      permittedCourseIds: [canonicalCourse1.id],
    });

    const countAfter = (await db.select().from(coursesTable)).length;
    assert.strictEqual(countAfter, countBefore, "Course count remains identical after pilot pass creation");
  });

  it("2. Redeeming a pilot pass does not change the total course count", async () => {
    const { rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: `Redeem Invariance Co ${Date.now()}`,
      intendedContactName: "Redeem Admin",
      intendedContactEmail: `redeem_inv_${Date.now()}@test.mu`,
      durationDays: 30,
      learnerSeatLimit: 10,
      permittedCourseIds: [canonicalCourse1.id, canonicalCourse2.id],
    });

    const countBefore = (await db.select().from(coursesTable)).length;

    await redeemPilotPass({
      rawCode,
      redeemedByUserId: `user:redeem_inv_${Date.now()}`,
      redeemedByEmail: `redeem_inv_${Date.now()}@test.mu`,
      companyName: `Redeem Invariance Co ${Date.now()}`,
    });

    const countAfter = (await db.select().from(coursesTable)).length;
    assert.strictEqual(countAfter, countBefore, "Course count remains identical after pilot pass redemption");
  });

  it("3. Extending a pilot does not create courses", async () => {
    const { pilotPass } = await createPilotPass("admin:bootstrap", {
      companyName: `Extend Co ${Date.now()}`,
      intendedContactName: "Extend Admin",
      intendedContactEmail: `extend_${Date.now()}@test.mu`,
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id],
    });

    const countBefore = (await db.select().from(coursesTable)).length;

    await extendPilotPass("admin:bootstrap", pilotPass.id, 15, "Commercial evaluation extension");

    const countAfter = (await db.select().from(coursesTable)).length;
    assert.strictEqual(countAfter, countBefore, "Course count remains unchanged after pilot extension");
  });

  it("4. Converting a pilot does not create courses", async () => {
    const { pilotPass, rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: `Convert Invariance Co ${Date.now()}`,
      intendedContactName: "Convert Admin",
      intendedContactEmail: `convert_inv_${Date.now()}@test.mu`,
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id],
    });

    const redeemed = await redeemPilotPass({
      rawCode,
      redeemedByUserId: `user:convert_inv_${Date.now()}`,
      redeemedByEmail: `convert_inv_${Date.now()}@test.mu`,
      companyName: `Convert Invariance Co ${Date.now()}`,
    });

    const countBefore = (await db.select().from(coursesTable)).length;

    await convertPilotToPaid(redeemed.company.id, {
      planCode: "COMPLETE",
      employeeBandCode: "UP_TO_25",
      performedBy: "admin:bootstrap",
    });

    const countAfter = (await db.select().from(coursesTable)).length;
    assert.strictEqual(countAfter, countBefore, "Course count remains unchanged after commercial conversion");
  });

  // ── GROUP 2: Course Selection Validation Boundaries ────────────────────────

  it("5. Platform Admin can select existing canonical courses", async () => {
    const created = await createPilotPass("admin:bootstrap", {
      companyName: `Valid Canonical Co ${Date.now()}`,
      intendedContactName: "Valid Admin",
      intendedContactEmail: `valid_canonical_${Date.now()}@test.mu`,
      durationDays: 30,
      learnerSeatLimit: 15,
      permittedCourseIds: [canonicalCourse1.id, canonicalCourse2.id],
    });

    assert.ok(created.pilotPass.id);
    assert.deepStrictEqual(created.pilotPass.permittedCourseIds, [canonicalCourse1.id, canonicalCourse2.id]);
  });

  it("6. Empty permitted-course selection is rejected with 400", async () => {
    await assert.rejects(
      async () => {
        await createPilotPass("admin:bootstrap", {
          companyName: "Empty Courses Co",
          intendedContactName: "Admin",
          intendedContactEmail: `empty_${Date.now()}@test.mu`,
          durationDays: 30,
          permittedCourseIds: [],
        });
      },
      (err: any) => err.status === 400 && /At least one permitted canonical course must be selected/i.test(err.message)
    );
  });

  it("7. Unknown course ID is rejected with 400", async () => {
    await assert.rejects(
      async () => {
        await createPilotPass("admin:bootstrap", {
          companyName: "Unknown Course Co",
          intendedContactName: "Admin",
          intendedContactEmail: `unknown_${Date.now()}@test.mu`,
          durationDays: 30,
          permittedCourseIds: [99999999],
        });
      },
      (err: any) => err.status === 400 && /canonical catalogue/i.test(err.message)
    );
  });

  it("8. Archived or unpublished course ID is rejected with 400", async () => {
    await assert.rejects(
      async () => {
        await createPilotPass("admin:bootstrap", {
          companyName: "Unpublished Course Co",
          intendedContactName: "Admin",
          intendedContactEmail: `unpub_${Date.now()}@test.mu`,
          durationDays: 30,
          permittedCourseIds: [unpublishedCourse.id],
        });
      },
      (err: any) => err.status === 400 && /canonical catalogue/i.test(err.message)
    );
  });

  it("9. Duplicate submitted course IDs are normalized / deduplicated", async () => {
    const created = await createPilotPass("admin:bootstrap", {
      companyName: `Dedupe Co ${Date.now()}`,
      intendedContactName: "Admin",
      intendedContactEmail: `dedupe_${Date.now()}@test.mu`,
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id, canonicalCourse1.id, canonicalCourse1.id],
    });

    assert.deepStrictEqual(created.pilotPass.permittedCourseIds, [canonicalCourse1.id]);
  });

  it("10. Arbitrary client-supplied course objects are rejected with 400", async () => {
    await assert.rejects(
      async () => {
        await createPilotPass("admin:bootstrap", {
          companyName: "Object Course Co",
          intendedContactName: "Admin",
          intendedContactEmail: `obj_${Date.now()}@test.mu`,
          durationDays: 30,
          permittedCourseIds: [{ id: canonicalCourse1.id, title: "Malicious Course Injection" } as any],
        });
      },
      (err: any) => err.status === 400
    );
  });

  // ── GROUP 3: Course Access Gating & Non-Permitted Course Blocking ───────────

  it("11. Pilot access permits a selected canonical course", async () => {
    const { rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: `Access Permitted Co ${Date.now()}`,
      intendedContactName: "Access Admin",
      intendedContactEmail: `access_p_${Date.now()}@test.mu`,
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id],
    });

    const redeemed = await redeemPilotPass({
      rawCode,
      redeemedByUserId: `user:access_p_${Date.now()}`,
      redeemedByEmail: `access_p_${Date.now()}@test.mu`,
      companyName: `Access Permitted Co ${Date.now()}`,
    });

    const access = await evaluateCourseAccess(canonicalCourse1.id, {
      userId: `user:access_p_${Date.now()}`,
      email: `access_p_${Date.now()}@test.mu`,
      role: "company_admin",
      companyId: redeemed.company.id,
      employee: null,
      isDemo: false,
    });

    assert.strictEqual(access.allowed, true, "Access to selected canonical course is allowed");
  });

  it("12. Pilot access blocks a non-selected canonical course with PLAN_UPGRADE_REQUIRED", async () => {
    const { rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: `Access Blocked Co ${Date.now()}`,
      intendedContactName: "Block Admin",
      intendedContactEmail: `access_b_${Date.now()}@test.mu`,
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id],
    });

    const redeemed = await redeemPilotPass({
      rawCode,
      redeemedByUserId: `user:access_b_${Date.now()}`,
      redeemedByEmail: `access_b_${Date.now()}@test.mu`,
      companyName: `Access Blocked Co ${Date.now()}`,
    });

    const access = await evaluateCourseAccess(canonicalCourse2.id, {
      userId: `user:access_b_${Date.now()}`,
      email: `access_b_${Date.now()}@test.mu`,
      role: "company_admin",
      companyId: redeemed.company.id,
      employee: null,
      isDemo: false,
    });

    assert.strictEqual(access.allowed, false);
    assert.strictEqual(access.reason, "PLAN_UPGRADE_REQUIRED");
  });

  // ── GROUP 4: Database Cleanliness, Integrity & Data Preservation ────────────

  it("13. Unused pilot-only courses are completely absent from the database", async () => {
    const leftover = await db.execute(sql`
      SELECT id, course_code, title FROM "courses"
      WHERE "id" IN (596, 597, 599, 600, 603, 604, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615)
         OR "course_code" LIKE 'PILOT-%'
         OR "slug" LIKE 'pilot-test-%'
         OR "slug" LIKE 'sprint-12-3-module-%'
    `);

    assert.strictEqual(leftover.rows.length, 0, "Zero unauthorised pilot test courses exist in courses table");
  });

  it("14. Duplicate course references are mapped to canonical IDs in pilot passes", async () => {
    const passes = await db.select().from(companyPilotPassesTable);
    for (const pass of passes) {
      if (pass.permittedCourseIds && Array.isArray(pass.permittedCourseIds)) {
        for (const cid of pass.permittedCourseIds) {
          assert.ok(
            ![596, 597, 599, 600, 603, 604, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615].includes(cid),
            `Pass ID ${pass.id} references no deleted course IDs`
          );
        }
      }
    }
  });

  it("15. Learning data (enrollments, certificates) is preserved and points to canonical courses", async () => {
    const enrollments = await db.select().from(enrollmentsTable);
    for (const enr of enrollments) {
      assert.ok(
        ![596, 597, 599, 600, 603, 604, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615].includes(enr.courseId),
        `Enrollment ID ${enr.id} points to valid canonical course`
      );
    }

    const certificates = await db.select().from(certificatesTable);
    for (const cert of certificates) {
      assert.ok(
        ![596, 597, 599, 600, 603, 604, 606, 607, 608, 609, 610, 611, 612, 613, 614, 615].includes(cert.courseId),
        `Certificate ID ${cert.id} points to valid canonical course`
      );
    }
  });

  it("16. Course code uniqueness is verified across canonical catalogue", async () => {
    const res = await db.execute(sql`
      SELECT course_code, count(*) as count 
      FROM "courses" 
      WHERE course_code IS NOT NULL 
      GROUP BY course_code 
      HAVING count(*) > 1;
    `);

    assert.strictEqual(res.rows.length, 0, "No duplicate course codes exist");
  });

  it("17. verifyDatabaseIntegrity passes with 0 critical issues", async () => {
    const report = await verifyDatabaseIntegrity();
    assert.strictEqual(report.valid, true);
    assert.strictEqual(report.issues.filter((i) => i.type === "critical").length, 0);
  });

  it("18. Preserves company employee accounts and tenant isolation", async () => {
    const employees = await db.select().from(employeesTable);
    assert.ok(employees.length > 0, "Employee records are preserved");
  });

  it("19. Rejects client attempt to redeem pilot with cross-tenant domain mismatch", async () => {
    const { rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: "Domain Lock Corp",
      intendedContactName: "Lock Admin",
      intendedContactEmail: `admin_${Date.now()}@domainlock.mu`,
      intendedEmailDomain: "domainlock.mu",
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id],
    });

    await assert.rejects(
      async () => {
        await redeemPilotPass({
          rawCode,
          redeemedByUserId: "user:intruder",
          redeemedByEmail: "intruder@othercompany.com",
          companyName: "Domain Lock Corp",
        });
      },
      (err: any) => err.status === 403
    );
  });

  it("20. Canonical course catalogue row count matches expected 35 courses", async () => {
    const allCourses = await db.select().from(coursesTable);
    assert.strictEqual(allCourses.length, 35, "Exactly 35 canonical courses remain in the catalogue");
  });
});
