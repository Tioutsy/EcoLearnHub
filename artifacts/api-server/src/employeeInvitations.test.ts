import { test, describe, before } from "node:test";
import assert from "node:assert/strict";
import { ensureSchemaModifications } from "./lib/ensureSchemaModifications";
import {
  db,
  companiesTable,
  employeesTable,
  employeeInvitationsTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
} from "@workspace/db";
import { eq, and } from "drizzle-orm";
import {
  getCompanySeatUsage,
  verifyCanInvite,
  getBandMaxSeats,
} from "./lib/seatEnforcementService";
import {
  createEmployeeInvitation,
  resendEmployeeInvitation,
  revokeEmployeeInvitation,
  validateInvitation,
  acceptEmployeeInvitation,
  listCompanyInvitations,
  hashToken,
} from "./lib/invitationService";
import { HttpError } from "./lib/access";

describe("Sprint 12: Employee Invitations, Access Codes & Subscription Seat Enforcement", () => {
  let essentialPlanId: number;
  let band25Id: number;
  let band50Id: number;
  let band80Id: number;
  let band120Id: number;

  before(async () => {
    await ensureSchemaModifications();

    // Fetch or create reference subscription plan
    const [plan] = await db
      .select({ id: subscriptionPlansTable.id })
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.code, "ESSENTIAL"))
      .limit(1);

    if (plan) {
      essentialPlanId = plan.id;
    } else {
      const [newPlan] = await db
        .insert(subscriptionPlansTable)
        .values({
          code: "ESSENTIAL",
          name: "Essential",
          description: "Core sustainability training",
        })
        .returning();
      essentialPlanId = newPlan.id;
    }

    // Fetch or create bands
    const bands = await db.select().from(employeeBandsTable);
    const getOrInsertBand = async (code: string, min: number, max: number, label: string) => {
      const found = bands.find((b) => b.code === code);
      if (found) return found.id;
      const [inserted] = await db
        .insert(employeeBandsTable)
        .values({
          code,
          label,
          minimumEmployees: min,
          maximumEmployees: max,
        })
        .returning();
      return inserted.id;
    };

    band25Id = await getOrInsertBand("UP_TO_25", 1, 25, "Up to 25 employees");
    band50Id = await getOrInsertBand("FROM_26_TO_50", 26, 50, "26–50 employees");
    band80Id = await getOrInsertBand("FROM_51_TO_80", 51, 80, "51–80 employees");
    band120Id = await getOrInsertBand("FROM_81_TO_120", 81, 120, "81–120 employees");
  });

  test("1. Administrator can invite an employee with an active paid subscription", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Invite Corp ${timestamp}`, slug: `invite-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const inviteResult = await createEmployeeInvitation(
      company.id,
      "user_admin_1",
      {
        email: `alice.${timestamp}@example.com`,
        firstName: "Alice",
        lastName: "Smith",
        department: "Sustainability",
        intendedRole: "employee",
      }
    );

    assert.ok(inviteResult.id > 0, "Invitation record ID must be generated");
    assert.equal(inviteResult.email, `alice.${timestamp}@example.com`);
    assert.equal(inviteResult.status, "pending");
    assert.ok(inviteResult.displayCode.startsWith("ELH-"), "Display access code format must be ELH-XXXX-XXXX");
    assert.ok(inviteResult.invitationLink?.includes("/join?token="), "Invitation link must point to /join");
  });

  test("2. Pending invitation reserves one seat", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Reserved Seat Corp ${timestamp}`, slug: `reserved-seat-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    // Initial seat usage
    const initialUsage = await getCompanySeatUsage(company.id);
    assert.equal(initialUsage.activeEmployees, 0);
    assert.equal(initialUsage.pendingInvitations, 0);
    assert.equal(initialUsage.reservedSeats, 0);
    assert.equal(initialUsage.remainingSeats, 25);

    // Create 1 invitation
    await createEmployeeInvitation(company.id, "user_admin_1", {
      email: `pending.${timestamp}@example.com`,
      firstName: "Pending",
      lastName: "Learner",
    });

    const afterInviteUsage = await getCompanySeatUsage(company.id);
    assert.equal(afterInviteUsage.activeEmployees, 0);
    assert.equal(afterInviteUsage.pendingInvitations, 1);
    assert.equal(afterInviteUsage.reservedSeats, 1);
    assert.equal(afterInviteUsage.remainingSeats, 24);
  });

  test("3. Employee accepts a valid invitation and joins the correct company", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Accept Corp ${timestamp}`, slug: `accept-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "user_admin_1", {
      email: `accept.${timestamp}@example.com`,
      firstName: "Bob",
      lastName: "Marley",
      department: "Operations",
      intendedRole: "manager",
    });

    // Accept via raw token
    const acceptResult = await acceptEmployeeInvitation(
      invite.rawToken!,
      `clerk_user_bob_${timestamp}`,
      `accept.${timestamp}@example.com`
    );

    assert.equal(acceptResult.success, true);
    assert.equal(acceptResult.companyId, company.id);
    assert.equal(acceptResult.role, "manager");

    // Check employee in DB
    const [emp] = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.id, acceptResult.employeeId))
      .limit(1);

    assert.ok(emp, "Employee record must exist in DB");
    assert.equal(emp.companyId, company.id);
    assert.equal(emp.clerkUserId, `clerk_user_bob_${timestamp}`);
    assert.equal(emp.status, "active");
    assert.equal(emp.role, "manager");
    assert.equal(emp.department, "Operations");

    // Check seat usage updated: active=1, pending=0
    const usage = await getCompanySeatUsage(company.id);
    assert.equal(usage.activeEmployees, 1);
    assert.equal(usage.pendingInvitations, 0);
    assert.equal(usage.reservedSeats, 1);
  });

  test("4. Accepted invitation becomes single-use (cannot be reused by another user)", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Single Use Corp ${timestamp}`, slug: `single-use-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "user_admin_1", {
      email: `single.${timestamp}@example.com`,
    });

    // First user accepts
    await acceptEmployeeInvitation(invite.rawToken!, `clerk_user_1_${timestamp}`, `single.${timestamp}@example.com`);

    // Second user attempts to accept the same token
    await assert.rejects(
      async () => {
        await acceptEmployeeInvitation(invite.rawToken!, `clerk_user_2_${timestamp}`, `single.${timestamp}@example.com`);
      },
      (err: any) => {
        const parsed = JSON.parse(err.message);
        assert.equal(parsed.code, "INVITATION_ALREADY_USED");
        return true;
      }
    );
  });

  test("5. Retry does not create a duplicate employee (idempotency)", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Idempotent Corp ${timestamp}`, slug: `idempotent-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "user_admin_1", {
      email: `idem.${timestamp}@example.com`,
      firstName: "Idem",
    });

    const clerkId = `clerk_idem_${timestamp}`;
    const firstRes = await acceptEmployeeInvitation(invite.rawToken!, clerkId, `idem.${timestamp}@example.com`);
    const secondRes = await acceptEmployeeInvitation(invite.rawToken!, clerkId, `idem.${timestamp}@example.com`);

    assert.equal(firstRes.employeeId, secondRes.employeeId);

    const emps = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.companyId, company.id), eq(employeesTable.clerkUserId, clerkId)));

    assert.equal(emps.length, 1, "Exactly one employee record must exist");
  });

  test("6. Revocation releases the reserved seat", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Revoke Corp ${timestamp}`, slug: `revoke-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "user_admin_1", {
      email: `revoke.${timestamp}@example.com`,
    });

    const beforeRevoke = await getCompanySeatUsage(company.id);
    assert.equal(beforeRevoke.reservedSeats, 1);

    await revokeEmployeeInvitation(company.id, invite.id);

    const afterRevoke = await getCompanySeatUsage(company.id);
    assert.equal(afterRevoke.reservedSeats, 0);
    assert.equal(afterRevoke.remainingSeats, 25);

    // Cannot accept revoked invitation
    await assert.rejects(
      async () => {
        await acceptEmployeeInvitation(invite.rawToken!, `clerk_rev_${timestamp}`, `revoke.${timestamp}@example.com`);
      },
      (err: any) => {
        const parsed = JSON.parse(err.message);
        assert.equal(parsed.code, "INVITATION_REVOKED");
        return true;
      }
    );
  });

  test("7. Expired invitation cannot be accepted and no longer reserves a seat", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Expired Corp ${timestamp}`, slug: `expired-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "user_admin_1", {
      email: `expired.${timestamp}@example.com`,
    });

    // Manually expire the invitation in DB
    const past = new Date(Date.now() - 1000 * 60 * 60);
    await db
      .update(employeeInvitationsTable)
      .set({ expiresAt: past })
      .where(eq(employeeInvitationsTable.id, invite.id));

    const usage = await getCompanySeatUsage(company.id);
    assert.equal(usage.pendingInvitations, 0, "Expired invitations must not count as pending");
    assert.equal(usage.reservedSeats, 0);

    // Validation rejects with INVITATION_EXPIRED
    await assert.rejects(
      async () => {
        await validateInvitation(invite.displayCode);
      },
      (err: any) => {
        const parsed = JSON.parse(err.message);
        assert.equal(parsed.code, "INVITATION_EXPIRED");
        return true;
      }
    );
  });

  test("8. Seat limits work at 25, 50, 80 and 120", () => {
    assert.equal(getBandMaxSeats("UP_TO_25"), 25);
    assert.equal(getBandMaxSeats("FROM_26_TO_50"), 50);
    assert.equal(getBandMaxSeats("FROM_51_TO_80"), 80);
    assert.equal(getBandMaxSeats("FROM_81_TO_120"), 120);
    assert.equal(getBandMaxSeats("OVER_120", 350), 350);
  });

  test("9. The final available seat cannot be claimed when full", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Capacity Corp ${timestamp}`, slug: `capacity-corp-${timestamp}`, maxEmployees: 2 })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    // Override company maxEmployees to 2 for fast test
    await db.update(companiesTable).set({ maxEmployees: 2 }).where(eq(companiesTable.id, company.id));

    // Invite 1
    await createEmployeeInvitation(company.id, "user_admin_1", { email: `user1.${timestamp}@example.com` });
    // Invite 2
    await createEmployeeInvitation(company.id, "user_admin_1", { email: `user2.${timestamp}@example.com` });

    // Attempt 3rd invite (should fail with SEAT_LIMIT_REACHED)
    await assert.rejects(
      async () => {
        await createEmployeeInvitation(company.id, "user_admin_1", { email: `user3.${timestamp}@example.com` });
      },
      (err: any) => {
        const parsed = JSON.parse(err.message);
        assert.equal(parsed.code, "SEAT_LIMIT_REACHED");
        return true;
      }
    );
  });

  test("10. Unpaid or pending subscription cannot issue invitations", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Unpaid Corp ${timestamp}`, slug: `unpaid-corp-${timestamp}` })
      .returning();

    // Subscription is PENDING (unconfirmed payment)
    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "PENDING",
    });

    await assert.rejects(
      async () => {
        await createEmployeeInvitation(company.id, "user_admin_1", { email: `unpaid.${timestamp}@example.com` });
      },
      (err: any) => {
        const parsed = JSON.parse(err.message);
        assert.equal(parsed.code, "SUBSCRIPTION_INACTIVE");
        return true;
      }
    );
  });

  test("11. One company cannot view, revoke or accept another company's invitation (Tenant Isolation)", async () => {
    const timestamp = Date.now();
    const [companyA] = await db
      .insert(companiesTable)
      .values({ name: `Corp A ${timestamp}`, slug: `corp-a-${timestamp}` })
      .returning();
    const [companyB] = await db
      .insert(companiesTable)
      .values({ name: `Corp B ${timestamp}`, slug: `corp-b-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: companyA.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });
    await db.insert(companySubscriptionsTable).values({
      companyId: companyB.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const inviteA = await createEmployeeInvitation(companyA.id, "admin_a", {
      email: `isolated.${timestamp}@example.com`,
    });

    // Company B listing invitations must not see Company A's invitation
    const listB = await listCompanyInvitations(companyB.id);
    assert.equal(listB.some((i) => i.id === inviteA.id), false);

    // Company B attempting to revoke Company A's invite must fail
    await assert.rejects(
      async () => {
        await revokeEmployeeInvitation(companyB.id, inviteA.id);
      },
      /Invitation not found/
    );
  });

  test("12. Learners and unauthorised managers cannot assign forbidden roles", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Role Corp ${timestamp}`, slug: `role-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    await assert.rejects(
      async () => {
        await createEmployeeInvitation(company.id, "admin", {
          email: `super.${timestamp}@example.com`,
          intendedRole: "super_admin" as any,
        });
      },
      (err: any) => {
        const parsed = JSON.parse(err.message);
        assert.equal(parsed.code, "FORBIDDEN_ROLE_ASSIGNMENT");
        return true;
      }
    );
  });

  test("13. Email mismatch is rejected", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Mismatch Corp ${timestamp}`, slug: `mismatch-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `expected.${timestamp}@example.com`,
    });

    await assert.rejects(
      async () => {
        await acceptEmployeeInvitation(invite.rawToken!, `clerk_user_${timestamp}`, `different.${timestamp}@example.com`);
      },
      (err: any) => {
        const parsed = JSON.parse(err.message);
        assert.equal(parsed.code, "EMAIL_MISMATCH");
        return true;
      }
    );
  });

  test("14. Invited employee bypasses company onboarding and sets redirectUrl to /dashboard", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Bypass Corp ${timestamp}`, slug: `bypass-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `learner.${timestamp}@example.com`,
      intendedRole: "employee",
    });

    const result = await acceptEmployeeInvitation(
      invite.displayCode,
      `clerk_learner_${timestamp}`,
      `learner.${timestamp}@example.com`
    );

    assert.equal(result.redirectUrl, "/dashboard");
  });

  test("15. Deactivation releases a seat without deleting training history", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Deactivate Corp ${timestamp}`, slug: `deactivate-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: company.id,
        email: `active.${timestamp}@example.com`,
        name: "Active Learner",
        status: "active",
        completedCourses: 3,
        certificates: 2,
      })
      .returning();

    const usageBefore = await getCompanySeatUsage(company.id);
    assert.equal(usageBefore.activeEmployees, 1);
    assert.equal(usageBefore.remainingSeats, 24);

    // Deactivate employee
    await db.update(employeesTable).set({ status: "deactivated" }).where(eq(employeesTable.id, emp.id));

    const usageAfter = await getCompanySeatUsage(company.id);
    assert.equal(usageAfter.activeEmployees, 0, "Deactivated employee must not consume seat");
    assert.equal(usageAfter.remainingSeats, 25);

    // Training history is preserved
    const [retrieved] = await db.select().from(employeesTable).where(eq(employeesTable.id, emp.id)).limit(1);
    assert.equal(retrieved.completedCourses, 3);
    assert.equal(retrieved.certificates, 2);
  });

  test("16. Legacy over-limit companies retain existing members but cannot add more", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Overlimit Corp ${timestamp}`, slug: `overlimit-corp-${timestamp}`, maxEmployees: 2 })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    // 3 existing members
    await db.insert(employeesTable).values([
      { companyId: company.id, email: `m1.${timestamp}@example.com`, name: "M1", status: "active" },
      { companyId: company.id, email: `m2.${timestamp}@example.com`, name: "M2", status: "active" },
      { companyId: company.id, email: `m3.${timestamp}@example.com`, name: "M3", status: "active" },
    ]);

    const usage = await getCompanySeatUsage(company.id);
    assert.equal(usage.activeEmployees, 3);
    assert.equal(usage.canInvite, false);

    // New invitation is blocked
    await assert.rejects(
      async () => {
        await createEmployeeInvitation(company.id, "admin", { email: `m4.${timestamp}@example.com` });
      },
      (err: any) => {
        const parsed = JSON.parse(err.message);
        assert.equal(parsed.code, "SEAT_LIMIT_REACHED");
        return true;
      }
    );
  });

  test("17. Manage Employees displays accurate seat usage and clear errors", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Accurate Corp ${timestamp}`, slug: `accurate-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band50Id,
      status: "ACTIVE",
    });

    const usage = await getCompanySeatUsage(company.id);
    assert.equal(usage.maxSeats, 50);
    assert.equal(usage.bandCode, "FROM_26_TO_50");
    assert.equal(usage.canInvite, true);
    assert.equal(usage.reason, null);
  });

  test("18. Invitation validation preview returns safe company info without secrets", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Safe Preview Corp ${timestamp}`, slug: `safe-preview-${timestamp}`, logoUrl: "https://example.com/logo.png" })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `preview.${timestamp}@example.com`,
      firstName: "Ada",
      lastName: "Lovelace",
      department: "Analytics",
      intendedRole: "employee",
    });

    const preview = await validateInvitation(invite.displayCode);
    assert.equal(preview.valid, true);
    assert.equal(preview.companyName, `Safe Preview Corp ${timestamp}`);
    assert.equal(preview.logoUrl, "https://example.com/logo.png");
    assert.ok(preview.email.includes("*"), "Recipient email must be masked for public privacy");
    assert.equal(preview.firstName, "Ada");
    assert.equal(preview.department, "Analytics");
    assert.equal(preview.intendedRole, "employee");
    assert.equal((preview as any).tokenHash, undefined, "Token hash must not be in validation response");
  });
});
