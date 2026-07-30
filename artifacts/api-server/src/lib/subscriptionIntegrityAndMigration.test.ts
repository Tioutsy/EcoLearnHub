import { test, before, after, describe } from "node:test";
import assert from "node:assert/strict";
import {
  db,
  companiesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  coursesTable,
  planCourseEntitlementsTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { detectAndResolveDuplicateCompanySubscriptions } from "./subscriptionDiagnostics";
import { evaluateCourseAccess } from "./courseAccessService";
import { ensureSchemaModifications } from "./ensureSchemaModifications";

describe("Sprint 7W: Subscription Data Integrity & Schema Convergence", () => {
  let testCompanyId: number;
  let planId: number;
  let bandId: number;
  let testCourseId: number;

  before(async () => {
    // Run schema modifications to ensure database is updated
    await ensureSchemaModifications();

    // Get or create essential subscription plan
    let [plan] = await db
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.code, "ESSENTIAL"))
      .limit(1);

    if (!plan) {
      [plan] = await db
        .insert(subscriptionPlansTable)
        .values({
          code: "ESSENTIAL",
          name: "Essential Tier",
          description: "Essential Subscription Tier",
          displayOrder: 1,
        })
        .returning();
    }
    planId = plan!.id;

    // Get or create employee band
    let [band] = await db.select().from(employeeBandsTable).limit(1);
    if (!band) {
      [band] = await db
        .insert(employeeBandsTable)
        .values({
          code: "BAND_1_25",
          label: "1-25 Employees",
          minimumEmployees: 1,
          maximumEmployees: 25,
        })
        .returning();
    }
    bandId = band!.id;

    // Create a test company
    const slug = `integrity-co-7w-${Date.now()}`;
    const [company] = await db
      .insert(companiesTable)
      .values({
        name: "Test Integrity Co 7W",
        slug,
        industry: "Technology",
      })
      .returning();
    testCompanyId = company!.id;

    // Create a test published course
    const courseSlug = `integrity-course-7w-${Date.now()}`;
    const [course] = await db
      .insert(coursesTable)
      .values({
        title: "Integrity Course 7W",
        slug: courseSlug,
        categoryId: 1,
        description: "Test course for 7W integrity",
        isPublished: true,
      })
      .returning();
    testCourseId = course!.id;

    // Add entitlement for Essential plan
    await db
      .insert(planCourseEntitlementsTable)
      .values({
        subscriptionPlanId: planId,
        courseId: testCourseId,
      })
      .onConflictDoNothing();
  });

  after(async () => {
    // Clean up test data
    if (testCompanyId) {
      await db.delete(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, testCompanyId));
      await db.delete(companiesTable).where(eq(companiesTable.id, testCompanyId));
    }
    if (testCourseId) {
      await db.delete(planCourseEntitlementsTable).where(eq(planCourseEntitlementsTable.courseId, testCourseId));
      await db.delete(coursesTable).where(eq(coursesTable.id, testCourseId));
    }
  });

  test("Database constraint 'unique_company_subscription' blocks duplicate inserts", async () => {
    // Clean subscriptions for test company
    await db.delete(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, testCompanyId));

    // Insert first subscription
    await db.insert(companySubscriptionsTable).values({
      companyId: testCompanyId,
      subscriptionPlanId: planId,
      employeeBandId: bandId,
      status: "ACTIVE",
    });

    // Attempt to insert second subscription for same company without conflict handler
    await assert.rejects(
      async () => {
        await db.insert(companySubscriptionsTable).values({
          companyId: testCompanyId,
          subscriptionPlanId: planId,
          employeeBandId: bandId,
          status: "ACTIVE",
        });
      },
      (err: any) => {
        const msg = String(err?.message || "");
        const causeMsg = String(err?.cause?.message || "");
        const code = err?.code || err?.cause?.code;
        return (
          code === "23505" ||
          msg.includes("unique") ||
          msg.includes("duplicate") ||
          causeMsg.includes("unique") ||
          causeMsg.includes("duplicate")
        );
      }
    );
  });

  test("Idempotent onConflictDoUpdate updates subscription cleanly without creating duplicate rows", async () => {
    await db
      .insert(companySubscriptionsTable)
      .values({
        companyId: testCompanyId,
        subscriptionPlanId: planId,
        employeeBandId: bandId,
        status: "ACTIVE",
        agreedMonthlyAmount: "100.00",
      })
      .onConflictDoUpdate({
        target: [companySubscriptionsTable.companyId],
        set: {
          status: "ACTIVE",
          agreedMonthlyAmount: "200.00",
          updatedAt: new Date(),
        },
      });

    const rows = await db
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, testCompanyId));

    assert.equal(rows.length, 1);
    assert.equal(rows[0]?.agreedMonthlyAmount, "200.00");
  });

  test("evaluateCourseAccess behaves deterministically", async () => {
    const decision = await evaluateCourseAccess(testCourseId, {
      userId: "test-user-7w",
      email: "user@integrity7w.test",
      companyId: testCompanyId,
      role: "employee",
      employee: null,
      isDemo: false,
    });

    assert.equal(decision.allowed, true);
    assert.equal(decision.reason, "INCLUDED_IN_PLAN");
  });

  test("ensureSchemaModifications verifies schema convergence idempotently", async () => {
    await ensureSchemaModifications();
    const res = await db.execute(sql`
      SELECT 1 FROM pg_constraint WHERE conname = 'unique_company_subscription'
    `);
    assert.equal(res.rows.length, 1);
  });
});
