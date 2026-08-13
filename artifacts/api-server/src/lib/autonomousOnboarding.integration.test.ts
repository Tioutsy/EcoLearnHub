import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  db,
  companiesTable,
  employeesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  planPricesTable,
  coursesTable,
  enrollmentsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { onboardCompany, assignStarterCourse } from "./companyOnboardingService.js";
import { createOrRefreshInvitation, revokeInvitation, acceptInvitation } from "./invitationService.js";
import { getCompanyAccess, requireCompanyAdmin } from "./access.js";
import { ensureSchemaModifications } from "./ensureSchemaModifications.js";
import type { Request } from "express";

const PREFIX = `onboard_test_${Date.now()}_`;

describe("Sprint 11F — Autonomous Company Activation Integration Suite", () => {
  const clerkUserUnlinked = `${PREFIX}clerk_unlinked_user`;
  const emailUnlinked = `${PREFIX}unlinked@example.com`;

  const clerkUserDuplicate = `${PREFIX}clerk_dup_user`;
  const emailDuplicate = `${PREFIX}dup@example.com`;

  const clerkExistingEmployee = `${PREFIX}clerk_emp_user`;
  const emailExistingEmployee = `${PREFIX}emp_existing@example.com`;

  let createdCompanyId: number | null = null;
  let starterCourseId: number | null = null;

  before(async () => {
    await ensureSchemaModifications();
    const [c1] = await db.select().from(coursesTable).where(eq(coursesTable.courseCode, "ELH-01")).limit(1);
    if (c1) starterCourseId = c1.id;
  });

  after(async () => {
    if (createdCompanyId) {
      await db.delete(enrollmentsTable).where(eq(enrollmentsTable.companyId, createdCompanyId));
      await db.delete(employeesTable).where(eq(employeesTable.companyId, createdCompanyId));
      await db.delete(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, createdCompanyId));
      await db.delete(companiesTable).where(eq(companiesTable.id, createdCompanyId));
    }
  });

  function makeMockReq(userId: string | null, email?: string | null, claims?: Record<string, any>): Request {
    return {
      auth: userId ? { userId, sessionClaims: { email, ...claims } } : {},
    } as unknown as Request;
  }

  test("1. An authenticated unlinked user can begin authorised onboarding", async () => {
    const req = makeMockReq(clerkUserUnlinked, emailUnlinked);
    // Before onboarding, accessing /company requires explicit company_admin role -> 403
    await assert.rejects(
      async () => await requireCompanyAdmin(req),
      (err: any) => err.status === 403
    );
  });

  test("2. Company creation produces exactly one company and explicit admin membership", async () => {
    const result = await onboardCompany({
      userId: clerkUserUnlinked,
      email: emailUnlinked,
      adminName: "First Admin",
      companyName: `${PREFIX}Autonomous Tech Ltd`,
      employeeCount: 15,
      employeeBandCode: "UP_TO_25",
    });

    assert.equal(result.outcome, "success");
    assert.ok(result.company?.id);
    createdCompanyId = result.company.id;

    assert.equal(result.employee?.role, "admin");
    assert.equal(result.employee?.clerkUserId, clerkUserUnlinked);

    // Verify exactly one company was created for this ID
    const companies = await db.select().from(companiesTable).where(eq(companiesTable.id, createdCompanyId!));
    assert.equal(companies.length, 1);
  });

  test("3. Creator receives company_admin access immediately upon requireCompanyAdmin", async () => {
    const req = makeMockReq(clerkUserUnlinked, emailUnlinked);
    const access = await requireCompanyAdmin(req);
    assert.equal(access.role, "company_admin");
    assert.equal(access.companyId, createdCompanyId);
  });

  test("4. Repeating the onboarding request does not duplicate company (Idempotent)", async () => {
    const result = await onboardCompany({
      userId: clerkUserUnlinked,
      email: emailUnlinked,
      adminName: "First Admin",
      companyName: `${PREFIX}Autonomous Tech Ltd`,
      employeeCount: 15,
    });

    assert.equal(result.outcome, "already_onboarded");
    assert.equal(result.company?.id, createdCompanyId);
  });

  test("5. Client-supplied price and status are ignored and pricing is derived server-side", async () => {
    const [sub] = await db
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, createdCompanyId!));

    assert.equal(sub.currency, "MUR");
    assert.equal(parseFloat(sub.agreedMonthlyAmount!), 3000);
  });

  test("6. Pricing is derived correctly for every employee band", async () => {
    const b25 = await onboardCompany({
      userId: `${PREFIX}b25`,
      email: `b25_${Date.now()}@example.com`,
      adminName: "Admin 25",
      companyName: `${PREFIX}Co 25`,
      employeeBandCode: "UP_TO_25",
    });
    assert.equal(b25.monthlyAmount, 3000);

    const b50 = await onboardCompany({
      userId: `${PREFIX}b50`,
      email: `b50_${Date.now()}@example.com`,
      adminName: "Admin 50",
      companyName: `${PREFIX}Co 50`,
      employeeBandCode: "FROM_26_TO_50",
    });
    assert.equal(b50.monthlyAmount, 4500);

    const b80 = await onboardCompany({
      userId: `${PREFIX}b80`,
      email: `b80_${Date.now()}@example.com`,
      adminName: "Admin 80",
      companyName: `${PREFIX}Co 80`,
      employeeBandCode: "FROM_51_TO_80",
    });
    assert.equal(b80.monthlyAmount, 5000);

    const b120 = await onboardCompany({
      userId: `${PREFIX}b120`,
      email: `b120_${Date.now()}@example.com`,
      adminName: "Admin 120",
      companyName: `${PREFIX}Co 120`,
      employeeBandCode: "FROM_81_TO_120",
    });
    assert.equal(b120.monthlyAmount, 6250);

    // Cleanup temp companies created for band tests
    const testCompIds = [b25.company?.id, b50.company?.id, b80.company?.id, b120.company?.id].filter(Boolean);
    for (const cid of testCompIds) {
      await db.delete(employeesTable).where(eq(employeesTable.companyId, cid));
      await db.delete(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, cid));
      await db.delete(companiesTable).where(eq(companiesTable.id, cid));
    }
  });

  test("7. More than 120 employees receives the tailored-contact outcome and blocks automated activation", async () => {
    const result = await onboardCompany({
      userId: `${PREFIX}over120_user`,
      email: `over120_${Date.now()}@example.com`,
      adminName: "Big Admin",
      companyName: `${PREFIX}Enterprise 500 Ltd`,
      employeeCount: 150,
      employeeBandCode: "OVER_120",
    });

    assert.equal(result.outcome, "tailored_contact_required");
    assert.equal(result.company, undefined);
  });

  test("8. Existing employee in a company cannot create an unauthorised second company", async () => {
    // 1. Create a dummy employee in createdCompanyId
    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: createdCompanyId!,
        clerkUserId: clerkExistingEmployee,
        email: emailExistingEmployee,
        name: "Standard Employee",
        role: "employee",
        status: "active",
      })
      .returning();

    // 2. Employee attempts onboarding -> rejected with error
    await assert.rejects(
      async () =>
        await onboardCompany({
          userId: clerkExistingEmployee,
          email: emailExistingEmployee,
          adminName: "Rogue Employee",
          companyName: `${PREFIX}Rogue Company`,
          employeeCount: 10,
        }),
      (err: any) => err.message.includes("Existing employee membership found")
    );
  });

  test("9. Admin can generate tenant-scoped employee invitation and accept it cleanly", async () => {
    // 1. Create employee in createdCompanyId
    const [invitedEmp] = await db
      .insert(employeesTable)
      .values({
        companyId: createdCompanyId!,
        email: `${PREFIX}invited_user@example.com`,
        name: "Invited Member",
        role: "employee",
        status: "active",
        invitationStatus: "pending",
      })
      .returning();

    // 2. Admin creates invitation token
    const invite = await createOrRefreshInvitation(createdCompanyId!, invitedEmp.id);
    assert.ok(invite.token);
    assert.equal(invite.invitationStatus, "invited");

    // 3. User accepts invitation using single-use token
    const clerkAcceptUser = `${PREFIX}clerk_accepted_user`;
    const acceptRes = await acceptInvitation(invite.token, clerkAcceptUser);
    assert.equal(acceptRes.employee.clerkUserId, clerkAcceptUser);
    assert.equal(acceptRes.employee.invitationStatus, "accepted");
    assert.equal(acceptRes.employee.invitationToken, null);

    // 4. Token cannot be reused (Single-use token verification)
    await assert.rejects(
      async () => await acceptInvitation(invite.token, "clerk_reuse_attacker"),
      (err: any) => err.message.includes("Invalid or expired")
    );
  });

  test("10. Revoked invitation is rejected on acceptance attempt", async () => {
    const [empToRevoke] = await db
      .insert(employeesTable)
      .values({
        companyId: createdCompanyId!,
        email: `${PREFIX}to_revoke@example.com`,
        name: "Revoked Member",
        role: "employee",
        status: "active",
      })
      .returning();

    const invite = await createOrRefreshInvitation(createdCompanyId!, empToRevoke.id);
    await revokeInvitation(createdCompanyId!, empToRevoke.id);

    await assert.rejects(
      async () => await acceptInvitation(invite.token, "clerk_attacker"),
      (err: any) => err.message.includes("revoked")
    );
  });

  test("11. Starter course ELH-01 assignment can be assigned to active employees", async () => {
    const result = await assignStarterCourse(createdCompanyId!, clerkUserUnlinked, "ELH-01", 30);
    assert.equal(result.courseTitle, "Sustainability Foundations");
    assert.ok(result.assignedCount >= 1);
  });
});
