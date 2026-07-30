import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./ensureSchemaModifications";
import {
  db,
  companiesTable,
  employeesTable,
  courseAssignmentsTable,
  enrollmentsTable,
  learnerCommitmentsTable,
} from "@workspace/db";
import { getCompanyTrainingAnalytics } from "./trainingAnalyticsService";
import {
  getManagerInterventionQueue,
  executeBulkManagerInterventions,
} from "./trainingInterventionService";
import {
  createLearnerCommitment,
  completeLearnerCommitment,
  confirmLearnerCommitmentByManager,
} from "./learnerCommitmentService";
import { runTrainingAnalyticsDiagnostics } from "./trainingAnalyticsDiagnostics";

describe("Sprint 8E: Management Analytics, Training Intervention Workflows & Behaviour-Change Evidence Audit", () => {
  before(async () => {
    await ensureSchemaModifications();
  });

  test("1. getCompanyTrainingAnalytics calculates authoritative metrics cleanly", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Analytics Corp 8E", slug: `analytics-corp-8e-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "Analytics Learner",
        email: `analytics_${Date.now()}@example.com`,
        role: "employee",
        status: "active",
        invitationStatus: "activated",
      })
      .returning();

    const res = await getCompanyTrainingAnalytics(testComp.id, "company_admin");
    assert.equal(res.companyId, testComp.id);
    assert.equal(res.participation.eligibleLearners, 1);
    assert.equal(res.participation.activatedLearners, 1);
    assert.equal(res.participation.activationRatePct, 100);
  });

  test("2. getCompanyTrainingAnalytics enforces manager department scope", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Dept Analytics Corp 8E", slug: `dept-analytics-8e-${Date.now()}` })
      .returning();

    await db.insert(employeesTable).values([
      {
        companyId: testComp.id,
        name: "Sales Member",
        email: `sales_${Date.now()}@example.com`,
        department: "Sales",
        role: "employee",
        status: "active",
      },
      {
        companyId: testComp.id,
        name: "Engineering Member",
        email: `eng_${Date.now()}@example.com`,
        department: "Engineering",
        role: "employee",
        status: "active",
      },
    ]);

    const salesRes = await getCompanyTrainingAnalytics(testComp.id, "manager", "Sales");
    assert.equal(salesRes.participation.eligibleLearners, 1, "Manager analytics should only count Sales department employees");
  });

  test("3. getManagerInterventionQueue generates explainable priority reasons", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Intervention Corp 8E", slug: `intervention-corp-8e-${Date.now()}` })
      .returning();

    const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "Unactivated Learner",
        email: `unact_${Date.now()}@example.com`,
        role: "employee",
        status: "active",
        invitationStatus: "invited",
        invitationSentAt: pastDate,
      })
      .returning();

    const queue = await getManagerInterventionQueue(testComp.id, "company_admin");
    assert.ok(queue.length >= 1, "Expected at least 1 item in intervention queue");

    const item = queue.find((q) => q.employeeId === emp.id);
    assert.ok(item, "Expected unactivated learner item in queue");
    assert.equal(item?.type, "unactivated");
    assert.ok(item?.priorityReason.includes("sent over 3 days ago"));
  });

  test("4. executeBulkManagerInterventions enforces scope and dispatches actions safely", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Bulk Interventions Corp 8E", slug: `bulk-interventions-8e-${Date.now()}` })
      .returning();

    const [emp1] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "Bulk Target 1",
        email: `bulk1_${Date.now()}@example.com`,
        department: "Operations",
        role: "employee",
        status: "active",
      })
      .returning();

    const bulkRes = await executeBulkManagerInterventions({
      companyId: testComp.id,
      actorUserId: "mgr_123",
      actorRole: "manager",
      managerDepartment: "Operations",
      employeeIds: [emp1.id],
      interventionType: "reminder_sent",
    });

    assert.equal(bulkRes.succeeded, 1);
    assert.equal(bulkRes.skipped, 0);
  });

  test("5. Learner commitments lifecycle: creation, self-reported completion, reflection, and manager confirmation", async () => {
    const [testComp] = await db
      .insert(companiesTable)
      .values({ name: "Commitments Corp 8E", slug: `commitments-corp-8e-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testComp.id,
        name: "Commitment Learner",
        email: `commitment_${Date.now()}@example.com`,
        department: "Sustainability",
        role: "employee",
        status: "active",
      })
      .returning();

    // 1. Create commitment
    const commitment = await createLearnerCommitment({
      companyId: testComp.id,
      employeeId: emp.id,
      courseId: 1,
      commitmentText: "Switch off unused lab equipment every evening at 6 PM.",
    });

    assert.equal(commitment.status, "planned");

    // 2. Self-reported completion with reflection
    const completed = await completeLearnerCommitment(
      commitment.id,
      testComp.id,
      emp.id,
      "Successfully turned off lab equipment all week."
    );

    assert.equal(completed.status, "completed_self_reported");
    assert.equal(completed.learnerReflection, "Successfully turned off lab equipment all week.");

    // 3. Manager confirmation
    const confirmed = await confirmLearnerCommitmentByManager(
      commitment.id,
      testComp.id,
      "mgr_sustainability",
      "Sustainability"
    );

    assert.equal(confirmed.status, "completed_manager_confirmed");
    assert.equal(confirmed.managerConfirmationStatus, "confirmed");
  });

  test("6. Training analytics diagnostics run with 0 critical or high issues", async () => {
    const diag = await runTrainingAnalyticsDiagnostics();
    assert.equal(diag.criticalIssuesCount, 0, "Expected 0 critical analytics diagnostic issues");
    assert.equal(diag.highIssuesCount, 0, "Expected 0 high analytics diagnostic issues");
  });
});
