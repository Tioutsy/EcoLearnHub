import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  db,
  companiesTable,
  employeesTable,
  coursesTable,
  enrollmentsTable,
  learnerCommitmentsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  createLearnerCommitment,
  reportWorkplaceAction,
  reviewWorkplaceActionByManager,
  getCompanyImpactSummary,
  exportCompanyActionEvidenceCsv,
  MINIMUM_PRIVACY_THRESHOLD,
  escapeCsvCell,
} from "./learnerCommitmentService.js";
import { generateCompanyImpactNarrative } from "./ai/trainingImpactNarrativeService.js";
import { ensureSchemaModifications } from "./ensureSchemaModifications.js";

const PREFIX = `s11d_test_${Date.now()}_`;

describe("Sprint 11D — Training Impact & Tenant Isolation Integration Suite", () => {
  let companyAId: number;
  let companyBId: number;
  let empA1Id: number;
  let empA2Id: number;
  let empB1Id: number;
  let courseId: number;
  let enrollmentA1Id: number;
  let commitmentA1Id: number;

  before(async () => {
    await ensureSchemaModifications();

    // 1. Create Company A & Company B
    const [compA] = await db
      .insert(companiesTable)
      .values({
        name: `${PREFIX}Company A`,
        slug: `${PREFIX}company-a`,
      })
      .returning();
    companyAId = compA.id;

    const [compB] = await db
      .insert(companiesTable)
      .values({
        name: `${PREFIX}Company B`,
        slug: `${PREFIX}company-b`,
      })
      .returning();
    companyBId = compB.id;

    // 2. Create Employees for Company A (Engineering: 6 emp; Sales: 2 emp for privacy test)
    const [empA1] = await db
      .insert(employeesTable)
      .values({
        companyId: companyAId,
        clerkUserId: `${PREFIX}clerk_emp_a1`,
        name: "Employee A1",
        email: `${PREFIX}emp_a1@compa.com`,
        department: "Engineering",
      })
      .returning();
    empA1Id = empA1.id;

    const [empA2] = await db
      .insert(employeesTable)
      .values({
        companyId: companyAId,
        clerkUserId: `${PREFIX}clerk_emp_a2`,
        name: "Employee A2",
        email: `${PREFIX}emp_a2@compa.com`,
        department: "Sales",
      })
      .returning();
    empA2Id = empA2.id;

    // Insert 4 more employees in Engineering to pass privacy threshold (total 5 in Engineering)
    for (let i = 3; i <= 6; i++) {
      await db.insert(employeesTable).values({
        companyId: companyAId,
        clerkUserId: `${PREFIX}clerk_emp_a${i}`,
        name: `Employee A${i}`,
        email: `${PREFIX}emp_a${i}@compa.com`,
        department: "Engineering",
      });
    }

    // 3. Create Employee for Company B
    const [empB1] = await db
      .insert(employeesTable)
      .values({
        companyId: companyBId,
        clerkUserId: `${PREFIX}clerk_emp_b1`,
        name: "Employee B1",
        email: `${PREFIX}emp_b1@compb.com`,
        department: "Operations",
      })
      .returning();
    empB1Id = empB1.id;

    // 4. Create Test Course & Completed Enrollment for Emp A1
    const [course] = await db
      .insert(coursesTable)
      .values({
        courseCode: `${PREFIX}COURSE_11D`,
        title: "Workplace Sustainability Action",
        description: "Test Course",
        categoryId: 1,
        durationMinutes: 30,
        slug: `${PREFIX}course-11d`,
        isPublished: true,
      })
      .returning();
    courseId = course.id;

    const [enrA1] = await db
      .insert(enrollmentsTable)
      .values({
        companyId: companyAId,
        userId: `${PREFIX}clerk_emp_a1`,
        employeeId: empA1Id,
        courseId: courseId,
        status: "completed",
        completedAt: new Date(),
      })
      .returning();
    enrollmentA1Id = enrA1.id;
  });

  after(async () => {
    // Cleanup created test records
    await db.delete(learnerCommitmentsTable).where(eq(learnerCommitmentsTable.companyId, companyAId));
    await db.delete(learnerCommitmentsTable).where(eq(learnerCommitmentsTable.companyId, companyBId));
    await db.delete(enrollmentsTable).where(eq(enrollmentsTable.companyId, companyAId));
    await db.delete(employeesTable).where(eq(employeesTable.companyId, companyAId));
    await db.delete(employeesTable).where(eq(employeesTable.companyId, companyBId));
    await db.delete(coursesTable).where(eq(coursesTable.id, courseId));
    await db.delete(companiesTable).where(eq(companiesTable.id, companyAId));
    await db.delete(companiesTable).where(eq(companiesTable.id, companyBId));
  });

  test("1. Employee can create commitment for own completed course", async () => {
    const commitment = await createLearnerCommitment({
      companyId: companyAId,
      employeeId: empA1Id,
      courseId: courseId,
      enrollmentId: enrollmentA1Id,
      commitmentText: "For the next two weeks, I will make sure office lights are switched off after meetings.",
      actionCategory: "energy",
    });

    assert.ok(commitment.id);
    assert.strictEqual(commitment.companyId, companyAId);
    assert.strictEqual(commitment.employeeId, empA1Id);
    assert.strictEqual(commitment.actionCategory, "energy");
    assert.strictEqual(commitment.status, "committed");

    commitmentA1Id = commitment.id;
  });

  test("2. Duplicate commitment rules enforced", async () => {
    await assert.rejects(
      async () => {
        await createLearnerCommitment({
          companyId: companyAId,
          employeeId: empA1Id,
          courseId: courseId,
          enrollmentId: enrollmentA1Id,
          commitmentText: "Duplicate commitment attempt for same enrollment.",
          actionCategory: "energy",
        });
      },
      { message: "A workplace commitment already exists for this enrollment" }
    );
  });

  test("3. Employee cannot update or report progress on another employee's commitment", async () => {
    await assert.rejects(
      async () => {
        await reportWorkplaceAction(
          commitmentA1Id,
          companyAId,
          empA2Id, // Emp A2 trying to update Emp A1's commitment
          "Attempting unauthorized report"
        );
      },
      { message: "Unauthorized: Cannot update another employee's commitment" }
    );
  });

  test("4. Employee can report progress on own commitment", async () => {
    const updated = await reportWorkplaceAction(
      commitmentA1Id,
      companyAId,
      empA1Id,
      "Switched off meeting room lights 5 times this week."
    );

    assert.strictEqual(updated.status, "action-reported");
    assert.strictEqual(updated.employeeProgressNote, "Switched off meeting room lights 5 times this week.");
    assert.ok(updated.actionReportedAt);
  });

  test("5. Company Manager can review record from their company", async () => {
    const reviewed = await reviewWorkplaceActionByManager(
      commitmentA1Id,
      companyAId,
      "mgr_user_a",
      null,
      "confirm",
      "Excellent workplace initiative."
    );

    assert.strictEqual(reviewed.status, "manager-confirmed");
    assert.strictEqual(reviewed.managerConfirmationStatus, "confirmed");
    assert.strictEqual(reviewed.managerResponseNote, "Excellent workplace initiative.");
    assert.ok(reviewed.managerReviewedAt);
  });

  test("6. Manager cannot review or confirm another company's record", async () => {
    await assert.rejects(
      async () => {
        await reviewWorkplaceActionByManager(
          commitmentA1Id,
          companyBId, // Company B manager trying to review Company A commitment
          "mgr_user_b",
          null,
          "confirm"
        );
      },
      { message: "Workplace commitment record not found" }
    );
  });

  test("7. Company summaries contain only tenant-owned data", async () => {
    const summaryA = await getCompanyImpactSummary(companyAId);
    const summaryB = await getCompanyImpactSummary(companyBId);

    assert.strictEqual(summaryA.companyId, companyAId);
    assert.strictEqual(summaryA.commitmentsCreated, 1);
    assert.strictEqual(summaryA.managerConfirmedActions, 1);

    assert.strictEqual(summaryB.companyId, companyBId);
    assert.strictEqual(summaryB.commitmentsCreated, 0);
    assert.strictEqual(summaryB.managerConfirmedActions, 0);
  });

  test("8. Department breakdown is suppressed below privacy threshold", async () => {
    const summaryA = await getCompanyImpactSummary(companyAId);

    // Engineering has 5 employees -> NOT suppressed
    assert.strictEqual(summaryA.departmentSummary["Engineering"].suppressed, false);

    // Sales has 1 employee (< MINIMUM_PRIVACY_THRESHOLD of 5) -> SUPPRESSED
    assert.strictEqual(summaryA.departmentSummary["Sales"].suppressed, true);
    assert.strictEqual(summaryA.departmentSummary["Sales"].commitmentCount, 0);
  });

  test("9. CSV export contains only authenticated company's data and protects against formula injection", async () => {
    // Add commitment with formula injection attempt
    const [enrA2] = await db
      .insert(enrollmentsTable)
      .values({
        companyId: companyAId,
        userId: `${PREFIX}clerk_emp_a2`,
        employeeId: empA2Id,
        courseId: courseId,
        status: "completed",
        completedAt: new Date(),
      })
      .returning();

    await createLearnerCommitment({
      companyId: companyAId,
      employeeId: empA2Id,
      courseId: courseId,
      enrollmentId: enrA2.id,
      commitmentText: "=SUM(1,2) - Attempted formula injection in commitment text",
      actionCategory: "waste",
    });

    const csvA = await exportCompanyActionEvidenceCsv(companyAId);
    const csvB = await exportCompanyActionEvidenceCsv(companyBId);

    // Check Company A CSV
    assert.ok(csvA.includes("Employee A1"));
    assert.ok(csvA.includes("Workplace Sustainability Action"));
    // Verify anti-formula injection escaping
    assert.ok(csvA.includes(`"'=SUM(1,2) - Attempted formula injection in commitment text"`));

    // Check Company B CSV (empty data)
    assert.ok(!csvB.includes("Employee A1"));
  });

  test("10. Gemini failure returns deterministic fallback results", async () => {
    const narrative = await generateCompanyImpactNarrative(companyAId);
    assert.ok(narrative.summaryInterpretation);
    assert.ok(narrative.keyStrengthsAndGaps);
    assert.ok(narrative.suggestedManagementActions.length > 0);
    assert.ok(narrative.disclaimer);
  });
});
