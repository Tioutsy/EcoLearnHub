import test from "node:test";
import assert from "node:assert/strict";
import {
  db,
  companiesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  enrollmentsTable,
  coursesTable,
  coursePrerequisitesTable,
  planCourseEntitlementsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { evaluateCourseAccess } from "./courseAccessService";
import { ensureHybridSubscriptions } from "./ensureHybridSubscriptions";
import { CompanyAccess } from "./access";

test("Sprint 7V Course Access & Prerequisite Security Hotfix", async () => {
  const existingPlans = await db.select().from(subscriptionPlansTable).limit(1);
  if (existingPlans.length === 0) {
    await ensureHybridSubscriptions();
  }

  // Dynamically resolve canonical test courses via stable course codes
  const allCourses = await db.select().from(coursesTable);
  const getCourseByCode = (code: string) => allCourses.find(c => c.courseCode === code) || allCourses[0];

  const elh01 = getCourseByCode("ELH-01");
  const elh12 = getCourseByCode("ELH-12");
  const elh14 = getCourseByCode("ELH-14");

  // Prerequisite courses 1..11
  const prereqCourses = allCourses.filter(c => {
    if (!c.courseCode || !c.courseCode.startsWith("ELH-")) return false;
    const num = parseInt(c.courseCode.replace("ELH-", ""), 10);
    return num >= 1 && num <= 11;
  });

  const [completePlan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.code, "COMPLETE"))
    .limit(1);

  const [band] = await db.select().from(employeeBandsTable).limit(1);
  const bandId = band?.id || 1;

  await db.delete(companiesTable).where(eq(companiesTable.slug, "complete-corp-test"));
  const [completeCompany] = await db
    .insert(companiesTable)
    .values({
      name: "Complete Subscription Corp",
      slug: "complete-corp-test",
    })
    .returning();

  if (completePlan) {
    await db.insert(companySubscriptionsTable).values({
      companyId: completeCompany.id,
      subscriptionPlanId: completePlan.id,
      employeeBandId: bandId,
      status: "ACTIVE",
    });
  }

  // Test setup: ensure COMPLETE plan company, ESSENTIAL plan company, inactive sub company
  const company1Access: CompanyAccess = {
    userId: "hotfix_learner_complete",
    email: "learner_complete@testcompany1.mu",
    companyId: completeCompany.id,
    role: "employee",
    employee: null,
    isDemo: false,
  };

  const platformAdminAccess: CompanyAccess = {
    userId: "hotfix_platform_admin",
    email: "admin@ecolearnhub.mu",
    companyId: 0,
    role: "platform_admin",
    employee: null,
    isDemo: false,
  };

  const companyAdminAccess: CompanyAccess = {
    userId: "hotfix_company_admin",
    email: "cadmin@testcompany1.mu",
    companyId: completeCompany.id,
    role: "company_admin",
    employee: null,
    isDemo: false,
  };

  const noCompanyAccess: CompanyAccess = {
    userId: "hotfix_unassigned_user",
    email: "unassigned@gmail.com",
    companyId: 0,
    role: "employee",
    employee: null,
    isDemo: false,
  };

  // 1. COMPLETE learner without prerequisites cannot enrol in ELH-12
  await db.delete(enrollmentsTable).where(eq(enrollmentsTable.userId, "hotfix_learner_complete"));

  const decisionNoPrereq = await evaluateCourseAccess(elh12.id, company1Access);
  assert.equal(decisionNoPrereq.allowed, false, "Learner without prerequisites must not be allowed in ELH-12");
  assert.equal(decisionNoPrereq.reason, "PREREQUISITE_REQUIRED", "Reason must be PREREQUISITE_REQUIRED");
  assert.ok(
    decisionNoPrereq.missingPrerequisiteCourseIds && decisionNoPrereq.missingPrerequisiteCourseIds.length > 0,
    "Missing prerequisite course IDs must be returned"
  );

  // 2. COMPLETE learner with all prerequisites can access ELH-12
  const prereqRecords = await db
    .select({ prerequisiteCourseId: coursePrerequisitesTable.prerequisiteCourseId })
    .from(coursePrerequisitesTable)
    .where(eq(coursePrerequisitesTable.courseId, elh12.id));

  const prereqIdsToComplete = prereqRecords.length > 0
    ? prereqRecords.map(r => r.prerequisiteCourseId)
    : prereqCourses.map(c => c.id);

  for (const pid of prereqIdsToComplete) {
    await db.insert(enrollmentsTable).values({
      userId: "hotfix_learner_complete",
      companyId: completeCompany.id,
      courseId: pid,
      status: "completed",
      completedAt: new Date(),
      progressPct: 100,
    });
  }

  const decisionWithPrereq = await evaluateCourseAccess(elh12.id, company1Access);
  assert.equal(decisionWithPrereq.allowed, true, "Learner with completed prerequisites must be allowed in ELH-12");
  assert.equal(decisionWithPrereq.reason, "INCLUDED_IN_PLAN");

  // Clean up test enrollments
  await db.delete(enrollmentsTable).where(eq(enrollmentsTable.userId, "hotfix_learner_complete"));

  // 6 & 10. User with no companyId (or companyId=0) is denied paid-course access (fails closed)
  const decisionNoCompany = await evaluateCourseAccess(elh01.id, noCompanyAccess);
  assert.equal(decisionNoCompany.allowed, false, "User without companyId must be denied");
  assert.equal(decisionNoCompany.reason, "COMPANY_NOT_ASSIGNED", "Must return COMPANY_NOT_ASSIGNED");

  // 7. User with inactive company subscription is denied
  await db.delete(companiesTable).where(eq(companiesTable.slug, "inactive-corp-test"));
  const [testCompany] = await db
    .insert(companiesTable)
    .values({
      name: "Inactive Subscription Corp",
      slug: "inactive-corp-test",
    })
    .returning();

  const [essentialPlan] = await db
    .select()
    .from(subscriptionPlansTable)
    .where(eq(subscriptionPlansTable.code, "ESSENTIAL"))
    .limit(1);

  if (essentialPlan) {
    await db.insert(companySubscriptionsTable).values({
      companyId: testCompany.id,
      subscriptionPlanId: essentialPlan.id,
      employeeBandId: bandId,
      status: "CANCELLED",
    });

    const inactiveUserAccess: CompanyAccess = {
      userId: "user_inactive_sub",
      email: "inactive@inactivecorp.mu",
      companyId: testCompany.id,
      role: "employee",
      employee: null,
      isDemo: false,
    };

    const decisionInactive = await evaluateCourseAccess(elh01.id, inactiveUserAccess);
    assert.equal(decisionInactive.allowed, false, "User with inactive subscription must be denied");
    assert.equal(decisionInactive.reason, "SUBSCRIPTION_INACTIVE", "Reason must be SUBSCRIPTION_INACTIVE");

    // Clean up test company & sub
    await db.delete(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, testCompany.id));
    await db.delete(companiesTable).where(eq(companiesTable.id, testCompany.id));
  }

  // 8. User on ESSENTIAL subscription cannot access course outside that plan (e.g. COMPLETE course ELH-14)
  await db.delete(companiesTable).where(eq(companiesTable.slug, "essential-corp-test"));
  const [essentialCompany] = await db
    .insert(companiesTable)
    .values({
      name: "Essential Tier Corp",
      slug: "essential-corp-test",
    })
    .returning();

  if (essentialPlan) {
    await db.insert(companySubscriptionsTable).values({
      companyId: essentialCompany.id,
      subscriptionPlanId: essentialPlan.id,
      employeeBandId: bandId,
      status: "ACTIVE",
    });

    const essentialUserAccess: CompanyAccess = {
      userId: "user_essential_tier",
      email: "essential@essentialcorp.mu",
      companyId: essentialCompany.id,
      role: "employee",
      employee: null,
      isDemo: false,
    };

    // Ensure elh14 is not in ESSENTIAL plan entitlements, but is in COMPLETE plan
    await db
      .delete(planCourseEntitlementsTable)
      .where(
        and(
          eq(planCourseEntitlementsTable.subscriptionPlanId, essentialPlan.id),
          eq(planCourseEntitlementsTable.courseId, elh14.id)
        )
      );

    const [completeHasElh14] = await db
      .select()
      .from(planCourseEntitlementsTable)
      .where(
        and(
          eq(planCourseEntitlementsTable.subscriptionPlanId, completePlan.id),
          eq(planCourseEntitlementsTable.courseId, elh14.id)
        )
      );

    if (!completeHasElh14) {
      await db.insert(planCourseEntitlementsTable).values({
        subscriptionPlanId: completePlan.id,
        courseId: elh14.id,
      });
    }

    // Ensure elh01 is in ESSENTIAL plan
    const [essentialHasElh01] = await db
      .select()
      .from(planCourseEntitlementsTable)
      .where(
        and(
          eq(planCourseEntitlementsTable.subscriptionPlanId, essentialPlan.id),
          eq(planCourseEntitlementsTable.courseId, elh01.id)
        )
      );

    if (!essentialHasElh01) {
      await db.insert(planCourseEntitlementsTable).values({
        subscriptionPlanId: essentialPlan.id,
        courseId: elh01.id,
      });
    }

    const decisionPlanRestricted = await evaluateCourseAccess(elh14.id, essentialUserAccess);
    assert.equal(decisionPlanRestricted.allowed, false, "Essential plan user cannot access Professional/Complete plan course ELH-14");
    assert.equal(decisionPlanRestricted.reason, "PLAN_UPGRADE_REQUIRED", "Reason must be PLAN_UPGRADE_REQUIRED");

    // 9. User with entitled plan can access included course (ELH-01 is Essential)
    const decisionPlanAllowed = await evaluateCourseAccess(elh01.id, essentialUserAccess);
    assert.equal(decisionPlanAllowed.allowed, true, "Essential plan user can access Essential course ELH-01");

    // Clean up
    await db.delete(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, essentialCompany.id));
    await db.delete(companiesTable).where(eq(companiesTable.id, essentialCompany.id));
  }

  // 11. Platform admin can access course with unmet prerequisites
  const adminDecisionNoPrereq = await evaluateCourseAccess(elh12.id, platformAdminAccess);
  assert.equal(adminDecisionNoPrereq.allowed, true, "Platform admin can access course with unmet prerequisites");
  assert.equal(adminDecisionNoPrereq.reason, "INCLUDED_IN_PLAN");

  // 12. Platform admin can access course without company subscription
  const adminDecisionNoCompany = await evaluateCourseAccess(elh01.id, platformAdminAccess);
  assert.equal(adminDecisionNoCompany.allowed, true, "Platform admin without company sub has access");

  // 13. Company admin does NOT receive platform-admin bypass
  const companyAdminDecision = await evaluateCourseAccess(elh12.id, companyAdminAccess);
  assert.equal(companyAdminDecision.allowed, false, "Company admin without prerequisites must be blocked on ELH-12");
  assert.equal(companyAdminDecision.reason, "PREREQUISITE_REQUIRED");

  // Clean up completeCompany
  await db.delete(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, completeCompany.id));
  await db.delete(companiesTable).where(eq(companiesTable.id, completeCompany.id));
});


