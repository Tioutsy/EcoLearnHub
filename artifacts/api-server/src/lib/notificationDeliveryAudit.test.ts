import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import {
  db,
  companiesTable,
  employeesTable,
  notificationDeliveryLogsTable,
  notificationPreferencesTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { DevLogProvider } from "./notificationProvider";
import { renderEmailTemplate } from "./emailTemplateEngine";
import { dispatchNotificationDelivery } from "./notificationDeliveryService";
import { runNotificationDeliveryDiagnostics } from "./notificationDeliveryDiagnostics";

describe("Sprint 8D: Production Notification Delivery & Communication Reliability Audit", () => {
  before(async () => {
    await ensureSchemaModifications();
  });

  test("1. DevLogProvider simulates dispatch and returns provider message ID", async () => {
    const provider = new DevLogProvider();
    const result = await provider.sendEmail({
      to: "test@example.com",
      subject: "Test Subject",
      html: "<p>Test HTML</p>",
      text: "Test Text",
    });

    assert.equal(result.success, true);
    assert.equal(result.providerName, "DevLogProvider");
    assert.ok(result.providerMessageId, "Provider message ID must be present");
  });

  test("2. renderEmailTemplate generates responsive HTML and plain-text fallbacks", async () => {
    const rendered = renderEmailTemplate("course_assigned", {
      companyName: "Acme Corp",
      recipientName: "Jane Doe",
      courseTitle: "Sustainability Foundations",
      courseCode: "ELH-01",
      dueDate: "2026-08-18",
      actionUrl: "https://app.ecolearnhub.com/learn/elh-01",
    });

    assert.ok(rendered.subject.includes("Assigned Training"));
    assert.ok(rendered.html.includes("Jane Doe"));
    assert.ok(rendered.html.includes("Sustainability Foundations"));
    assert.ok(rendered.text.includes("Jane Doe"));
    assert.ok(rendered.text.includes("Due Date:"));
  });

  test("3. dispatchNotificationDelivery enforces deduplication keys idempotently", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Dedup Corp 8D", slug: `dedup-corp-8d-${Date.now()}` })
      .returning();

    const dedupKey = `comp_${testComp.id}_emp_99_asgn_1_type_overdue_period_2026-W30`;

    // 1st Dispatch -> Success
    const res1 = await dispatchNotificationDelivery({
      companyId: testComp.id,
      recipientEmail: `dedup_${Date.now()}@example.com`,
      recipientName: "Dedup Learner",
      notificationType: "course_overdue",
      deduplicationKey: dedupKey,
      templateData: { courseTitle: "ELH-01" },
    });

    assert.equal(res1.delivered, true);
    assert.equal(res1.status, "delivered");

    // 2nd Dispatch -> Skipped
    const res2 = await dispatchNotificationDelivery({
      companyId: testComp.id,
      recipientEmail: `dedup_${Date.now()}@example.com`,
      recipientName: "Dedup Learner",
      notificationType: "course_overdue",
      deduplicationKey: dedupKey,
      templateData: { courseTitle: "ELH-01" },
    });

    assert.equal(res2.delivered, true);
    assert.equal(res2.status, "skipped");
  });

  test("4. Optional engagement notifications respect learner opt-out preferences", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "OptOut Corp 8D", slug: `optout-corp-8d-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "OptOut Learner",
        email: `optout_${Date.now()}@example.com`,
        role: "employee",
        status: "active",
      })
      .returning();

    // Opt out of optional engagement notifications
    await db.insert(notificationPreferencesTable).values({
      companyId: testComp.id,
      employeeId: emp.id,
      optionalEngagementReminders: false,
    });

    // Optional notification (e.g. inactive_in_progress) should be skipped
    const resOptional = await dispatchNotificationDelivery({
      companyId: testComp.id,
      recipientEmployeeId: emp.id,
      recipientEmail: emp.email,
      recipientName: emp.name,
      notificationType: "inactive_in_progress",
      deduplicationKey: `opt_test_${emp.id}_${Date.now()}`,
      isOperational: false,
    });

    assert.equal(resOptional.status, "skipped");
    assert.equal(resOptional.delivered, false);

    // Operational notification (e.g. course_completed) MUST NOT be skipped
    const resOperational = await dispatchNotificationDelivery({
      companyId: testComp.id,
      recipientEmployeeId: emp.id,
      recipientEmail: emp.email,
      recipientName: emp.name,
      notificationType: "course_completed",
      deduplicationKey: `op_test_${emp.id}_${Date.now()}`,
      isOperational: true,
    });

    assert.equal(resOperational.status, "delivered");
    assert.equal(resOperational.delivered, true);
  });

  test("5. Notification delivery diagnostics run with 0 critical or high issues", async () => {
    const diag = await runNotificationDeliveryDiagnostics();
    assert.equal(diag.criticalIssuesCount, 0, "Expected 0 critical delivery diagnostic issues");
    assert.equal(diag.highIssuesCount, 0, "Expected 0 high delivery diagnostic issues");
  });
});
