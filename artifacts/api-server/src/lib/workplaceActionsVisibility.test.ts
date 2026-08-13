import fs from "fs";
import path from "path";
import { test, describe, before, after } from "node:test";
import assert from "node:assert/strict";

if (!process.env.DATABASE_URL) {
  const envPath = fs.existsSync(path.resolve(process.cwd(), ".env"))
    ? path.resolve(process.cwd(), ".env")
    : path.resolve(process.cwd(), "artifacts/api-server/.env");
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, "utf8");
    const match = envFile.match(/^DATABASE_URL=["']?(.*?)["']?$/m);
    if (match) {
      process.env.DATABASE_URL = match[1].trim();
    }
  }
}

import {
  db,
  companiesTable,
  employeesTable,
  coursesTable,
  learnerCommitmentsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { getCompanyAccess } from "./access.js";
import { ensureSchemaModifications } from "./ensureSchemaModifications.js";

const PREFIX = `wp_test_${Date.now()}_`;

describe("Sprint 11D.5 — Workplace Actions Visibility, RBAC, and Isolation Suite", () => {
  let companyAId: number;
  let companyBId: number;
  let courseId: number;

  let empAId: number;
  let empBId: number;
  let adminWithEmpId: number;

  const clerkEmpA = `${PREFIX}clerk_emp_a`;
  const clerkEmpB = `${PREFIX}clerk_emp_b`;
  const clerkAdminWithEmp = `${PREFIX}clerk_admin_with_emp`;
  const clerkUnlinked = `${PREFIX}clerk_unlinked`;

  const emailEmpA = `${PREFIX}emp_a@example.com`;
  const emailEmpB = `${PREFIX}emp_b@example.com`;
  const emailAdminWithEmp = `${PREFIX}admin_with_emp@example.com`;
  const emailUnlinked = `${PREFIX}unlinked@example.com`;

  let commitmentA1Id: number;

  before(async () => {
    await ensureSchemaModifications();

    // Create Company A & B
    const [compA] = await db
      .insert(companiesTable)
      .values({ name: `${PREFIX}Company A`, slug: `${PREFIX}comp-a` })
      .returning();
    companyAId = compA.id;

    const [compB] = await db
      .insert(companiesTable)
      .values({ name: `${PREFIX}Company B`, slug: `${PREFIX}comp-b` })
      .returning();
    companyBId = compB.id;

    // Create course
    const [c] = await db
      .insert(coursesTable)
      .values({
        title: `${PREFIX}Course`,
        slug: `${PREFIX}course`,
        courseCode: `${PREFIX}code`,
        description: "Test course description",
        categoryId: 1,
        durationMinutes: 30,
      })
      .returning();
    courseId = c.id;

    // Create Employee A in Company A
    const [eA] = await db
      .insert(employeesTable)
      .values({
        companyId: companyAId,
        clerkUserId: clerkEmpA,
        email: emailEmpA,
        name: "Employee A",
        role: "employee",
        status: "active",
      })
      .returning();
    empAId = eA.id;

    // Create Employee B in Company B
    const [eB] = await db
      .insert(employeesTable)
      .values({
        companyId: companyBId,
        clerkUserId: clerkEmpB,
        email: emailEmpB,
        name: "Employee B",
        role: "employee",
        status: "active",
      })
      .returning();
    empBId = eB.id;

    // Create Admin with explicit Employee record in Company A
    const [eAdmin] = await db
      .insert(employeesTable)
      .values({
        companyId: companyAId,
        clerkUserId: clerkAdminWithEmp,
        email: emailAdminWithEmp,
        name: "Admin With Employee",
        role: "admin",
        status: "active",
      })
      .returning();
    adminWithEmpId = eAdmin.id;

    // Insert 1 commitment for Employee A
    const [commA] = await db
      .insert(learnerCommitmentsTable)
      .values({
        companyId: companyAId,
        employeeId: empAId,
        courseId,
        commitmentType: "suggested",
        commitmentText: "Test commitment for Employee A",
        actionCategory: "workplace-practice",
        status: "committed",
      })
      .returning();
    commitmentA1Id = commA.id;
  });

  after(async () => {
    // Cleanup created test records
    await db.delete(learnerCommitmentsTable).where(eq(learnerCommitmentsTable.companyId, companyAId));
    await db.delete(learnerCommitmentsTable).where(eq(learnerCommitmentsTable.companyId, companyBId));
    await db.delete(employeesTable).where(eq(employeesTable.companyId, companyAId));
    await db.delete(employeesTable).where(eq(employeesTable.companyId, companyBId));
    await db.delete(companiesTable).where(eq(companiesTable.id, companyAId));
    await db.delete(companiesTable).where(eq(companiesTable.id, companyBId));
    await db.delete(coursesTable).where(eq(coursesTable.id, courseId));
  });

  test("1. Unauthenticated request raises 401 HttpError", async () => {
    const fakeReq = { auth: {} } as any;
    await assert.rejects(async () => {
      await getCompanyAccess(fakeReq);
    }, (err: any) => err.status === 401);
  });

  test("2. Unlinked user raises 403 Forbidden without granting learner access", async () => {
    const fakeReq = { auth: { userId: clerkUnlinked, sessionClaims: { email: emailUnlinked } } } as any;
    await assert.rejects(async () => {
      await getCompanyAccess(fakeReq);
    }, (err: any) => err.status === 403);
  });

  test("3. Authenticated employee receives valid employee context and only their commitments", async () => {
    const fakeReq = { auth: { userId: clerkEmpA, sessionClaims: { email: emailEmpA } } } as any;
    const access = await getCompanyAccess(fakeReq);
    assert.equal(access.companyId, companyAId);
    assert.ok(access.employee);
    assert.equal(access.employee.id, empAId);

    const commitments = await db
      .select()
      .from(learnerCommitmentsTable)
      .where(
        and(
          eq(learnerCommitmentsTable.companyId, access.companyId),
          eq(learnerCommitmentsTable.employeeId, access.employee.id)
        )
      );

    assert.equal(commitments.length, 1);
    assert.equal(commitments[0].id, commitmentA1Id);
  });

  test("4. Employee with 0 commitments receives valid empty collection []", async () => {
    const fakeReq = { auth: { userId: clerkEmpB, sessionClaims: { email: emailEmpB } } } as any;
    const access = await getCompanyAccess(fakeReq);
    assert.equal(access.companyId, companyBId);
    assert.ok(access.employee);
    assert.equal(access.employee.id, empBId);

    const commitments = await db
      .select()
      .from(learnerCommitmentsTable)
      .where(
        and(
          eq(learnerCommitmentsTable.companyId, access.companyId),
          eq(learnerCommitmentsTable.employeeId, access.employee.id)
        )
      );

    assert.equal(commitments.length, 0);
    assert.deepEqual(commitments, []);
  });

  test("5. Company admin who has an explicit employee record resolves employee context", async () => {
    const fakeReq = { auth: { userId: clerkAdminWithEmp, sessionClaims: { email: emailAdminWithEmp } } } as any;
    const access = await getCompanyAccess(fakeReq);
    assert.equal(access.companyId, companyAId);
    assert.ok(access.employee);
    assert.equal(access.employee.id, adminWithEmpId);
    assert.equal(access.role, "company_admin");
  });

  test("6. Cross-tenant isolation: Employee A cannot access Employee B's records", async () => {
    const fakeReqA = { auth: { userId: clerkEmpA, sessionClaims: { email: emailEmpA } } } as any;
    const accessA = await getCompanyAccess(fakeReqA);

    const commitmentsB = await db
      .select()
      .from(learnerCommitmentsTable)
      .where(
        and(
          eq(learnerCommitmentsTable.companyId, accessA.companyId),
          eq(learnerCommitmentsTable.employeeId, empBId)
        )
      );

    assert.equal(commitmentsB.length, 0);
  });
});
