import assert from "node:assert/strict";
import test from "node:test";
import {
  db,
  companiesTable,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  quizAttemptsTable,
  certificatesTable,
  notificationDeliveryLogsTable,
  auditLogsTable,
  coursesTable,
} from "@workspace/db";
import { eq, inArray } from "drizzle-orm";
import {
  getCompanyTrainingInsights,
} from "./trainingInsightsService";
import {
  getOverdueLearnersForCompany,
  sendTrainingReminderBatch,
  assignRefresherTrainingBatch,
  getManagementFollowUpHistory,
} from "./trainingActionResolverService";
import { CompanyAccess } from "../access";

const PREFIX = "s11c_verification_";
const COMP_A_NAME = `${PREFIX}Company_A`;
const COMP_B_NAME = `${PREFIX}Company_B`;

const ADMIN_A_ID = `${PREFIX}admin_a_user`;
const ADMIN_A_EMAIL = `${PREFIX}admin_a@comp-a.com`;

const MGR_A_DEPT_ID = `${PREFIX}mgr_a_dept_user`;
const MGR_A_DEPT_EMAIL = `${PREFIX}mgr_a_dept@comp-a.com`;

const EMP_A1_ID = `${PREFIX}emp_a1_user`;
const EMP_A1_EMAIL = `${PREFIX}emp_a1@comp-a.com`;

const EMP_A2_ID = `${PREFIX}emp_a2_user`;
const EMP_A2_EMAIL = `${PREFIX}emp_a2@comp-a.com`;

const EMP_B1_ID = `${PREFIX}emp_b1_user`;
const EMP_B1_EMAIL = `${PREFIX}emp_b1@comp-b.com`;

let compAId: number;
let compBId: number;
let empA1NumId: number;
let empA2NumId: number;
let empB1NumId: number;
let testCourseId: number;

async function cleanupTestRecords() {
  const allCompanies = await db.select({ id: companiesTable.id, name: companiesTable.name }).from(companiesTable);
  const testComps = allCompanies.filter((c) => c.name === COMP_A_NAME || c.name === COMP_B_NAME);
  const compIds = testComps.map((c) => c.id);

  if (compIds.length > 0) {
    const testUserIds = [EMP_A1_ID, EMP_A2_ID, EMP_B1_ID, ADMIN_A_ID, MGR_A_DEPT_ID];
    await db.delete(auditLogsTable).where(inArray(auditLogsTable.companyId, compIds));
    await db
      .delete(notificationDeliveryLogsTable)
      .where(inArray(notificationDeliveryLogsTable.companyId, compIds));
    await db.delete(certificatesTable).where(inArray(certificatesTable.companyId, compIds));
    await db.delete(enrollmentsTable).where(inArray(enrollmentsTable.companyId, compIds));
    await db.delete(courseAssignmentsTable).where(inArray(courseAssignmentsTable.companyId, compIds));
    await db.delete(quizAttemptsTable).where(inArray(quizAttemptsTable.userId, testUserIds));
    await db.delete(employeesTable).where(inArray(employeesTable.companyId, compIds));
    await db.delete(companiesTable).where(inArray(companiesTable.id, compIds));
  }
}

async function setupDatabaseFixture() {
  await cleanupTestRecords();

  const [compA] = await db
    .insert(companiesTable)
    .values({
      name: COMP_A_NAME,
      slug: `${PREFIX}comp-a-${Date.now()}`,
    } as any)
    .returning();
  compAId = compA.id;

  const [compB] = await db
    .insert(companiesTable)
    .values({
      name: COMP_B_NAME,
      slug: `${PREFIX}comp-b-${Date.now()}`,
    } as any)
    .returning();
  compBId = compB.id;

  const [catalogCourse] = await db.select().from(coursesTable).limit(1);
  if (!catalogCourse) {
    throw new Error("No course found in catalog for testing");
  }
  testCourseId = catalogCourse.id;

  // Insert active employees for Company A (Operations & HR) and Company B (Sales)
  const [empA1] = await db
    .insert(employeesTable)
    .values({
      companyId: compAId,
      name: "Alice Operations",
      email: EMP_A1_EMAIL,
      role: "employee",
      department: "Operations",
      status: "active",
      clerkUserId: EMP_A1_ID,
    } as any)
    .returning();
  empA1NumId = empA1.id;

  const [empA2] = await db
    .insert(employeesTable)
    .values({
      companyId: compAId,
      name: "Bob HR",
      email: EMP_A2_EMAIL,
      role: "employee",
      department: "HR",
      status: "active",
      clerkUserId: EMP_A2_ID,
    } as any)
    .returning();
  empA2NumId = empA2.id;

  const [empB1] = await db
    .insert(employeesTable)
    .values({
      companyId: compBId,
      name: "Charlie Sales",
      email: EMP_B1_EMAIL,
      role: "employee",
      department: "Sales",
      status: "active",
      clerkUserId: EMP_B1_ID,
    } as any)
    .returning();
  empB1NumId = empB1.id;

  // Set up an overdue enrollment for Emp A1
  const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  await db.insert(enrollmentsTable).values({
    companyId: compAId,
    employeeId: empA1NumId,
    courseId: testCourseId,
    userId: EMP_A1_ID,
    status: "active",
    progressPct: 0,
    dueDate: pastDate,
  } as any);

  // Set up struggling quiz attempts for Emp A2 (2 failed attempts)
  await db.insert(quizAttemptsTable).values([
    {
      courseId: testCourseId,
      userId: EMP_A2_ID,
      score: 40,
      passed: false,
    } as any,
    {
      courseId: testCourseId,
      userId: EMP_A2_ID,
      score: 50,
      passed: false,
    } as any,
  ]);
}

