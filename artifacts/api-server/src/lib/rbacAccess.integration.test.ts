import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";
import express, { Request, Response } from "express";
import {
  db,
  companiesTable,
  employeesTable,
  coursesTable,
  enrollmentsTable,
  learnerCommitmentsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getCompanyAccess, requireCompanyAdmin, requirePlatformAdmin } from "./access.js";
import { ensureSchemaModifications } from "./ensureSchemaModifications.js";

const PREFIX = `rbac_test_${Date.now()}_`;

describe("Sprint 11E — Fail-Closed RBAC & Tenant Isolation Integration Suite", () => {
  let companyAId: number;
  let companyBId: number;

  let empAAdminId: number;
  let empAEmployeeId: number;
  let empAManagerId: number;
  let empBAdminId: number;
  let empInactiveId: number;

  const clerkUnlinkedUser = `${PREFIX}clerk_unlinked`;
  const clerkAdminAUser = `${PREFIX}clerk_admin_a`;
  const clerkEmployeeAUser = `${PREFIX}clerk_emp_a`;
  const clerkManagerAUser = `${PREFIX}clerk_mgr_a`;
  const clerkAdminBUser = `${PREFIX}clerk_admin_b`;
  const clerkInactiveUser = `${PREFIX}clerk_inactive`;

  const emailAdminA = `${PREFIX}admin_a@example.com`;
  const emailEmpA = `${PREFIX}emp_a@example.com`;
  const emailMgrA = `${PREFIX}mgr_a@example.com`;
  const emailAdminB = `${PREFIX}admin_b@example.com`;
  const emailInactive = `${PREFIX}inactive@example.com`;
  const emailUnlinked = `${PREFIX}unlinked@example.com`;

  before(async () => {
    await ensureSchemaModifications();

    // 1. Create Company A and Company B
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

    // 2. Create Employee records
    const [empAdminA] = await db
      .insert(employeesTable)
      .values({
        companyId: companyAId,
        clerkUserId: clerkAdminAUser,
        email: emailAdminA,
        name: "Admin A",
        role: "admin",
        status: "active",
      })
      .returning();
    empAAdminId = empAdminA.id;

    const [empEmpA] = await db
      .insert(employeesTable)
      .values({
        companyId: companyAId,
        clerkUserId: clerkEmployeeAUser,
        email: emailEmpA,
        name: "Learner A",
        role: "employee",
        status: "active",
      })
      .returning();
    empAEmployeeId = empEmpA.id;

    const [empMgrA] = await db
      .insert(employeesTable)
      .values({
        companyId: companyAId,
        clerkUserId: clerkManagerAUser,
        email: emailMgrA,
        name: "Manager A",
        role: "manager",
        status: "active",
      })
      .returning();
    empAManagerId = empMgrA.id;

    const [empAdminB] = await db
      .insert(employeesTable)
      .values({
        companyId: companyBId,
        clerkUserId: clerkAdminBUser,
        email: emailAdminB,
        name: "Admin B",
        role: "admin",
        status: "active",
      })
      .returning();
    empBAdminId = empAdminB.id;

    const [empInact] = await db
      .insert(employeesTable)
      .values({
        companyId: companyAId,
        clerkUserId: clerkInactiveUser,
        email: emailInactive,
        name: "Inactive Learner",
        role: "admin",
        status: "deactivated",
      })
      .returning();
    empInactiveId = empInact.id;
  });

  after(async () => {
    await db.delete(employeesTable).where(eq(employeesTable.companyId, companyAId));
    await db.delete(employeesTable).where(eq(employeesTable.companyId, companyBId));
    await db.delete(companiesTable).where(eq(companiesTable.id, companyAId));
    await db.delete(companiesTable).where(eq(companiesTable.id, companyBId));
  });

  function makeMockReq(userId?: string | null, email?: string | null, claims?: Record<string, any>): Request {
    return {
      auth: userId ? { userId, sessionClaims: { email, ...claims } } : {},
    } as unknown as Request;
  }

  test("1. Unauthenticated requests return 401", async () => {
    const req = makeMockReq(null, null);
    await assert.rejects(
      async () => await getCompanyAccess(req),
      (err: any) => err.status === 401
    );
  });

  test("2. Authenticated users without membership return 403", async () => {
    const req = makeMockReq(clerkUnlinkedUser, emailUnlinked);
    await assert.rejects(
      async () => await getCompanyAccess(req),
      (err: any) => err.status === 403
    );
  });

  test("3. Missing employee records do not grant company_admin", async () => {
    const req = makeMockReq("clerk_no_record", "norecord@example.com");
    await assert.rejects(
      async () => await requireCompanyAdmin(req),
      (err: any) => err.status === 403
    );
  });

  test("4. Employees cannot access company-management endpoints", async () => {
    const req = makeMockReq(clerkEmployeeAUser, emailEmpA);
    const access = await getCompanyAccess(req);
    assert.equal(access.role, "employee");
    await assert.rejects(
      async () => await requireCompanyAdmin(req),
      (err: any) => err.status === 403
    );
  });

  test("5. Managers receive manager role and cannot perform company-admin actions", async () => {
    const req = makeMockReq(clerkManagerAUser, emailMgrA);
    const access = await getCompanyAccess(req);
    assert.equal(access.role, "manager");
    await assert.rejects(
      async () => await requireCompanyAdmin(req),
      (err: any) => err.status === 403
    );
  });

  test("6. Company admins can access their own company", async () => {
    const req = makeMockReq(clerkAdminAUser, emailAdminA);
    const access = await requireCompanyAdmin(req);
    assert.equal(access.role, "company_admin");
    assert.equal(access.companyId, companyAId);
  });

  test("7. Company admins cannot access another company's scope", async () => {
    const req = makeMockReq(clerkAdminAUser, emailAdminA);
    const access = await getCompanyAccess(req);
    assert.equal(access.companyId, companyAId);
    assert.notEqual(access.companyId, companyBId);
  });

  test("8. Ambiguous or missing company mapping is rejected", async () => {
    const req = makeMockReq(clerkUnlinkedUser, null);
    await assert.rejects(
      async () => await getCompanyAccess(req),
      (err: any) => err.status === 403
    );
  });

  test("9. Inactive memberships are rejected with 403", async () => {
    const req = makeMockReq(clerkInactiveUser, emailInactive);
    await assert.rejects(
      async () => await getCompanyAccess(req),
      (err: any) => err.status === 403
    );
  });

  test("10. Client-provided companyId in claims cannot change tenant scope for standard users", async () => {
    const req = makeMockReq(clerkAdminAUser, emailAdminA, { companyId: companyBId });
    const access = await getCompanyAccess(req);
    // Should be bound strictly to employee's trusted companyId (Company A)
    assert.equal(access.companyId, companyAId);
  });

  test("11. Client-provided role claim cannot elevate privileges without trusted server record", async () => {
    const req = makeMockReq(clerkEmployeeAUser, emailEmpA, { role: "admin" });
    const access = await getCompanyAccess(req);
    // Sever-side employee record is 'employee', so role must stay 'employee'
    assert.equal(access.role, "employee");
    await assert.rejects(
      async () => await requireCompanyAdmin(req),
      (err: any) => err.status === 403
    );
  });

  test("12. Platform-admin access follows explicit bootstrap/claim rule only", async () => {
    const bootstrapEmail = process.env.PLATFORM_ADMIN_BOOTSTRAP_EMAIL ?? "slennon2206@gmail.com";
    const req = makeMockReq("clerk_platform", bootstrapEmail);
    const access = await getCompanyAccess(req);
    assert.equal(access.role, "platform_admin");
  });

  test("13. Tenant scope is strictly isolated between Company A and Company B admins", async () => {
    const reqA = makeMockReq(clerkAdminAUser, emailAdminA);
    const reqB = makeMockReq(clerkAdminBUser, emailAdminB);
    const accessA = await getCompanyAccess(reqA);
    const accessB = await getCompanyAccess(reqB);
    assert.equal(accessA.companyId, companyAId);
    assert.equal(accessB.companyId, companyBId);
    assert.notEqual(accessA.companyId, accessB.companyId);
  });

  test("14. Missing access returns controlled error without leaking existence of other tenants", async () => {
    const req = makeMockReq(clerkUnlinkedUser, emailUnlinked);
    try {
      await getCompanyAccess(req);
      assert.fail("Should have thrown HttpError");
    } catch (err: any) {
      assert.equal(err.status, 403);
      assert.equal(err.message.includes("No explicit company membership"), true);
      assert.equal(err.message.includes("Company B"), false);
    }
  });

  test("15. Explicitly linked administrator succeeds on requireCompanyAdmin", async () => {
    const req = makeMockReq(clerkAdminAUser, emailAdminA);
    const access = await requireCompanyAdmin(req);
    assert.equal(access.companyId, companyAId);
    assert.equal(access.role, "company_admin");
  });
});
