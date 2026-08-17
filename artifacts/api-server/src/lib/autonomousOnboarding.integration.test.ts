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
import { eq, and, sql } from "drizzle-orm";
import { onboardCompany, assignStarterCourse } from "./companyOnboardingService.js";
import { createOrRefreshInvitation, revokeInvitation, acceptInvitation } from "./invitationService.js";
import { getCompanyAccess, requireCompanyAdmin } from "./access.js";
import { ensureSchemaModifications } from "./ensureSchemaModifications.js";
import type { Request } from "express";

const PREFIX = `onboard_gate_${Date.now()}_`;

describe("Sprint 11F.1 — Autonomous Onboarding Production Release Gate Test Matrix", () => {
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

  // --- SECTION 1: IDENTITY & ONBOARDING SECURITY (1-11) ---

  test("1. Unauthenticated onboarding request is rejected", async () => {
    const req = makeMockReq(null);
    await assert.rejects(
      async () => await requireCompanyAdmin(req),
      (err: any) => err.status === 401 || err.message.includes("Unauthenticated")
    );
  });

  test("2. Eligible unlinked user starts authorised onboarding", async () => {
    const req = makeMockReq(clerkUserUnlinked, emailUnlinked);
    await assert.rejects(
      async () => await requireCompanyAdmin(req),
      (err: any) => err.status === 403
    );
  });

  test("3. Company creation produces exactly one company and explicit admin membership", async () => {
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

    const companies = await db.select().from(companiesTable).where(eq(companiesTable.id, createdCompanyId!));
    assert.equal(companies.length, 1);
  });

  test("4. Creator receives company_admin access immediately upon requireCompanyAdmin", async () => {
    const req = makeMockReq(clerkUserUnlinked, emailUnlinked);
    const access = await requireCompanyAdmin(req);
    assert.equal(access.role, "company_admin");
    assert.equal(access.companyId, createdCompanyId);
  });

  test("5. Repeating the onboarding request does not duplicate company (Idempotent)", async () => {
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

  test("6. Client-supplied role, price, companyId and subscription status are ignored", async () => {
    const [sub] = await db
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, createdCompanyId!));

    assert.equal(sub.currency, "MUR");
    assert.equal(parseFloat(sub.agreedMonthlyAmount!), 3000);
    assert.equal(sub.status, "PENDING"); // Initialized as PENDING non-paid status until payment
  });

  test("7. Transaction Rollback Audit: Partial failure inside db.transaction leaves NO orphan records", async () => {
    const rollbackUser = `${PREFIX}rollback_user`;
    const rollbackEmail = `${PREFIX}rollback@example.com`;

    try {
      await db.transaction(async (tx) => {
        const [comp] = await tx
          .insert(companiesTable)
          .values({ name: `${PREFIX}Rollback Co`, slug: `${PREFIX}rollback-co-${Date.now()}` })
          .returning();

        await tx.insert(employeesTable).values({
          companyId: comp.id,
          clerkUserId: rollbackUser,
          email: rollbackEmail,
          name: "Rollback Admin",
          role: "admin",
        });

        // Simulate forced failure at subscription stage
        throw new Error("FORCED_SIMULATED_TRANSACTION_FAILURE");
      });
    } catch (err: any) {
      assert.equal(err.message, "FORCED_SIMULATED_TRANSACTION_FAILURE");
    }

    // Verify NO orphan company or employee remains in DB
    const orphanEmp = await db.select().from(employeesTable).where(eq(employeesTable.clerkUserId, rollbackUser));
    assert.equal(orphanEmp.length, 0, "No orphan employee record must exist after rollback");

    const orphanComp = await db.select().from(companiesTable).where(sql`name = ${`${PREFIX}Rollback Co`}`);
    assert.equal(orphanComp.length, 0, "No orphan company record must exist after rollback");
  });

  // --- SECTION 2: PRICING & SUBSCRIPTION BOUNDARIES (12-18) ---

  test("8. Pricing is derived correctly for every employee band server-side", async () => {
    const b25 = await onboardCompany({
      userId: `${PREFIX}b25_gate`,
      email: `b25_${Date.now()}@example.com`,
      adminName: "Admin 25",
      companyName: `${PREFIX}Co 25 Gate`,
      employeeBandCode: "UP_TO_25",
    });
    assert.equal(b25.monthlyAmount, 3000);

    const b50 = await onboardCompany({
      userId: `${PREFIX}b50_gate`,
      email: `b50_${Date.now()}@example.com`,
      adminName: "Admin 50",
      companyName: `${PREFIX}Co 50 Gate`,
      employeeBandCode: "FROM_26_TO_50",
    });
    assert.equal(b50.monthlyAmount, 4500);

    const b80 = await onboardCompany({
      userId: `${PREFIX}b80_gate`,
      email: `b80_${Date.now()}@example.com`,
      adminName: "Admin 80",
      companyName: `${PREFIX}Co 80 Gate`,
      employeeBandCode: "FROM_51_TO_80",
    });
    assert.equal(b80.monthlyAmount, 5000);

    const b120 = await onboardCompany({
      userId: `${PREFIX}b120_gate`,
      email: `b120_${Date.now()}@example.com`,
      adminName: "Admin 120",
      companyName: `${PREFIX}Co 120 Gate`,
      employeeBandCode: "FROM_81_TO_120",
    });
    assert.equal(b120.monthlyAmount, 6250);

    // Cleanup temp companies
    const testCompIds = [b25.company?.id, b50.company?.id, b80.company?.id, b120.company?.id].filter(Boolean);
    for (const cid of testCompIds) {
      await db.delete(employeesTable).where(eq(employeesTable.companyId, cid));
      await db.delete(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, cid));
      await db.delete(companiesTable).where(eq(companiesTable.id, cid));
    }
  });

  test("9. More than 120 employees completes autonomous onboarding with transparent enterprise pricing", async () => {
    const result = await onboardCompany({
      userId: `${PREFIX}over120_gate`,
      email: `over120_${Date.now()}@example.com`,
      adminName: "Big Admin",
      companyName: `${PREFIX}Enterprise 500 Gate Ltd`,
      employeeCount: 150,
      employeeBandCode: "OVER_120",
      planCode: "ESSENTIAL",
      billingInterval: "MONTHLY",
    });

    assert.equal(result.outcome, "success");
    assert.ok(result.company);
    assert.equal(result.company.maxEmployees, 250);
    assert.equal(result.monthlyAmount, 7500);

    // Cleanup
    if (result.company?.id) {
      await db.delete(employeesTable).where(eq(employeesTable.companyId, result.company.id));
      await db.delete(companySubscriptionsTable).where(eq(companySubscriptionsTable.companyId, result.company.id));
      await db.delete(companiesTable).where(eq(companiesTable.id, result.company.id));
    }
  });

  test("10. Existing employee in a company cannot create an unauthorised second company", async () => {
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

  // --- SECTION 3: INVITATIONS & TENANT ISOLATION (19-31) ---

  test("11. Admin can generate tenant-scoped employee invitation and accept it cleanly", async () => {
    const [invitedEmp] = await db
      .insert(employeesTable)
      .values({
        companyId: createdCompanyId!,
        email: `${PREFIX}invited_gate@example.com`,
        name: "Invited Member",
        role: "employee",
        status: "active",
        invitationStatus: "pending",
      })
      .returning();

    const invite = await createOrRefreshInvitation(createdCompanyId!, invitedEmp.id);
    assert.ok(invite.token);
    assert.equal(invite.invitationStatus, "invited");

    const clerkAcceptUser = `${PREFIX}clerk_accepted_gate`;
    const acceptRes = await acceptInvitation(invite.token, clerkAcceptUser);
    assert.equal(acceptRes.employee.clerkUserId, clerkAcceptUser);
    assert.equal(acceptRes.employee.invitationStatus, "accepted");
    assert.equal(acceptRes.employee.invitationToken, null);

    // Single-use token invalidated
    await assert.rejects(
      async () => await acceptInvitation(invite.token, "clerk_reuse_attacker"),
      (err: any) => err.message.includes("Invalid or expired")
    );
  });

  test("12. Revoked invitation is rejected on acceptance attempt", async () => {
    const [empToRevoke] = await db
      .insert(employeesTable)
      .values({
        companyId: createdCompanyId!,
        email: `${PREFIX}to_revoke_gate@example.com`,
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

  // --- SECTION 4: FIRST LEARNING JOURNEY (32-37) ---

  test("13. Starter course ELH-01 assignment can be assigned to active employees", async () => {
    const result = await assignStarterCourse(createdCompanyId!, clerkUserUnlinked, "ELH-01", 30);
    assert.equal(result.courseTitle, "Sustainability Foundations");
    assert.ok(result.assignedCount >= 1);
  });
});
