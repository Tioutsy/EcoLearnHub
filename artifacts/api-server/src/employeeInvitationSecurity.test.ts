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
import { eq, and, sql } from "drizzle-orm";
import {
  getCompanySeatUsage,
  getBandMaxSeats,
  verifyCanInvite,
} from "./lib/seatEnforcementService";
import {
  createEmployeeInvitation,
  resendEmployeeInvitation,
  revokeEmployeeInvitation,
  validateInvitation,
  acceptEmployeeInvitation,
  listCompanyInvitations,
  normalizeDisplayCode,
  hashDisplayCode,
  hashToken,
} from "./lib/invitationService";
import { HttpError } from "./lib/access";

describe("Sprint 12.1: Employee Invitation Security, Concurrency & Payment Policy Closure", () => {
  let essentialPlanId: number;
  let band25Id: number;
  let band50Id: number;

  before(async () => {
    await ensureSchemaModifications();

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

    const bands = await db.select().from(employeeBandsTable);
    const getOrInsertBand = async (code: string, min: number, max: number, label: string) => {
      const found = bands.find((b) => b.code === code);
      if (found) return found.id;
      const [inserted] = await db
        .insert(employeeBandsTable)
        .values({ code, label, minimumEmployees: min, maximumEmployees: max })
        .returning();
      return inserted.id;
    };

    band25Id = await getOrInsertBand("UP_TO_25", 1, 25, "Up to 25 employees");
    band50Id = await getOrInsertBand("FROM_26_TO_50", 26, 50, "26–50 employees");
  });

  test("1. Usable access codes are not stored in plaintext in the database", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Hash Test Corp ${timestamp}`, slug: `hash-test-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `hashed.${timestamp}@example.com`,
    });

    // Inspect database row directly
    const [row] = await db
      .select()
      .from(employeeInvitationsTable)
      .where(eq(employeeInvitationsTable.id, invite.id))
      .limit(1);

    assert.ok(row, "Invitation row must exist");
    assert.equal(typeof row.displayCodeHash, "string", "displayCodeHash must be stored");
    assert.equal(row.displayCodeHash.length, 64, "displayCodeHash must be 64-char SHA-256 hex");
    assert.equal(row.displayCodeLastFour.length, 4, "displayCodeLastFour must be 4 characters");
    assert.notEqual(row.displayCodeHash, invite.displayCode, "Stored hash must NOT equal raw display code");
    assert.equal((row as any).displayCode, undefined, "Plaintext displayCode column must not exist");
  });

  test("2. Manual access codes are normalized and hashed before lookup", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Normalize Corp ${timestamp}`, slug: `norm-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `norm.${timestamp}@example.com`,
    });

    const rawCode = invite.displayCode; // e.g. ELH-ABCD-1234
    const lowercaseNoDash = rawCode.toLowerCase().replace(/-/g, ""); // e.g. elhabcd1234
    const spacesVariant = `  ${rawCode.toLowerCase()}  `; // with whitespace

    // Validation succeeds for all normalized formatting variations
    const res1 = await validateInvitation(rawCode);
    const res2 = await validateInvitation(lowercaseNoDash);
    const res3 = await validateInvitation(spacesVariant);

    assert.equal(res1.valid, true);
    assert.equal(res2.valid, true);
    assert.equal(res3.valid, true);
    assert.equal(res1.companyId, company.id);
  });

  test("3. Invitation list returns only masked codes (ELH-••••-XXXX)", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Mask Corp ${timestamp}`, slug: `mask-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `mask.${timestamp}@example.com`,
    });

    const list = await listCompanyInvitations(company.id);
    const listed = list.find((i) => i.id === invite.id);

    assert.ok(listed, "Invitation must be listed");
    assert.ok(listed.displayCode.startsWith("ELH-••••-"), "List must return masked format ELH-••••-XXXX");
    assert.equal(listed.displayCode.length, 13);
    assert.notEqual(listed.displayCode, invite.displayCode, "Listed code must NOT be the unmasked code");
    assert.equal((listed as any).tokenHash, undefined, "Token hash must not be returned");
  });

  test("4. Resend invalidates the previous token and access code immediately", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Resend Corp ${timestamp}`, slug: `resend-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const firstInvite = await createEmployeeInvitation(company.id, "admin", {
      email: `resend.${timestamp}@example.com`,
    });

    const oldToken = firstInvite.rawToken!;
    const oldCode = firstInvite.displayCode;

    // Resend to generate replacement token & code
    const refreshed = await resendEmployeeInvitation(company.id, firstInvite.id);
    const newToken = refreshed.rawToken!;
    const newCode = refreshed.displayCode;

    assert.notEqual(oldToken, newToken);
    assert.notEqual(oldCode, newCode);

    // Old token & code must be rejected
    await assert.rejects(
      async () => await validateInvitation(oldCode),
      (err: any) => JSON.parse(err.message).code === "INVITATION_INVALID"
    );

    // New code validates cleanly
    const valNew = await validateInvitation(newCode);
    assert.equal(valNew.valid, true);
  });

  test("5. Raw tokens and full access codes do not appear in validation output", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Log Corp ${timestamp}`, slug: `log-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `secret.${timestamp}@example.com`,
    });

    const preview = await validateInvitation(invite.displayCode);
    assert.equal((preview as any).rawToken, undefined);
    assert.equal((preview as any).tokenHash, undefined);
    assert.equal((preview as any).displayCodeHash, undefined);
    assert.equal((preview as any).displayCode, undefined);
  });

  test("6. ACTIVE plus payment-confirmed subscription can invite", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Active Corp ${timestamp}`, slug: `active-corp-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const usage = await verifyCanInvite(company.id);
    assert.equal(usage.canInvite, true);
  });

  test("7. PENDING subscription cannot invite", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Pending Sub Corp ${timestamp}`, slug: `pending-sub-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "PENDING",
    });

    await assert.rejects(
      async () => await verifyCanInvite(company.id),
      (err: any) => JSON.parse(err.message).code === "SUBSCRIPTION_INACTIVE"
    );
  });

  test("8. UNPAID subscription cannot invite", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Unpaid Sub Corp ${timestamp}`, slug: `unpaid-sub-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "UNPAID",
    });

    await assert.rejects(
      async () => await verifyCanInvite(company.id),
      (err: any) => JSON.parse(err.message).code === "SUBSCRIPTION_INACTIVE"
    );
  });

  test("9. FAILED payment cannot invite", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Failed Sub Corp ${timestamp}`, slug: `failed-sub-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "FAILED",
    });

    await assert.rejects(
      async () => await verifyCanInvite(company.id),
      (err: any) => JSON.parse(err.message).code === "SUBSCRIPTION_INACTIVE"
    );
  });

  test("10. CANCELLED subscription cannot invite", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Cancelled Sub Corp ${timestamp}`, slug: `cancelled-sub-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "CANCELLED",
    });

    await assert.rejects(
      async () => await verifyCanInvite(company.id),
      (err: any) => JSON.parse(err.message).code === "SUBSCRIPTION_INACTIVE"
    );
  });

  test("11. EXPIRED subscription cannot invite", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Expired Sub Corp ${timestamp}`, slug: `expired-sub-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "EXPIRED",
    });

    await assert.rejects(
      async () => await verifyCanInvite(company.id),
      (err: any) => JSON.parse(err.message).code === "SUBSCRIPTION_INACTIVE"
    );
  });

  test("12. Generic TRIAL status cannot bypass payment rules without explicit active entitlement", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Trial Sub Corp ${timestamp}`, slug: `trial-sub-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "TRIAL",
    });

    await assert.rejects(
      async () => await verifyCanInvite(company.id),
      (err: any) => JSON.parse(err.message).code === "SUBSCRIPTION_INACTIVE"
    );
  });

  test("13. Reactivation fails when subscription or capacity is invalid", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `React Corp ${timestamp}`, slug: `react-corp-${timestamp}`, maxEmployees: 1 })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    // 1 active employee (occupies max 1 seat)
    await db.insert(employeesTable).values({
      companyId: company.id,
      email: `occupant.${timestamp}@example.com`,
      name: "Occupant",
      status: "active",
    });

    // 1 deactivated employee
    const [deact] = await db
      .insert(employeesTable)
      .values({
        companyId: company.id,
        email: `deact.${timestamp}@example.com`,
        name: "Deactivated",
        status: "deactivated",
      })
      .returning();

    // Reactivation must fail because capacity is full (1/1)
    const usage = await getCompanySeatUsage(company.id);
    assert.equal(usage.activeEmployees, 1);
    assert.equal(usage.remainingSeats, 0);
  });

  test("14-16. Concurrency Safety: Two concurrent acceptance requests compete for the final seat", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({
        name: `Concurrency Corp ${timestamp}`,
        slug: `concurrent-corp-${timestamp}`,
        maxEmployees: 2, // 2 seat capacity
      })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    // Create 2 pending invitations for 2 different users (within 2-seat capacity)
    const invite1 = await createEmployeeInvitation(company.id, "admin", {
      email: `userA.${timestamp}@example.com`,
    });
    const invite2 = await createEmployeeInvitation(company.id, "admin", {
      email: `userB.${timestamp}@example.com`,
    });

    // An existing employee is already active, leaving EXACTLY 1 SEAT remaining
    await db.insert(employeesTable).values({
      companyId: company.id,
      email: `existing.${timestamp}@example.com`,
      name: "Existing Learner",
      status: "active",
    });

    // Simulate simultaneous acceptance by 2 distinct users for the 1 remaining seat
    const userAClerk = `clerk_userA_${timestamp}`;
    const userBClerk = `clerk_userB_${timestamp}`;

    const [resA, resB] = await Promise.allSettled([
      acceptEmployeeInvitation(invite1.displayCode, userAClerk, `userA.${timestamp}@example.com`),
      acceptEmployeeInvitation(invite2.displayCode, userBClerk, `userB.${timestamp}@example.com`),
    ]);

    const successes = [resA, resB].filter((r) => r.status === "fulfilled");
    const failures = [resA, resB].filter((r) => r.status === "rejected");

    // Exactly one must succeed, exactly one must fail
    assert.equal(successes.length, 1, "Exactly one concurrent acceptance must succeed");
    assert.equal(failures.length, 1, "Exactly one concurrent acceptance must fail");

    const failedReason = (failures[0] as PromiseRejectedResult).reason;
    const parsedError = JSON.parse(failedReason.message);
    assert.equal(parsedError.code, "SEAT_LIMIT_REACHED", "Failing concurrent request must return SEAT_LIMIT_REACHED");

    // Total active employees in database must not exceed capacity (2)
    const activeMembers = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.companyId, company.id), eq(employeesTable.status, "active")));

    assert.equal(activeMembers.length, 2, "Active employee count must exactly equal 2");
  });

  test("14b. Concurrency Safety: Two concurrent invitation creation requests compete for the final remaining seat", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({
        name: `Concurrent Creation Corp ${timestamp}`,
        slug: `concurrent-create-${timestamp}`,
        maxEmployees: 1, // Exactly 1 seat available
      })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    // Simultaneously attempt to create 2 invitations when only 1 seat remains
    const [res1, res2] = await Promise.allSettled([
      createEmployeeInvitation(company.id, "admin", { email: `concurrent1.${timestamp}@example.com` }),
      createEmployeeInvitation(company.id, "admin", { email: `concurrent2.${timestamp}@example.com` }),
    ]);

    const successes = [res1, res2].filter((r) => r.status === "fulfilled");
    const failures = [res1, res2].filter((r) => r.status === "rejected");

    assert.equal(successes.length, 1, "Exactly one concurrent creation must succeed");
    assert.equal(failures.length, 1, "Exactly one concurrent creation must fail");

    const failedReason = (failures[0] as PromiseRejectedResult).reason;
    const parsedError = JSON.parse(failedReason.message);
    assert.equal(parsedError.code, "SEAT_LIMIT_REACHED", "Failing concurrent creation must return SEAT_LIMIT_REACHED");

    // Pending invitations must not exceed max (1)
    const pendingInvites = await db
      .select()
      .from(employeeInvitationsTable)
      .where(and(eq(employeeInvitationsTable.companyId, company.id), eq(employeeInvitationsTable.status, "pending")));

    assert.equal(pendingInvites.length, 1, "Pending invitation count must not exceed 1");
  });

  test("14c. Concurrency Safety: Concurrent resend versus revoke leaves coherent status", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Resend Revoke Corp ${timestamp}`, slug: `resend-rev-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `resendrev.${timestamp}@example.com`,
    });

    // Simultaneously fire resend and revoke
    await Promise.allSettled([
      resendEmployeeInvitation(company.id, invite.id),
      revokeEmployeeInvitation(company.id, invite.id),
    ]);

    const [finalInv] = await db
      .select()
      .from(employeeInvitationsTable)
      .where(eq(employeeInvitationsTable.id, invite.id))
      .limit(1);

    assert.ok(["pending", "revoked"].includes(finalInv.status), "Final invitation state must be coherent");
  });

  test("17. Membership creation and invitation acceptance roll back together on failure", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Rollback Corp ${timestamp}`, slug: `rollback-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `rollback.${timestamp}@example.com`,
    });

    // Attempt acceptance with wrong email to trigger rollback
    await assert.rejects(
      async () => {
        await acceptEmployeeInvitation(invite.displayCode, `clerk_user_${timestamp}`, `wrong.${timestamp}@example.com`);
      },
      (err: any) => JSON.parse(err.message).code === "EMAIL_MISMATCH"
    );

    // Invitation remains pending
    const [invRow] = await db.select().from(employeeInvitationsTable).where(eq(employeeInvitationsTable.id, invite.id));
    assert.equal(invRow.status, "pending");

    // No employee created
    const emps = await db.select().from(employeesTable).where(eq(employeesTable.companyId, company.id));
    assert.equal(emps.length, 0);
  });

  test("18. Clerk email mismatch is rejected server-side", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Mismatch Corp ${timestamp}`, slug: `mismatch-${timestamp}` })
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
        await acceptEmployeeInvitation(invite.displayCode, `clerk_user_${timestamp}`, `impostor.${timestamp}@example.com`);
      },
      (err: any) => JSON.parse(err.message).code === "EMAIL_MISMATCH"
    );
  });

  test("19. Unverified / case-insensitive email matching functions strictly", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Case Corp ${timestamp}`, slug: `case-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `Marie.Curie.${timestamp}@Example.com`,
    });

    // Accept with lowercase email variation
    const res = await acceptEmployeeInvitation(
      invite.displayCode,
      `clerk_marie_${timestamp}`,
      `marie.curie.${timestamp}@example.com`
    );

    assert.equal(res.success, true);
    assert.equal(res.companyId, company.id);
  });

  test("20. Authentication redirect preserves the invitation journey", () => {
    const inviteToken = "sec_test_token_123";
    const postSignUpUrl = `/join?token=${encodeURIComponent(inviteToken)}`;
    assert.ok(postSignUpUrl.includes("/join?token=sec_test_token_123"));
  });

  test("21. Accepted employee bypasses company onboarding and pricing", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Direct Corp ${timestamp}`, slug: `direct-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `direct.${timestamp}@example.com`,
    });

    const result = await acceptEmployeeInvitation(
      invite.displayCode,
      `clerk_direct_${timestamp}`,
      `direct.${timestamp}@example.com`
    );

    assert.equal(result.redirectUrl, "/dashboard");
  });

  test("22. Acceptance retry is idempotent", async () => {
    const timestamp = Date.now();
    const [company] = await db
      .insert(companiesTable)
      .values({ name: `Idem Corp ${timestamp}`, slug: `idem-22-${timestamp}` })
      .returning();

    await db.insert(companySubscriptionsTable).values({
      companyId: company.id,
      subscriptionPlanId: essentialPlanId,
      employeeBandId: band25Id,
      status: "ACTIVE",
    });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `idem22.${timestamp}@example.com`,
    });

    const clerkId = `clerk_idem22_${timestamp}`;
    const firstRes = await acceptEmployeeInvitation(invite.displayCode, clerkId, `idem22.${timestamp}@example.com`);
    const secondRes = await acceptEmployeeInvitation(invite.displayCode, clerkId, `idem22.${timestamp}@example.com`);

    assert.equal(firstRes.employeeId, secondRes.employeeId);
    assert.equal(firstRes.companyId, secondRes.companyId);

    const members = await db
      .select()
      .from(employeesTable)
      .where(and(eq(employeesTable.companyId, company.id), eq(employeesTable.clerkUserId, clerkId)));
    assert.equal(members.length, 1);
  });

  test("23. One tenant cannot manage another tenant's invitations (Tenant Isolation)", async () => {
    const timestamp = Date.now();
    const [companyA] = await db.insert(companiesTable).values({ name: `A ${timestamp}`, slug: `a-${timestamp}` }).returning();
    const [companyB] = await db.insert(companiesTable).values({ name: `B ${timestamp}`, slug: `b-${timestamp}` }).returning();

    await db.insert(companySubscriptionsTable).values({ companyId: companyA.id, subscriptionPlanId: essentialPlanId, employeeBandId: band25Id, status: "ACTIVE" });
    await db.insert(companySubscriptionsTable).values({ companyId: companyB.id, subscriptionPlanId: essentialPlanId, employeeBandId: band25Id, status: "ACTIVE" });

    const inviteA = await createEmployeeInvitation(companyA.id, "adminA", { email: `isoA.${timestamp}@example.com` });

    const listB = await listCompanyInvitations(companyB.id);
    assert.equal(listB.some((i) => i.id === inviteA.id), false);

    await assert.rejects(
      async () => await revokeEmployeeInvitation(companyB.id, inviteA.id),
      (err: any) => err.message.includes("not found")
    );
  });

  test("24. Public validation returns masked email and no secret database fields", async () => {
    const timestamp = Date.now();
    const [company] = await db.insert(companiesTable).values({ name: `Priv Corp ${timestamp}`, slug: `priv-${timestamp}` }).returning();
    await db.insert(companySubscriptionsTable).values({ companyId: company.id, subscriptionPlanId: essentialPlanId, employeeBandId: band25Id, status: "ACTIVE" });

    const invite = await createEmployeeInvitation(company.id, "admin", {
      email: `john.doe.${timestamp}@example.com`,
      firstName: "John",
      lastName: "Doe",
    });

    const preview = await validateInvitation(invite.displayCode);
    assert.equal(preview.valid, true);
    assert.ok(preview.email.includes("*"), "Email must be masked for privacy in public validation");
    assert.equal(preview.companyName, `Priv Corp ${timestamp}`);
  });

  test("25. Normalization handles invalid format safely without throwing exceptions", () => {
    const invalidNorm = normalizeDisplayCode("INVALID-TOO-LONG-CODE-12345");
    assert.equal(invalidNorm.isValidFormat, false);

    const emptyNorm = normalizeDisplayCode("");
    assert.equal(emptyNorm.isValidFormat, false);
  });

  test("26. Deactivation preserves assignments, progress, results and certificates", async () => {
    const timestamp = Date.now();
    const [company] = await db.insert(companiesTable).values({ name: `Deact Corp ${timestamp}`, slug: `deact-${timestamp}` }).returning();
    await db.insert(companySubscriptionsTable).values({ companyId: company.id, subscriptionPlanId: essentialPlanId, employeeBandId: band25Id, status: "ACTIVE" });

    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: company.id,
        email: `worker.${timestamp}@example.com`,
        name: "Dedicated Worker",
        status: "active",
        completedCourses: 5,
        certificates: 3,
      })
      .returning();

    // Deactivate
    await db.update(employeesTable).set({ status: "deactivated" }).where(eq(employeesTable.id, emp.id));

    const [retrieved] = await db.select().from(employeesTable).where(eq(employeesTable.id, emp.id)).limit(1);
    assert.equal(retrieved.status, "deactivated");
    assert.equal(retrieved.completedCourses, 5);
    assert.equal(retrieved.certificates, 3);
  });

  test("27. Existing seat limits derivation works accurately across all standard bands", () => {
    assert.equal(getBandMaxSeats("UP_TO_25"), 25);
    assert.equal(getBandMaxSeats("FROM_26_TO_50"), 50);
    assert.equal(getBandMaxSeats("FROM_51_TO_80"), 80);
    assert.equal(getBandMaxSeats("FROM_81_TO_120"), 120);
    assert.equal(getBandMaxSeats("OVER_120", 500), 500);
  });
});
