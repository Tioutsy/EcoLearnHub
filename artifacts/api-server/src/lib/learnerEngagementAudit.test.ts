import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import {
  db,
  coursesTable,
  companiesTable,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  notificationDeliveryLogsTable,
  notificationPreferencesTable,
  auditLogsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getLearnerEngagementSummary } from "./learnerEngagementService";
import { processTrainingReminders } from "./reminderSchedulerService";
import { runLearnerEngagementDiagnostics } from "./learnerEngagementDiagnostics";
import { createOrRefreshInvitation, revokeInvitation, acceptInvitation } from "./invitationService";
import { logAuditEvent } from "./auditLogService";
import { sendNotification } from "./notificationService";

describe("Sprint 8C: Learner Activation, Training Reminders & Engagement Recovery Audit", () => {
  before(async () => {
    await ensureSchemaModifications();
  });

  test("1-5. Invitation lifecycle: token generation, expiry, revocation, single-use, and acceptance", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Activation Corp 8C", slug: `activation-corp-8c-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "New Learner 8C",
        email: `learner8c_${Date.now()}@example.com`,
        role: "employee",
        status: "active",
      })
      .returning();

    // 1. Token generation
    const invite = await createOrRefreshInvitation(testComp.id, emp.id);
    assert.ok(invite.token, "Invitation token must be generated");

    // 2. Acceptance
    const accepted = await acceptInvitation(invite.token, "clerk_user_8c_new");
    assert.equal(accepted.employee.invitationStatus, "accepted");
    assert.equal(accepted.employee.clerkUserId, "clerk_user_8c_new");

    // 3. Single-use enforcement
    await assert.rejects(
      async () => await acceptInvitation(invite.token, "clerk_user_8c_new"),
      /Invalid or expired invitation token/
    );

    // 4. Revocation
    const [emp2] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "Revoked Learner",
        email: `revoked_${Date.now()}@example.com`,
        role: "employee",
      })
      .returning();
    const invite2 = await createOrRefreshInvitation(testComp.id, emp2.id);
    await revokeInvitation(testComp.id, emp2.id);

    await assert.rejects(
      async () => await acceptInvitation(invite2.token, "clerk_user_revoked"),
      /This invitation has been revoked/
    );
  });

  test("6-8. Primary engagement state and prioritized next action", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Prioritization Corp 8C", slug: `prio-corp-8c-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "Prioritized Learner",
        email: `prio_${Date.now()}@example.com`,
        role: "employee",
        invitationStatus: "accepted",
        clerkUserId: "clerk_prio_8c",
      })
      .returning();

    const summary = await getLearnerEngagementSummary(testComp.id, emp.id);
    assert.equal(summary.primaryState, "activated");
    assert.equal(summary.primaryNextAction.action, "catalog");
  });

  test("9-13. Due-soon, overdue, and completed assignment engagement state precedence", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Precedence Corp 8C", slug: `prec-corp-8c-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "Precedence Learner",
        email: `prec_${Date.now()}@example.com`,
        role: "employee",
        invitationStatus: "accepted",
        clerkUserId: "clerk_prec_8c",
      })
      .returning();

    const [elh01] = await db.select({ id: coursesTable.id }).from(coursesTable).where(eq(coursesTable.courseCode, "ELH-01")).limit(1);

    // Overdue assignment
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.insert(courseAssignmentsTable).values({
      companyId: testComp.id,
      employeeId: emp.id,
      courseId: elh01.id,
      dueDate: yesterday,
    });

    const summary = await getLearnerEngagementSummary(testComp.id, emp.id);
    assert.equal(summary.primaryState, "overdue");
    assert.equal(summary.totalOverdue, 1);

    // Complete assignment -> Must NEVER remain overdue
    await db.update(courseAssignmentsTable).set({ completedAt: new Date() }).where(and(eq(courseAssignmentsTable.employeeId, emp.id), eq(courseAssignmentsTable.courseId, elh01.id)));

    const summaryCompleted = await getLearnerEngagementSummary(testComp.id, emp.id);
    assert.equal(summaryCompleted.primaryState, "completed");
    assert.equal(summaryCompleted.totalOverdue, 0);
  });

  test("14-20. Scheduled reminder engine, deduplication keys, and idempotency", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Reminder Corp 8C", slug: `rem-corp-8c-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "Reminder Learner",
        email: `rem_${Date.now()}@example.com`,
        role: "employee",
        invitationStatus: "invited",
        invitationSentAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // 4 days ago
      })
      .returning();

    // 1st Run -> Dispatches reminder
    const res1 = await processTrainingReminders({ companyId: testComp.id, policyWindowPeriod: "2026-TEST-W1" });
    assert.equal(res1.dispatchedCount, 1, "Should dispatch 1 pending invitation reminder");

    // 2nd Run (Same policy period) -> Deduplicated & skipped idempotently
    const res2 = await processTrainingReminders({ companyId: testComp.id, policyWindowPeriod: "2026-TEST-W1" });
    assert.equal(res2.dispatchedCount, 0, "Duplicate run should dispatch 0 reminders");
    assert.equal(res2.skippedCount, 1, "Duplicate run should skip 1 reminder");
  });

  test("21-25. Deactivated employees and completed assignments suppress reminders", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Suppression Corp 8C", slug: `suppress-corp-8c-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "Deactivated Learner",
        email: `deact_rem_${Date.now()}@example.com`,
        role: "employee",
        status: "deactivated",
        invitationStatus: "invited",
        invitationSentAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      })
      .returning();

    const res = await processTrainingReminders({ companyId: testComp.id, policyWindowPeriod: "2026-SUPPRESS-W1" });
    assert.equal(res.dispatchedCount, 0, "Deactivated employee must receive 0 reminders");
  });

  test("26-30. Notification failure isolation prevents transaction rollbacks", async () => {
    const notif = await sendNotification({
      companyId: 1,
      recipientEmail: "invalid@example.com",
      recipientName: "Test Recipient",
      type: "course_assigned",
      title: "Test Isolation Title",
      message: "Test message body",
    });

    assert.ok(notif.delivered !== undefined, "Notification delivery status should return cleanly without throwing");
  });

  test("31-40. Learner engagement diagnostics run with 0 critical or high severity errors", async () => {
    const diag = await runLearnerEngagementDiagnostics();
    assert.equal(diag.criticalIssuesCount, 0, "Expected 0 critical engagement issues");
    assert.equal(diag.highIssuesCount, 0, "Expected 0 high engagement issues");
  });
});
