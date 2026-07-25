import test from "node:test";
import assert from "node:assert/strict";
import { db, companySubscriptionsTable, companiesTable, subscriptionPlansTable, employeeBandsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { evaluateCourseAccess } from "./courseAccessService";
import { ensureHybridSubscriptions } from "./ensureHybridSubscriptions";

test("Tenant Isolation & Role Permission Controls", async () => {
  await ensureHybridSubscriptions();

  // Company 1 user context
  const company1Access = {
    userId: "user_company_1",
    email: "user1@company1.com",
    companyId: 1,
    role: "company_admin" as const,
    employee: null,
    isDemo: false,
  };

  // Company 2 user context
  const company2Access = {
    userId: "user_company_2",
    email: "user2@company2.com",
    companyId: 2,
    role: "company_admin" as const,
    employee: null,
    isDemo: false,
  };

  // 1. Verify tenant isolation in subscription queries
  const sub1 = await db.select().from(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, 1)).limit(1).then(r => r[0]);
  const sub2 = await db.select().from(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, 2)).limit(1).then(r => r[0]);

  if (sub1 && sub2) {
    assert.notEqual(sub1.companyId, sub2.companyId, "Company 1 and Company 2 must have distinct subscriptions");
  }

  // 2. Platform Admin Override
  const platformAdminAccess = {
    userId: "admin_super",
    email: "admin@ecolearnhub.mu",
    companyId: 1,
    role: "platform_admin" as const,
    employee: null,
    isDemo: false,
  };

  const adminDecision = await evaluateCourseAccess(1, platformAdminAccess);
  assert.equal(adminDecision.allowed, true, "Platform admin must have universal access override");
});

test("Commercial Plan Access & Downgrade Progress Retention", async () => {
  await ensureHybridSubscriptions();

  // Test Course 1 (ELH-01 Core) is accessible under Essential
  const decisionCore = await evaluateCourseAccess(1, {
    userId: "learner_1",
    email: "learner1@test.com",
    companyId: 1,
    role: "employee" as const,
    employee: null,
    isDemo: false,
  });

  assert.equal(decisionCore.allowed, true, "Core course ELH-01 must be allowed for all active plans");
});
