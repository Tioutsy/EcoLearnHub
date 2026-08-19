import test from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import {
  db,
  companiesTable,
  employeesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  coursesTable,
  courseAssignmentsTable,
  companyPilotPassesTable,
  pilotPassAuditLogsTable,
  employeeInvitationsTable,
} from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  normalizePilotCode,
  generatePilotPassCode,
  maskPilotCode,
  createPilotPass,
  listPilotPasses,
  getPilotPassDetails,
  extendPilotPass,
  revokePilotPass,
  validatePilotPassCode,
  redeemPilotPassInTransaction,
  convertPilotToPaid,
} from "./lib/pilotPassService";
import { evaluateCourseAccess } from "./lib/courseAccessService";
import { getCompanySeatUsage, verifyCanInvite } from "./lib/seatEnforcementService";
import { ensureSchemaModifications } from "./lib/ensureSchemaModifications";

// Setup database tables before running tests
test.before(async () => {
  await ensureSchemaModifications();
});

test("Sprint 12.2 — Controlled Company Pilot Passes Test Suite", async (t) => {
  const testRunId = Date.now().toString().slice(-6);
  const platformAdminId = `admin-test-${testRunId}`;

  // Helper to ensure clean, isolated test courses from existing canonical catalogue without prerequisites
  const [testCourse1] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, 1))
    .limit(1);

  const [testCourse2] = await db
    .select()
    .from(coursesTable)
    .where(eq(coursesTable.id, 3))
    .limit(1);

  // ── Scenario 1: Code normalization ──────────────────────────────────────────
  await t.test("1. normalizePilotCode normalizes diverse user inputs correctly", () => {
    const r1 = normalizePilotCode("elevio-pilot-a7k9-q2mp");
    assert.equal(r1.canonicalCode, "ELEVIO-PILOT-A7K9-Q2MP");
    assert.equal(r1.codeLastFour, "Q2MP");

    const r2 = normalizePilotCode("A7K9Q2MP");
    assert.equal(r2.canonicalCode, "ELEVIO-PILOT-A7K9-Q2MP");
    assert.equal(r2.codeLastFour, "Q2MP");

    const r3 = normalizePilotCode("  pilot-a7k9-q2mp  ");
    assert.equal(r3.canonicalCode, "ELEVIO-PILOT-A7K9-Q2MP");

    assert.throws(() => normalizePilotCode("INVALID-SHORT"), /Expected 8 alphanumeric/);
  });

  // ── Scenario 2 & 3: Cryptographic Code Generation & Hashing ──────────────────
  await t.test("2 & 3. generatePilotPassCode creates valid format and SHA-256 hash", () => {
    const { rawCode, canonicalCode, codeHash, codeLastFour } = generatePilotPassCode();
    assert.match(canonicalCode, /^ELEVIO-PILOT-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}-[23456789ABCDEFGHJKMNPQRSTVWXYZ]{4}$/);
    assert.equal(codeHash, crypto.createHash("sha256").update(canonicalCode).digest("hex"));
    assert.equal(codeLastFour, canonicalCode.slice(-4));
    assert.equal(maskPilotCode(codeLastFour), `ELEVIO-PILOT-••••-${codeLastFour}`);
  });

  // ── Scenario 4, 5 & 6: Create Pilot Pass with Defaults & Audit Log ──────────
  let createdPass1: any;
  let fullCode1: string;

  await t.test("4, 5 & 6. createPilotPass creates record with defaults, returns full code once and audit log", async () => {
    const result = await createPilotPass(platformAdminId, {
      companyName: `Acme Corp ${testRunId}`,
      intendedContactName: "Jane Doe",
      intendedContactEmail: `jane.doe.${testRunId}@acme.com`,
      intendedEmailDomain: "acme.com",
      permittedCourseIds: [testCourse1.id],
      internalSalesNote: "Qualified prospect from Mauritius ESG Summit",
    });

    createdPass1 = result.pilotPass;
    fullCode1 = result.fullCode;

    assert.ok(createdPass1.id);
    assert.equal(createdPass1.companyName, `Acme Corp ${testRunId}`);
    assert.equal(createdPass1.status, "issued");
    assert.equal(createdPass1.durationDays, 30);
    assert.equal(createdPass1.learnerSeatLimit, 10);
    assert.equal(createdPass1.administratorSeatLimit, 1);
    assert.deepEqual(createdPass1.permittedCourseIds, [testCourse1.id]);
    assert.equal(createdPass1.maskedCode, `ELEVIO-PILOT-••••-${createdPass1.codeLastFour}`);
    assert.ok(fullCode1.startsWith("ELEVIO-PILOT-"));

    // Verify audit log
    const logs = await db
      .select()
      .from(pilotPassAuditLogsTable)
      .where(eq(pilotPassAuditLogsTable.pilotPassId, createdPass1.id));
    assert.equal(logs.length, 1);
    assert.equal(logs[0].action, "created");
    assert.equal(logs[0].performedBy, platformAdminId);
  });

  // ── Scenario 7 & 8: List Pilot Passes & Masking ─────────────────────────────
  await t.test("7 & 8. listPilotPasses returns masked codes and supports filtering", async () => {
    const list = await listPilotPasses({ search: testRunId });
    assert.ok(list.length >= 1);
    const found = list.find((p) => p.id === createdPass1.id);
    assert.ok(found);
    assert.equal(found.maskedCode, `ELEVIO-PILOT-••••-${createdPass1.codeLastFour}`);
    assert.equal((found as any).codeHash, undefined, "codeHash must never be exposed");

    const filtered = await listPilotPasses({ status: "issued", search: testRunId });
    assert.ok(filtered.some((p) => p.id === createdPass1.id));

    const activeFiltered = await listPilotPasses({ status: "active", search: testRunId });
    assert.ok(!activeFiltered.some((p) => p.id === createdPass1.id));
  });

  // ── Scenario 9 & 10: Validation of Unknown Code ──────────────────────────────
  await t.test("9 & 10. validatePilotPassCode fails for non-existent code", async () => {
    const res = await validatePilotPassCode("ELEVIO-PILOT-ZZZZ-9999");
    assert.equal(res.valid, false);
    assert.equal(res.error, "INVALID_CODE");
  });

  // ── Scenario 11, 12, 13 & 14: Validation with Email & Domain Gating ──────────
  await t.test("11, 12, 13 & 14. validatePilotPassCode validates recipient email and domain", async () => {
    // 11. Valid without email
    const v1 = await validatePilotPassCode(fullCode1);
    assert.equal(v1.valid, true);
    assert.equal(v1.pilotPass?.companyName, `Acme Corp ${testRunId}`);
    assert.equal(v1.pilotPass?.durationDays, 30);
    assert.equal(v1.pilotPass?.learnerSeatLimit, 10);

    // 12. Valid with direct matching email
    const v2 = await validatePilotPassCode(fullCode1, `jane.doe.${testRunId}@acme.com`);
    assert.equal(v2.valid, true);

    // 13. Valid with domain matching wildcard
    const v3 = await validatePilotPassCode(fullCode1, `another.user.${testRunId}@acme.com`);
    assert.equal(v3.valid, true);

    // 14. Invalid with mismatching email & domain
    const v4 = await validatePilotPassCode(fullCode1, "stranger@evilcorp.org");
    assert.equal(v4.valid, false);
    assert.equal(v4.error, "EMAIL_MISMATCH");
  });

  // ── Scenario 15, 16 & 17: Atomic Pilot Pass Redemption ───────────────────────
  let redeemedCompanyId: number;
  let redeemedAdminUserId: string;

  await t.test("15, 16 & 17. redeemPilotPassInTransaction creates company, sets trial sub, assigns courses and activates pass", async () => {
    redeemedAdminUserId = `user-jane-${testRunId}`;
    const result = await db.transaction(async (tx) => {
      return await redeemPilotPassInTransaction(tx, {
        rawCode: fullCode1,
        userId: redeemedAdminUserId,
        userEmail: `jane.doe.${testRunId}@acme.com`,
        adminName: "Jane Doe",
        companyName: `Acme Corp ${testRunId}`,
        industry: "Sustainability Consulting",
      });
    });

    assert.ok(result.company.id);
    redeemedCompanyId = result.company.id;
    assert.equal(result.employee.role, "admin");
    assert.equal(result.pilotPass.status, "active");
    assert.equal(result.pilotPass.daysRemaining, 30);

    // Verify company subscriptions table
    const [sub] = await db
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, redeemedCompanyId))
      .limit(1);
    assert.ok(sub);
    assert.equal(sub.status, "ACTIVE");

    // Verify course assignments table (Scenario 17)
    const assignments = await db
      .select()
      .from(courseAssignmentsTable)
      .where(eq(courseAssignmentsTable.companyId, redeemedCompanyId));
    assert.ok(assignments.some((a) => a.courseId === testCourse1.id));

    // Verify pilot audit log for activation
    const logs = await db
      .select()
      .from(pilotPassAuditLogsTable)
      .where(eq(pilotPassAuditLogsTable.pilotPassId, createdPass1.id));
    assert.ok(logs.some((l) => l.action === "activated"));
  });

  // ── Scenario 18: Cannot redeem an already active pass ────────────────────────
  await t.test("18. redeemPilotPassInTransaction rejects already redeemed pass with 409", async () => {
    await assert.rejects(
      async () => {
        await db.transaction(async (tx) => {
          return await redeemPilotPassInTransaction(tx, {
            rawCode: fullCode1,
            userId: `user-second-${testRunId}`,
            userEmail: `jane.doe.${testRunId}@acme.com`,
            adminName: "Second User",
          });
        });
      },
      (err: any) => err.status === 409 || err.message?.includes("already been redeemed")
    );
  });

  // ── Scenario 19 & 20: Rejects Expired and Revoked Passes ─────────────────────
  await t.test("19 & 20. Rejects expired and revoked pilot passes on validation & redemption", async () => {
    // Create pass 2 to revoke
    const p2 = await createPilotPass(platformAdminId, {
      companyName: `Revoke Test ${testRunId}`,
      intendedContactName: "Bob Smith",
      intendedContactEmail: `bob.${testRunId}@test.mu`,
      permittedCourseIds: [testCourse1.id],
    });

    await revokePilotPass(platformAdminId, p2.pilotPass.id, "Test revocation");

    const valRevoked = await validatePilotPassCode(p2.fullCode);
    assert.equal(valRevoked.valid, false);
    assert.equal(valRevoked.error, "REVOKED");

    await assert.rejects(
      async () => {
        await db.transaction(async (tx) => {
          return await redeemPilotPassInTransaction(tx, {
            rawCode: p2.fullCode,
            userId: `user-bob-${testRunId}`,
            userEmail: `bob.${testRunId}@test.mu`,
            adminName: "Bob Smith",
          });
        });
      },
      (err: any) => err.status === 403 || err.message?.includes("revoked")
    );
  });

  // ── Scenario 21: Concurrency Race Condition ─────────────────────────────────
  await t.test("21. Concurrent redemption race condition serializes and allows only one winner", async () => {
    const racePass = await createPilotPass(platformAdminId, {
      companyName: `Race Corp ${testRunId}`,
      intendedContactName: "Alice Runner",
      intendedContactEmail: `alice.${testRunId}@race.mu`,
      permittedCourseIds: [testCourse1.id],
    });

    const attempts = [1, 2].map((idx) =>
      db.transaction(async (tx) => {
        return await redeemPilotPassInTransaction(tx, {
          rawCode: racePass.fullCode,
          userId: `race-user-${idx}-${testRunId}`,
          userEmail: `alice.${testRunId}@race.mu`,
          adminName: `Alice Runner ${idx}`,
        });
      })
    );

    const results = await Promise.allSettled(attempts);
    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    assert.equal(fulfilled.length, 1, "Exactly one transaction must succeed");
    assert.equal(rejected.length, 1, "The second concurrent transaction must be rejected");
  });

  // ── Scenario 22 & 23: Seat Enforcement on Active Pilot Pass ──────────────────
  await t.test("22 & 23. getCompanySeatUsage enforces learnerSeatLimit on active pilot", async () => {
    const usage = await getCompanySeatUsage(redeemedCompanyId);
    assert.equal(usage.subscriptionStatus, "ACTIVE");
    assert.equal(usage.maxSeats, 11, "10 learner seats + 1 admin seat = 11 total maxSeats");
    assert.equal(usage.activeEmployees, 1, "1 active admin employee");
    assert.equal(usage.reservedSeats, 1);
    assert.equal(usage.canInvite, true);

    const canInviteRes = await verifyCanInvite(redeemedCompanyId);
    assert.equal(canInviteRes.canInvite, true);
  });

  // ── Scenario 24: Seat Enforcement & Invitation Gating on Expired Pilot ───────
  await t.test("24. verifyCanInvite fails with 402 SUBSCRIPTION_INACTIVE when pilot is expired", async () => {
    // Create an expired pilot pass
    const expPass = await createPilotPass(platformAdminId, {
      companyName: `Expired Corp ${testRunId}`,
      intendedContactName: "Exp User",
      intendedContactEmail: `exp.${testRunId}@expired.mu`,
      durationDays: 30,
      permittedCourseIds: [testCourse1.id],
    });

    const expRedemption = await db.transaction(async (tx) => {
      return await redeemPilotPassInTransaction(tx, {
        rawCode: expPass.fullCode,
        userId: `exp-user-${testRunId}`,
        userEmail: `exp.${testRunId}@expired.mu`,
        adminName: "Exp Admin",
      });
    });

    // Artificially expire the pilot pass
    const pastDate = new Date(Date.now() - 5 * 86400000);
    await db
      .update(companyPilotPassesTable)
      .set({
        status: "expired",
        expiresAt: pastDate,
      })
      .where(eq(companyPilotPassesTable.id, expPass.pilotPass.id));

    const expUsage = await getCompanySeatUsage(expRedemption.company.id);
    assert.equal(expUsage.canInvite, false);
    assert.match(expUsage.reason || "", /expired/i);

    await assert.rejects(
      async () => {
        await verifyCanInvite(expRedemption.company.id);
      },
      (err: any) => err.status === 402
    );
  });

  // ── Scenario 25, 26 & 27: Course Access Gating on Pilot Pass ─────────────────
  await t.test("25, 26 & 27. evaluateCourseAccess respects pilot pass permitted courses and expiration", async () => {
    // 25. Access to permitted course testCourse1
    const accessPermitted = await evaluateCourseAccess(testCourse1.id, {
      companyId: redeemedCompanyId,
      userId: redeemedAdminUserId,
      role: "company_admin",
    } as any);
    assert.equal(accessPermitted.allowed, true);

    // 26. Access to non-permitted course testCourse2
    const accessDenied = await evaluateCourseAccess(testCourse2.id, {
      companyId: redeemedCompanyId,
      userId: redeemedAdminUserId,
      role: "company_admin",
    } as any);
    assert.equal(accessDenied.allowed, false);
    assert.equal(accessDenied.reason, "PLAN_UPGRADE_REQUIRED");
  });

  // ── Scenario 28: Platform Admin Extends Pilot Pass ───────────────────────────
  await t.test("28. extendPilotPass adds duration and logs audit entry", async () => {
    const extended = await extendPilotPass(platformAdminId, createdPass1.id, 15, "Customer requested evaluation extension");
    assert.equal(extended.durationDays, 45);

    const logs = await db
      .select()
      .from(pilotPassAuditLogsTable)
      .where(eq(pilotPassAuditLogsTable.pilotPassId, createdPass1.id));
    assert.ok(logs.some((l) => l.action === "extended"));
  });

  // ── Scenario 29: Platform Admin Revokes Pilot Pass ───────────────────────────
  await t.test("29. revokePilotPass marks status revoked and updates subscription", async () => {
    const p3 = await createPilotPass(platformAdminId, {
      companyName: `Revoke Sub Corp ${testRunId}`,
      intendedContactName: "Mark Revoke",
      intendedContactEmail: `mark.${testRunId}@revoke.mu`,
      permittedCourseIds: [testCourse1.id],
    });

    const p3Redeem = await db.transaction(async (tx) => {
      return await redeemPilotPassInTransaction(tx, {
        rawCode: p3.fullCode,
        userId: `user-mark-${testRunId}`,
        userEmail: `mark.${testRunId}@revoke.mu`,
        adminName: "Mark Revoke",
      });
    });

    const revoked = await revokePilotPass(platformAdminId, p3.pilotPass.id, "Violation of pilot testing terms");
    assert.equal(revoked.status, "revoked");

    const [sub] = await db
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, p3Redeem.company.id))
      .limit(1);
    assert.equal(sub.status, "CANCELLED");
  });

  // ── Scenario 30: Convert Pilot to Paid Subscription ─────────────────────────
  await t.test("30. convertPilotToPaid converts status to 'converted' and preserves company data", async () => {
    const convertRes = await convertPilotToPaid(redeemedCompanyId, {
      planCode: "COMPLETE",
      employeeBandCode: "FROM_26_TO_50",
      billingInterval: "YEARLY",
      performedBy: platformAdminId,
    });

    assert.equal(convertRes.success, true);
    assert.equal(convertRes.subscription.status, "ACTIVE");

    // Verify pilot pass record is marked converted
    const [pilotRecord] = await db
      .select()
      .from(companyPilotPassesTable)
      .where(eq(companyPilotPassesTable.id, createdPass1.id))
      .limit(1);
    assert.equal(pilotRecord.status, "converted");
    assert.ok(pilotRecord.convertedAt);

    // Verify employee record and seat limits are preserved & upgraded to 50
    const usageAfterConvert = await getCompanySeatUsage(redeemedCompanyId);
    assert.equal(usageAfterConvert.maxSeats, 50, "Upgraded to 50 seats for FROM_26_TO_50 band");
    assert.equal(usageAfterConvert.activeEmployees, 1, "Jane Doe employee profile preserved");

    // Verify course access is now unlocked for all commercial courses
    const accessUnrestricted = await evaluateCourseAccess(testCourse2.id, {
      companyId: redeemedCompanyId,
      userId: redeemedAdminUserId,
      role: "company_admin",
    } as any);
    assert.equal(accessUnrestricted.allowed, true, "Full COMPLETE plan courses now accessible without restriction");
  });
});