test("Sprint 11C Operational Verification & Isolation Integration Suite", async (t) => {
  await setupDatabaseFixture();

  try {
    // ─── Phase 4: Tenant-Isolation Verification ─────────────────────────────
    await t.test("Tenant Isolation — Company A vs Company B", async () => {
      const accessAdminA: CompanyAccess = {
        userId: ADMIN_A_ID,
        email: ADMIN_A_EMAIL,
        companyId: compAId,
        role: "company_admin",
        employee: null,
        isDemo: false,
      };

      const accessAdminB: CompanyAccess = {
        userId: `${PREFIX}admin_b_user`,
        email: `${PREFIX}admin_b@comp-b.com`,
        companyId: compBId,
        role: "company_admin",
        employee: null,
        isDemo: false,
      };

      const insightsA = await getCompanyTrainingInsights(accessAdminA, true);
      const insightsB = await getCompanyTrainingInsights(accessAdminB, true);

      assert.strictEqual(insightsA.companyId, compAId);
      assert.strictEqual(insightsB.companyId, compBId);
      assert.strictEqual(insightsA.organisationSummary.totalActiveLearners, 2);
      assert.strictEqual(insightsB.organisationSummary.totalActiveLearners, 1);

      // Verify Company B overdue list contains ZERO records from Company A
      const overdueB = await getOverdueLearnersForCompany(accessAdminB);
      assert.strictEqual(overdueB.length, 0);

      // Verify Company A overdue list contains only Emp A1
      const overdueA = await getOverdueLearnersForCompany(accessAdminA);
      assert.strictEqual(overdueA.length, 1);
      assert.strictEqual(overdueA[0].employeeId, empA1NumId);

      // Cross-tenant reminder attempt: Admin A attempts to target Emp B1 (Company B)
      const remindCrossRes = await sendTrainingReminderBatch(accessAdminA, {
        employeeIds: [empB1NumId],
        category: "overdue",
        source: "training-insight",
      });
      assert.strictEqual(remindCrossRes.deliveredCount, 0);
      assert.strictEqual(remindCrossRes.attemptedCount, 0);
      assert.strictEqual(remindCrossRes.skippedCount, 0);
    });

    // ─── Phase 5: Role & Department-Scope Verification ───────────────────────
    await t.test("Role & Department Scoping", async () => {
      // Employee role attempting management insights -> 403
      const accessEmployee: CompanyAccess = {
        userId: EMP_A1_ID,
        email: EMP_A1_EMAIL,
        companyId: compAId,
        role: "employee",
        employee: { id: empA1NumId, department: "Operations" } as any,
        isDemo: false,
      };

      await assert.rejects(
        async () => {
          await getOverdueLearnersForCompany(accessEmployee);
        },
        (err: any) => err.status === 403
      );

      // Operations Department Manager attempting overdue list
      const accessOpsManager: CompanyAccess = {
        userId: MGR_A_DEPT_ID,
        email: MGR_A_DEPT_EMAIL,
        companyId: compAId,
        role: "manager",
        employee: { id: 9999, department: "Operations" } as any,
        isDemo: false,
      };

      const overdueOpsMgr = await getOverdueLearnersForCompany(accessOpsManager);
      assert.strictEqual(overdueOpsMgr.length, 1);
      assert.strictEqual(overdueOpsMgr[0].employeeId, empA1NumId);

      // HR Department Manager attempting overdue list (Emp A1 is in Operations, so HR manager gets 0 overdue)
      const accessHrManager: CompanyAccess = {
        userId: `${PREFIX}mgr_hr_user`,
        email: `${PREFIX}mgr_hr@comp-a.com`,
        companyId: compAId,
        role: "manager",
        employee: { id: 9998, department: "HR" } as any,
        isDemo: false,
      };

      const overdueHrMgr = await getOverdueLearnersForCompany(accessHrManager);
      assert.strictEqual(overdueHrMgr.length, 0);
    });

    // ─── Phase 6: Reminder Delivery & 24h Deduplication ──────────────────────
    await t.test("Reminder Dispatch Delivery & 24h Deduplication", async () => {
      const accessAdminA: CompanyAccess = {
        userId: ADMIN_A_ID,
        email: ADMIN_A_EMAIL,
        companyId: compAId,
        role: "company_admin",
        employee: null,
        isDemo: false,
      };

      // First reminder dispatch for Emp A1
      const res1 = await sendTrainingReminderBatch(accessAdminA, {
        employeeIds: [empA1NumId],
        courseId: testCourseId,
        category: "overdue",
        source: "training-insight",
      });

      assert.strictEqual(res1.attemptedCount, 1);
      assert.strictEqual(res1.deliveredCount, 1);
      assert.strictEqual(res1.skippedCount, 0);

      // Second reminder dispatch within 24h -> Skipped due to rate-limiting
      const res2 = await sendTrainingReminderBatch(accessAdminA, {
        employeeIds: [empA1NumId],
        courseId: testCourseId,
        category: "overdue",
        source: "training-insight",
      });

      assert.strictEqual(res2.attemptedCount, 1);
      assert.strictEqual(res2.deliveredCount, 0);
      assert.strictEqual(res2.skippedCount, 1);
      assert.strictEqual(
        res2.details[0].reason,
        "A reminder was already sent to this employee recently (within 24 hours)."
      );

      // Audit history includes the reminder dispatch
      const history = await getManagementFollowUpHistory(accessAdminA);
      assert.ok(history.length >= 1);
      assert.strictEqual(history[0].action, "training.reminder_dispatched");
    });

    // ─── Phase 7: Refresher Assignment History Protection ────────────────────
    await t.test("Refresher Assignment Preserves Completed History & Certificates", async () => {
      const accessAdminA: CompanyAccess = {
        userId: ADMIN_A_ID,
        email: ADMIN_A_EMAIL,
        companyId: compAId,
        role: "company_admin",
        employee: null,
        isDemo: false,
      };

      // Create historical completed enrollment & certificate for Emp A2
      const completedTime = new Date("2025-01-15T10:00:00Z");
      const [histEnrollment] = await db
        .insert(enrollmentsTable)
        .values({
          companyId: compAId,
          employeeId: empA2NumId,
          courseId: testCourseId,
          userId: EMP_A2_ID,
          status: "completed",
          progressPct: 100,
          completedAt: completedTime,
        } as any)
        .returning();

      const [histCert] = await db
        .insert(certificatesTable)
        .values({
          companyId: compAId,
          employeeId: empA2NumId,
          courseId: testCourseId,
          userId: EMP_A2_ID,
          uniqueCode: `${PREFIX}CERT_123`,
          issuedAt: completedTime,
        } as any)
        .returning();

      // Trigger Refresher Assignment for Emp A2
      const refresherRes = await assignRefresherTrainingBatch(accessAdminA, {
        employeeIds: [empA2NumId],
        courseId: testCourseId,
        source: "training-insight",
      });

      assert.strictEqual(refresherRes.courseId, testCourseId);
      assert.strictEqual(refresherRes.summary.totalTargeted, 1);
      assert.strictEqual(refresherRes.summary.skippedCount, 1); // Skipped because already completed in application assignmentService logic

      // Verify original historical enrollment was untouched
      const [existingEnr] = await db
        .select()
        .from(enrollmentsTable)
        .where(eq(enrollmentsTable.id, histEnrollment.id));
      assert.strictEqual(existingEnr.status, "completed");
      assert.strictEqual(new Date(existingEnr.completedAt!).toISOString(), completedTime.toISOString());

      // Verify certificate remains intact
      const [existingCert] = await db
        .select()
        .from(certificatesTable)
        .where(eq(certificatesTable.id, histCert.id));
      assert.ok(existingCert);
      assert.strictEqual(existingCert.uniqueCode, `${PREFIX}CERT_123`);
    });

    // ─── Phase 8: Gemini & Fallback Verification ────────────────────────────
    await t.test("Deterministic Fallback Execution when GEMINI_API_KEY is empty", async () => {
      const accessAdminA: CompanyAccess = {
        userId: ADMIN_A_ID,
        email: ADMIN_A_EMAIL,
        companyId: compAId,
        role: "company_admin",
        employee: null,
        isDemo: false,
      };

      const originalKey = process.env.GEMINI_API_KEY;
      process.env.GEMINI_API_KEY = "";

      try {
        const fallbackInsights = await getCompanyTrainingInsights(accessAdminA, true);
        assert.strictEqual(fallbackInsights.isFallback, true);
        assert.strictEqual(fallbackInsights.providerTag, "fallback");
        assert.ok(fallbackInsights.summary.length > 0);
        assert.ok(fallbackInsights.needsAttention.length > 0);
      } finally {
        process.env.GEMINI_API_KEY = originalKey;
      }
    });

  } finally {
    await cleanupTestRecords();
  }
});
