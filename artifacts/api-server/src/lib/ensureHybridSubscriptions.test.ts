import test from "node:test";
import assert from "node:assert/strict";
import { ensureHybridSubscriptions, resolveBandCodeFromEmployeeCount } from "./ensureHybridSubscriptions";
import { db, subscriptionPlansTable, employeeBandsTable, planPricesTable, companySubscriptionsTable } from "@workspace/db";
import { evaluateCourseAccess } from "./courseAccessService";

test("Employee Band Resolution Logic", () => {
  assert.equal(resolveBandCodeFromEmployeeCount(1), "UP_TO_25");
  assert.equal(resolveBandCodeFromEmployeeCount(25), "UP_TO_25");
  assert.equal(resolveBandCodeFromEmployeeCount(26), "FROM_26_TO_50");
  assert.equal(resolveBandCodeFromEmployeeCount(50), "FROM_26_TO_50");
  assert.equal(resolveBandCodeFromEmployeeCount(51), "FROM_51_TO_80");
  assert.equal(resolveBandCodeFromEmployeeCount(80), "FROM_51_TO_80");
  assert.equal(resolveBandCodeFromEmployeeCount(81), "FROM_81_TO_120");
  assert.equal(resolveBandCodeFromEmployeeCount(120), "FROM_81_TO_120");
  assert.equal(resolveBandCodeFromEmployeeCount(121), "OVER_120");
  assert.equal(resolveBandCodeFromEmployeeCount(0), "UP_TO_25");
});

test("Hybrid Subscriptions Seeder Idempotency & Entitlements", async () => {
  // First run
  await ensureHybridSubscriptions();

  const plans = await db.select().from(subscriptionPlansTable);
  assert.equal(plans.length, 3, "Should seed exactly 3 commercial plans (Essential, Professional, Complete)");

  const bands = await db.select().from(employeeBandsTable);
  assert.equal(bands.length, 5, "Should seed exactly 5 employee bands");

  const prices = await db.select().from(planPricesTable);
  assert.equal(prices.length, 15, "Should seed 15 price matrix records (3 plans x 5 bands)");

  // Second run (Idempotency check)
  await ensureHybridSubscriptions();

  const plansAfter = await db.select().from(subscriptionPlansTable);
  assert.equal(plansAfter.length, 3, "Repeated seeding should create no duplicate plans");

  const bandsAfter = await db.select().from(employeeBandsTable);
  assert.equal(bandsAfter.length, 5, "Repeated seeding should create no duplicate bands");
});

test("Course Commercial Access Decisions", async () => {
  // Course ID 1 (ELH-01: Sustainability Foundations) - Core course included in Essential, Professional, Complete
  const decisionCore = await evaluateCourseAccess(1, { role: "company_admin", companyId: 1, userId: "user_test", email: "test@example.com", employee: null, isDemo: false });
  assert.equal(decisionCore.allowed, true, "Core courses should be accessible");

  // Platform admin gets full access
  const decisionAdmin = await evaluateCourseAccess(1, { role: "platform_admin", companyId: 1, userId: "admin_test", email: "admin@example.com", employee: null, isDemo: false });
  assert.equal(decisionAdmin.allowed, true, "Platform admin should have full access");
});
