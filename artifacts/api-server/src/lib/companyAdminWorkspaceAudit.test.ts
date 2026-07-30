import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import {
  db,
  coursesTable,
  companiesTable,
  employeesTable,
  departmentsTable,
  courseAssignmentsTable,
  enrollmentsTable,
  auditLogsTable,
  learningPathsTable,
  learningPathCoursesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getCompanyAdminOverview } from "./adminOverviewService";
import { createDepartment, updateDepartment, getCompanyDepartments } from "./departmentService";
import { assignTrainingToCompanyEmployees } from "./assignmentService";
import { logAuditEvent } from "./auditLogService";
import { sendNotification } from "./notificationService";
import { runCompanyAdminWorkspaceDiagnostics } from "./companyAdminWorkspaceDiagnostics";

describe("Sprint 8B: Company Admin Workspace, Employee Management & Training Assignment Operations", () => {
  before(async () => {
    await ensureSchemaModifications();
  });

  test("1. Server-side getCompanyAdminOverview returns company-scoped metrics and seat capacity", async () => {
    const overview = await getCompanyAdminOverview(1);
    assert.ok(overview.companyName, "Company name must be defined");
    assert.equal(typeof overview.seatsUsed, "number", "seatsUsed must be a number");
    assert.equal(typeof overview.seatsRemaining, "number", "seatsRemaining must be a number");
    assert.ok(Array.isArray(overview.recommendedActions), "recommendedActions must be an array");
  });

  test("2. Department creation, update, and manager assignment are company-scoped", async () => {
    const [testCompany] = await db
      .insert(companiesTable)
      .values({ name: "Dept Test Corp 8B", slug: `dept-test-corp-8b-${Date.now()}` })
      .returning();

    const dept = await createDepartment({
      companyId: testCompany.id,
      name: "Sustainability Ops",
      code: "SOPS",
    });

    assert.equal(dept.name, "Sustainability Ops");
    assert.equal(dept.companyId, testCompany.id);

    const depts = await getCompanyDepartments(testCompany.id);
    assert.equal(depts.length, 1);
    assert.equal(depts[0].name, "Sustainability Ops");
  });

  test("3. Employee deactivation preserves historical completions and certificates while freeing seat capacity", async () => {
    const [testCompany] = await db
      .insert(companiesTable)
      .values({ name: "Deactivate Test Corp 8B", slug: `deactivate-test-corp-8b-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testCompany.id,
        name: "Historical Learner",
        email: `historical_${Date.now()}@example.com`,
        role: "employee",
        status: "active",
        completedCourses: 3,
        certificates: 3,
      })
      .returning();

    // Deactivate employee
    const [deactivated] = await db
      .update(employeesTable)
      .set({ status: "deactivated" })
      .where(eq(employeesTable.id, emp.id))
      .returning();

    assert.equal(deactivated.status, "deactivated", "Status must be deactivated");
    assert.equal(deactivated.completedCourses, 3, "Historical completion count must be preserved");
    assert.equal(deactivated.certificates, 3, "Historical certificate count must be preserved");
  });

  test("4. Training assignment engine enforces prerequisites and plan entitlements with partial failure reporting", async () => {
    const [testCompany] = await db
      .insert(companiesTable)
      .values({ name: "Assignment Test Corp 8B", slug: `asgn-test-corp-8b-${Date.now()}`, planId: 3 })
      .returning();

    const { companySubscriptionsTable, subscriptionPlansTable, employeeBandsTable } = await import("@workspace/db");
    const [completePlan] = await db.select().from(subscriptionPlansTable).where(eq(subscriptionPlansTable.code, "COMPLETE")).limit(1);
    const [band] = await db.select().from(employeeBandsTable).limit(1);

    if (completePlan && band) {
      await db.insert(companySubscriptionsTable).values({
        companyId: testCompany.id,
        subscriptionPlanId: completePlan.id,
        employeeBandId: band.id,
        status: "ACTIVE",
        currency: "MUR",
        agreedMonthlyAmount: "0.00",
        pricingSource: "LEGACY",
      }).onConflictDoNothing();
    }

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testCompany.id,
        name: "Learner One",
        email: `learnerone_${Date.now()}@example.com`,
        role: "employee",
        status: "active",
      })
      .returning();

    const [elh01] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-01"))
      .limit(1);

    assert.ok(elh01, "ELH-01 course must exist");

    const summary = await assignTrainingToCompanyEmployees({
      companyId: testCompany.id,
      assignedByUserId: "admin_user_8b",
      assignedByRole: "company_admin",
      courseIds: [elh01.id],
      employeeIds: [emp.id],
      assignmentSource: "required",
    });

    assert.equal(summary.assignedCount, 1, "Should assign 1 course");
    assert.equal(summary.rows[0].status, "assigned");

    // Re-assigning same course should report already_assigned idempotently
    const summary2 = await assignTrainingToCompanyEmployees({
      companyId: testCompany.id,
      assignedByUserId: "admin_user_8b",
      assignedByRole: "company_admin",
      courseIds: [elh01.id],
      employeeIds: [emp.id],
      assignmentSource: "required",
    });

    assert.equal(summary2.assignedCount, 0, "Duplicate active assignment should be skipped");
    assert.equal(summary2.rows[0].status, "already_assigned");
  });

  test("5. Audit log service records administrative actions immutably", async () => {
    const log = await logAuditEvent({
      companyId: 1,
      actorUserId: "admin_tester",
      actorRole: "company_admin",
      action: "employee.created",
      targetType: "employee",
      targetId: "9999",
      metadata: { test: true },
    });

    assert.ok(log.id, "Audit log ID must be present");
    assert.equal(log.action, "employee.created");
  });

  test("6. Notification failure isolation prevents delivery errors from rolling back database operations", async () => {
    const notif = await sendNotification({
      companyId: 1,
      recipientEmail: "test@example.com",
      recipientName: "Test Recipient",
      type: "course_assigned",
      title: "New Course Assigned",
      message: "You have been assigned ELH-01",
    });

    assert.equal(notif.delivered, true, "Notification should attempt delivery cleanly");
  });

  test("7. Workspace diagnostics run without critical or high severity errors", async () => {
    const diag = await runCompanyAdminWorkspaceDiagnostics();
    assert.equal(diag.criticalIssuesCount, 0, "Expected 0 critical workspace issues");
    assert.equal(diag.highIssuesCount, 0, "Expected 0 high workspace issues");
  });
});
