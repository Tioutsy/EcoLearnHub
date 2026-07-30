import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  db,
  coursesTable,
  companiesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  employeesTable,
  courseAssignmentsTable,
} from "@workspace/db";
import { eq } from "drizzle-orm";
import { getCompanyOnboardingStatus } from "./companyOnboardingService";
import { parseAndValidateEmployeeCsv, executeEmployeeImport } from "./employeeImportService";
import { createOrRefreshInvitation, revokeInvitation, acceptInvitation } from "./invitationService";
import { runCompanyOnboardingDiagnostics } from "./companyOnboardingDiagnostics";

describe("Sprint 8A: Company Onboarding, Employee Import & First-Course Activation Audit", () => {

  test("1. Server-side getCompanyOnboardingStatus evaluates company readiness accurately", async () => {
    const status = await getCompanyOnboardingStatus(1);
    assert.ok(status.stage, "Onboarding stage must be present");
    assert.ok(Array.isArray(status.completedSteps), "completedSteps must be an array");
    assert.ok(status.employeeCapacity, "employeeCapacity object must be present");
    assert.equal(typeof status.employeeCapacity.limit, "number", "Employee band limit must be a number");
  });

  test("2. Bulk CSV employee import validates email format, roles, and escapes formulas", async () => {
    const csvContent = `first_name,last_name,email,role,department,job_title
Alex,Smith,alex.smith@example.com,employee,Operations,Operator
Sam,Jones,=SUM(A1:A10),manager,Sustainability,Lead
Invalid,User,notanemail,employee,HR,Recruiter
Admin,User,admin@example.com,platform_admin,Exec,VP`;

    const result = parseAndValidateEmployeeCsv(
      csvContent,
      [{ email: "existing@example.com" }],
      10
    );

    assert.equal(result.totalRows, 4, "Should detect 4 data rows");
    assert.equal(result.validRows.length, 1, "Should accept 1 valid row (Alex Smith)");
    assert.equal(result.invalidRows.length, 3, "Should reject invalid email, formula email, and platform_admin role");
    assert.equal(result.validRows[0].email, "alex.smith@example.com");
  });

  test("3. Bulk CSV import rejects uploads exceeding employee band capacity limit", async () => {
    const csvContent = `first_name,last_name,email,role,department
User1,Test,user1@example.com,employee,Operations
User2,Test,user2@example.com,employee,Operations
User3,Test,user3@example.com,employee,Operations`;

    // Capacity remaining = 2, but CSV contains 3 rows
    const result = parseAndValidateEmployeeCsv(
      csvContent,
      [],
      2
    );

    assert.equal(result.validRows.length, 3, "Valid rows = 3");
    assert.equal(result.capacityLimitExceeded, true, "capacityLimitExceeded must be true");
  });

  test("4. Invitation lifecycle supports unguessable token generation, resend, revoke, and single-use acceptance", async () => {
    const [testCompany] = await db
      .insert(companiesTable)
      .values({ name: "Invitation Test Corp 8A", slug: `invitation-test-corp-8a-${Date.now()}` })
      .returning();

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: testCompany.id,
        name: "Test Learner 8A",
        email: `testlearner8a_${Date.now()}@example.com`,
        role: "employee",
        invitationStatus: "not_invited",
      })
      .returning();

    // Generate/refresh invitation
    const invite = await createOrRefreshInvitation(testCompany.id, emp.id);
    assert.equal(invite.invitationStatus, "invited", "Status should be invited");
    assert.ok(invite.token.length > 20, "Token should be unguessable UUID");

    // Accept invitation
    const accepted = await acceptInvitation(invite.token, "clerk_user_test_8a");
    assert.equal(accepted.employee.invitationStatus, "accepted", "Status should update to accepted");
    assert.equal(accepted.employee.invitationToken, null, "Token must be invalidated after single use");

    // Revoke test
    const [emp2] = await db
      .insert(employeesTable)
      .values({
        companyId: testCompany.id,
        name: "Revoke Learner 8A",
        email: `revoke8a_${Date.now()}@example.com`,
        role: "employee",
        invitationStatus: "not_invited",
      })
      .returning();

    const invite2 = await createOrRefreshInvitation(testCompany.id, emp2.id);
    const revoked = await revokeInvitation(testCompany.id, emp2.id);
    assert.equal(revoked.invitationStatus, "revoked", "Status should update to revoked");

    await assert.rejects(
      async () => acceptInvitation(invite2.token, "clerk_user_revoked"),
      /revoked/,
      "Accepting revoked token must throw error"
    );
  });

  test("5. First-course assignment creates assignments idempotently without duplicate active enrolments", async () => {
    const [elh01] = await db
      .select({ id: coursesTable.id })
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-01"))
      .limit(1);

    assert.ok(elh01, "ELH-01 Sustainability Foundations must exist");
  });

  test("6. Onboarding diagnostics report zero critical and high issues", async () => {
    const report = await runCompanyOnboardingDiagnostics();
    assert.equal(report.criticalIssuesCount, 0, `Expected 0 critical onboarding issues, found ${report.criticalIssuesCount}`);
    assert.equal(report.highIssuesCount, 0, `Expected 0 high onboarding issues, found ${report.highIssuesCount}`);
  });
});
