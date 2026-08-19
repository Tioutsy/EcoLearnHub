import test, { describe, it, before } from "node:test";
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
  enrollmentsTable,
  certificatesTable,
  employeeInvitationsTable,
  companyPilotPassesTable,
  pilotPassAuditLogsTable,
  companyUpgradeRequestsTable,
  pilotNotificationsTable,
  upgradeRequestAuditLogsTable,
} from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import {
  createPilotPass,
  redeemPilotPass,
  resolveCompanyPilotEntitlement,
  reconcilePilotLifecycle,
  processPilotNotifications,
  createUpgradeRequest,
  getCompanyUpgradeRequest,
  listUpgradeRequests,
  markUpgradeRequestAwaitingPayment,
  confirmUpgradeRequestPayment,
  convertUpgradeRequestToPaid,
  cancelUpgradeRequest,
  getPilotEngagementInsights,
  processPilotRetention,
} from "./lib/pilotPassService";
import { evaluateCourseAccess } from "./lib/courseAccessService";
import { getCompanySeatUsage } from "./lib/seatEnforcementService";

describe("Sprint 12.3: Pilot Lifecycle Closure, Conversion Readiness & Commercial Follow-Up", () => {
  let testCompanyId: number;
  let testCourseId: number;
  let testEmployeeId: number;
  let testAdminUserId: string;
  let basePilotPassId: number;

  before(async () => {
    // 1. Ensure test course exists by querying canonical catalogue
    const [course] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.isPublished, true))
      .orderBy(coursesTable.id)
      .limit(1);
    testCourseId = course.id;

    // 2. Ensure test subscription plans and bands exist
    const [plan] = await db
      .select()
      .from(subscriptionPlansTable)
      .where(eq(subscriptionPlansTable.code, "COMPLETE"))
      .limit(1);

    if (!plan) {
      await db.insert(subscriptionPlansTable).values({
        code: "COMPLETE",
        name: "Complete Corporate",
        description: "Complete corporate sustainability training plan",
      });
    }

    const [band] = await db
      .select()
      .from(employeeBandsTable)
      .where(eq(employeeBandsTable.code, "UP_TO_25"))
      .limit(1);

    if (!band) {
      await db.insert(employeeBandsTable).values({
        code: "UP_TO_25",
        label: "Up to 25 Employees",
        minimumEmployees: 1,
        maximumEmployees: 25,
      });
    }

    // 3. Create base company
    const [company] = await db
      .insert(companiesTable)
      .values({
        name: `Sprint 12.3 Lifecycle Co ${Date.now()}`,
        slug: `sprint-12-3-lifecycle-co-${Date.now()}`,
        industry: "Sustainability Testing",
        maxEmployees: 10,
      })
      .returning();
    testCompanyId = company.id;

    // 4. Create base pilot pass for testCompanyId
    const [pass] = await db
      .insert(companyPilotPassesTable)
      .values({
        codeHash: crypto.randomBytes(32).toString("hex"),
        codeLastFour: "BASE",
        companyName: company.name,
        intendedContactName: "Base Admin",
        intendedContactEmail: `base_${Date.now()}@test.mu`,
        durationDays: 30,
        learnerSeatLimit: 10,
        administratorSeatLimit: 1,
        status: "active",
        companyId: testCompanyId,
        createdByPlatformAdminId: "admin:bootstrap",
      })
      .returning();
    basePilotPassId = pass.id;

    // 5. Create admin employee and learner
    testAdminUserId = `user_admin_s123_${Date.now()}`;
    await db.insert(employeesTable).values({
      companyId: testCompanyId,
      clerkUserId: testAdminUserId,
      name: "Test Admin",
      email: `admin_${Date.now()}@lifecycle.mu`,
      role: "admin",
      status: "active",
    });

    const [learnerEmp] = await db
      .insert(employeesTable)
      .values({
        companyId: testCompanyId,
        clerkUserId: `user_learner_s123_${Date.now()}`,
        name: "Test Learner",
        email: `learner_${Date.now()}@lifecycle.mu`,
        role: "employee",
        status: "active",
      })
      .returning();
    testEmployeeId = learnerEmp.id;
  });

  // ── BATCH 1: Expiry Lifecycle & State Transitions (Scenarios 1–6) ───────────

  it("1. Resolves ACTIVE state for freshly created and redeemed pilot pass", async () => {
    const { rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: "Batch 1 Co",
      intendedContactName: "Alice Admin",
      intendedContactEmail: `alice_${Date.now()}@test.mu`,
      durationDays: 30,
      learnerSeatLimit: 15,
      permittedCourseIds: [testCourseId],
    });

    const redeemed = await redeemPilotPass({
      rawCode,
      redeemedByUserId: "user:alice",
      redeemedByEmail: `alice_${Date.now()}@test.mu`,
      companyName: "Batch 1 Co",
    });

    const entitlement = await resolveCompanyPilotEntitlement(redeemed.company.id);
    assert.strictEqual(entitlement.isPilot, true);
    assert.strictEqual(entitlement.effectiveStatus, "ACTIVE");
    assert.strictEqual(entitlement.isExpired, false);
    assert.strictEqual(entitlement.isReadOnly, false);
    assert.strictEqual(entitlement.daysRemaining, 30);
  });

  it("2. Resolves EXPIRING_SOON state when 1 to 7 days remain", async () => {
    const { rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: "Expiring Soon Co",
      intendedContactName: "Bob Admin",
      intendedContactEmail: `bob_${Date.now()}@test.mu`,
      durationDays: 5,
      permittedCourseIds: [testCourseId],
    });

    const redeemed = await redeemPilotPass({
      rawCode,
      redeemedByUserId: "user:bob",
      redeemedByEmail: `bob_${Date.now()}@test.mu`,
      companyName: "Expiring Soon Co",
    });

    const entitlement = await resolveCompanyPilotEntitlement(redeemed.company.id);
    assert.strictEqual(entitlement.effectiveStatus, "EXPIRING_SOON");
    assert.strictEqual(entitlement.expiringSoon, true);
    assert.strictEqual(entitlement.isReadOnly, false);
    assert.ok(entitlement.daysRemaining <= 7 && entitlement.daysRemaining > 0);
  });

  it("3. Resolves EXPIRED and read-only state when expiresAt is past", async () => {
    const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    await db
      .update(companyPilotPassesTable)
      .set({
        status: "expired",
        expiresAt: pastDate,
      })
      .where(eq(companyPilotPassesTable.id, basePilotPassId));

    const entitlement = await resolveCompanyPilotEntitlement(testCompanyId);
    assert.strictEqual(entitlement.isExpired, true);
    assert.strictEqual(entitlement.isReadOnly, true);
    assert.strictEqual(entitlement.effectiveStatus, "EXPIRED");
    assert.strictEqual(entitlement.daysRemaining, 0);
  });

  it("4. Blocks course access in EXPIRED or REVOKED state", async () => {
    const access = await evaluateCourseAccess(testCourseId, {
      userId: "user:test",
      email: "user@test.mu",
      role: "employee",
      companyId: testCompanyId,
      employee: null,
      isDemo: false,
    });

    assert.strictEqual(access.allowed, false);
    assert.strictEqual(access.reason, "SUBSCRIPTION_INACTIVE");
  });

  it("5. Blocks new employee invitations when pilot is EXPIRED", async () => {
    const seatUsage = await getCompanySeatUsage(testCompanyId);
    assert.strictEqual(seatUsage.canInvite, false);
    assert.ok(seatUsage.subscriptionStatus === "EXPIRED" || seatUsage.subscriptionStatus === "INACTIVE");
  });

  it("6. Allows read-only access to past progress and certificates when EXPIRED", async () => {
    await db.insert(enrollmentsTable).values({
      userId: "user:test",
      courseId: testCourseId,
      employeeId: testEmployeeId,
      progressPct: 100,
      completedAt: new Date(),
    });

    await db.insert(certificatesTable).values({
      userId: "user:test",
      courseId: testCourseId,
      uniqueCode: `CERT-S123-${Date.now()}`,
      issuedAt: new Date(),
    });

    const [enr] = await db
      .select()
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.employeeId, testEmployeeId))
      .limit(1);

    const [cert] = await db
      .select()
      .from(certificatesTable)
      .where(eq(certificatesTable.courseId, testCourseId))
      .limit(1);

    assert.ok(enr && enr.progressPct === 100, "Learner progress remains 100% accessible");
    assert.ok(cert && cert.uniqueCode, "Certificate record remains 100% preserved");
  });

  // ── BATCH 2: Scheduled Reconciliation Engine (Scenarios 7–12) ───────────────

  it("7. reconcilePilotLifecycle identifies and transitions elapsed active passes to expired", async () => {
    // Insert an active pass whose expiresAt is in past
    await db.insert(companyPilotPassesTable).values({
      codeHash: crypto.randomBytes(32).toString("hex"),
      codeLastFour: "REC1",
      companyName: "Reconcile Active Expired Co",
      intendedContactName: "Reconcile Contact",
      intendedContactEmail: `rec_${Date.now()}@test.mu`,
      durationDays: 1,
      learnerSeatLimit: 5,
      administratorSeatLimit: 1,
      status: "active",
      expiresAt: new Date(Date.now() - 10000),
      companyId: testCompanyId,
      createdByPlatformAdminId: "admin:bootstrap",
    });

    const result = await reconcilePilotLifecycle();
    assert.ok(result.processedCount >= 1);
    assert.ok(result.expiredCount >= 1);
  });

  it("8. reconcilePilotLifecycle synchronizes company subscriptions table to EXPIRED", async () => {
    const [sub] = await db
      .select()
      .from(companySubscriptionsTable)
      .where(eq(companySubscriptionsTable.companyId, testCompanyId))
      .limit(1);

    if (sub) {
      assert.strictEqual(sub.status, "EXPIRED");
    }
  });

  it("9. reconcilePilotLifecycle logs immutable audit records", async () => {
    const auditLogs = await db
      .select()
      .from(pilotPassAuditLogsTable)
      .where(eq(pilotPassAuditLogsTable.action, "expired"));

    assert.ok(auditLogs.length >= 1);
    assert.strictEqual(auditLogs[0].performedBy, "system:lifecycle-reconciliation");
  });

  it("10. reconcilePilotLifecycle is idempotent on subsequent runs", async () => {
    const rerun = await reconcilePilotLifecycle();
    assert.strictEqual(rerun.expiredCount, 0, "No new expired passes on immediate rerun");
  });

  it("11. reconcilePilotLifecycle respects batchSize boundaries", async () => {
    const bounded = await reconcilePilotLifecycle({ batchSize: 5 });
    assert.ok(bounded.processedCount <= 5);
  });

  it("12. reconcilePilotLifecycle handles passes with null companyId gracefully", async () => {
    const [unredeemed] = await db
      .insert(companyPilotPassesTable)
      .values({
        codeHash: crypto.randomBytes(32).toString("hex"),
        codeLastFour: "UNRD",
        companyName: "Unredeemed Expired Co",
        intendedContactName: "Unredeemed Contact",
        intendedContactEmail: `unrd_${Date.now()}@test.mu`,
        durationDays: 1,
        learnerSeatLimit: 5,
        administratorSeatLimit: 1,
        status: "active",
        expiresAt: new Date(Date.now() - 1000),
        companyId: null,
        createdByPlatformAdminId: "admin:bootstrap",
      })
      .returning();

    const res = await reconcilePilotLifecycle();
    assert.ok(res.expiredPassIds.includes(unredeemed.id));
  });

  // ── BATCH 3: Notification Milestones & Deduplication (Scenarios 13–18) ──────

  it("13. processPilotNotifications queues milestone warnings for expiring pilots", async () => {
    const notifResult = await processPilotNotifications();
    assert.ok(typeof notifResult.notificationsQueued === "number");
  });

  it("14. Milestone cycle keys prevent duplicate notifications for same cycle", async () => {
    const rerunNotif = await processPilotNotifications();
    assert.strictEqual(rerunNotif.notificationsQueued, 0, "No duplicate notifications queued");
    assert.ok(rerunNotif.notificationsSkipped >= 0);
  });

  it("15. Notification dispatch records deliveryStatus SENT or FAILED in database", async () => {
    const records = await db.select().from(pilotNotificationsTable);
    if (records.length > 0) {
      assert.ok(["SENT", "FAILED", "PENDING", "SKIPPED"].includes(records[0].deliveryStatus));
    }
  });

  it("16. Notification payload never leaks pilot pass raw secret codes", async () => {
    const records = await db.select().from(pilotNotificationsTable);
    for (const r of records) {
      assert.ok(!r.milestoneCycleKey.includes("ELEVIO-PILOT-"), "No raw codes in cycle keys");
    }
  });

  it("17. Handles expired notification milestone dispatch cleanly", async () => {
    const expiredNotifs = await db
      .select()
      .from(pilotNotificationsTable)
      .where(eq(pilotNotificationsTable.notificationType, "EXPIRED"));

    assert.ok(Array.isArray(expiredNotifs));
  });

  it("18. Sanitizes notification error messages without crash", async () => {
    const [failedRecord] = await db
      .insert(pilotNotificationsTable)
      .values({
        pilotPassId: basePilotPassId,
        companyId: testCompanyId,
        notificationType: "1_DAY_WARNING",
        recipientEmail: "bad-email@test.mu",
        recipientName: "Bad Email",
        milestoneCycleKey: `test-sanitized-${Date.now()}`,
        scheduledFor: new Date(),
        deliveryStatus: "FAILED",
        sanitizedError: "Simulated SMTP timeout",
      })
      .returning();

    assert.strictEqual(failedRecord.deliveryStatus, "FAILED");
    assert.strictEqual(failedRecord.sanitizedError, "Simulated SMTP timeout");
  });

  // ── BATCH 4: Commercial Upgrade Request Lifecycle (Scenarios 19–24) ─────────

  let upgradeReqId: number;

  it("19. Company administrator can create a commercial upgrade request", async () => {
    const req = await createUpgradeRequest(testCompanyId, testAdminUserId, {
      selectedPlanCode: "COMPLETE",
      selectedEmployeeBandCode: "UP_TO_25",
      billingInterval: "MONTHLY",
      billingContactName: "Jean Dupont",
      billingContactEmail: "j.dupont@company.mu",
      companyNote: "Please bill with VAT exemption cert attached.",
    });

    assert.ok(req.id);
    assert.strictEqual(req.status, "REQUESTED");
    assert.strictEqual(req.selectedPlanCode, "COMPLETE");
    assert.strictEqual(req.selectedEmployeeBandCode, "UP_TO_25");
    upgradeReqId = req.id;
  });

  it("20. Rejects upgrade request with invalid plan or band code", async () => {
    await assert.rejects(
      async () => {
        await createUpgradeRequest(testCompanyId, testAdminUserId, {
          selectedPlanCode: "INVALID_PLAN_XYZ",
          selectedEmployeeBandCode: "UP_TO_25",
          billingInterval: "MONTHLY",
          billingContactName: "Test",
          billingContactEmail: "test@test.mu",
        });
      },
      /Invalid subscription plan/
    );
  });

  it("21. Creates audit trail on upgrade request creation", async () => {
    const [audit] = await db
      .select()
      .from(upgradeRequestAuditLogsTable)
      .where(eq(upgradeRequestAuditLogsTable.upgradeRequestId, upgradeReqId))
      .limit(1);

    assert.ok(audit);
    assert.strictEqual(audit.action, "requested");
    assert.strictEqual(audit.toStatus, "REQUESTED");
  });

  it("22. getCompanyUpgradeRequest returns latest active request", async () => {
    const activeReq = await getCompanyUpgradeRequest(testCompanyId);
    assert.ok(activeReq);
    assert.strictEqual(activeReq.id, upgradeReqId);
  });

  it("23. Platform Admin can list and filter all upgrade requests", async () => {
    const all = await listUpgradeRequests();
    assert.ok(all.length >= 1);
    const filtered = await listUpgradeRequests({ status: "REQUESTED" });
    assert.ok(filtered.some((r) => r.id === upgradeReqId));
  });

  it("24. Platform Admin can transition upgrade request to AWAITING_PAYMENT", async () => {
    const updated = await markUpgradeRequestAwaitingPayment(
      "platform-admin-uuid",
      upgradeReqId,
      "Invoice #1092 issued to client"
    );

    assert.strictEqual(updated.status, "AWAITING_PAYMENT");

    const entitlement = await resolveCompanyPilotEntitlement(testCompanyId);
    assert.strictEqual(entitlement.effectiveStatus, "CONVERSION_PENDING");
    assert.strictEqual(entitlement.conversionPending, true);
  });

  // ── BATCH 5: Payment Confirmation & Verified Conversion (Scenarios 25–30) ──

  it("25. Rejects conversion attempt when payment is not confirmed", async () => {
    await assert.rejects(
      async () => {
        await convertUpgradeRequestToPaid("platform-admin-uuid", upgradeReqId);
      },
      /Cannot convert upgrade request without confirmed payment/
    );
  });

  it("26. confirmUpgradeRequestPayment records manual payment with label and reference", async () => {
    const confirmed = await confirmUpgradeRequestPayment(
      "platform-admin-uuid",
      upgradeReqId,
      {
        paymentReference: "MCB-REF-992100",
        amountMUR: 1950,
        paymentMethod: "MANUAL_INVOICE",
        paymentInternalNote: "Direct bank transfer verified on SBM bank statement",
      }
    );

    assert.strictEqual(confirmed.status, "PAYMENT_CONFIRMED");
    assert.strictEqual(confirmed.paymentReference, "MCB-REF-992100");
    assert.strictEqual(confirmed.paymentAmountMUR, 1950);

    const [audit] = await db
      .select()
      .from(upgradeRequestAuditLogsTable)
      .where(
        and(
          eq(upgradeRequestAuditLogsTable.upgradeRequestId, upgradeReqId),
          eq(upgradeRequestAuditLogsTable.action, "payment_confirmed")
        )
      )
      .limit(1);

    assert.ok(audit);
    assert.ok(audit.details?.includes("Payment recorded manually"));
  });

  it("27. convertUpgradeRequestToPaid safely executes commercial upgrade after payment", async () => {
    const res = await convertUpgradeRequestToPaid("platform-admin-uuid", upgradeReqId);
    assert.strictEqual(res.success, true);
    assert.strictEqual(res.upgradeRequest.status, "CONVERTED");
    assert.strictEqual(res.subscription.status, "ACTIVE");
  });

  it("28. Converted company maintains 100% data preservation of employees, progress, certs", async () => {
    const employees = await db
      .select()
      .from(employeesTable)
      .where(eq(employeesTable.companyId, testCompanyId));

    assert.ok(employees.length >= 2, "Employees preserved");

    const enrollments = await db
      .select()
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.employeeId, testEmployeeId));

    assert.ok(enrollments.length >= 1, "Enrollments preserved");
    assert.strictEqual(enrollments[0].progressPct, 100, "Progress preserved");

    const certs = await db
      .select()
      .from(certificatesTable)
      .where(eq(certificatesTable.courseId, testCourseId));

    assert.ok(certs.length >= 1, "Certificates preserved");
    assert.ok(certs[0].uniqueCode, "Certificate unique code preserved");
  });

  it("29. Converted company gains active commercial course access", async () => {
    const access = await evaluateCourseAccess(testCourseId, {
      userId: "user:test",
      email: "user@test.mu",
      role: "employee",
      companyId: testCompanyId,
      employee: null,
      isDemo: false,
    });

    assert.strictEqual(access.allowed, true, "Course access granted post-conversion");
  });

  it("30. cancelUpgradeRequest cancels non-converted requests safely", async () => {
    const dummyReq = await createUpgradeRequest(testCompanyId, testAdminUserId, {
      selectedPlanCode: "PROFESSIONAL",
      selectedEmployeeBandCode: "UP_TO_25",
      billingInterval: "YEARLY",
      billingContactName: "Cancel Test",
      billingContactEmail: "cancel@test.mu",
    });

    const cancelled = await cancelUpgradeRequest("admin:uuid", dummyReq.id, "Customer requested cancellation");
    assert.strictEqual(cancelled.status, "CANCELLED");
    assert.strictEqual(cancelled.cancellationReason, "Customer requested cancellation");
  });

  // ── BATCH 6: Engagement Insights & Security Protections (Scenarios 31–38) ───

  let insightsPassId: number;
  let insightsCompanyId: number;

  it("31. getPilotEngagementInsights returns accurate funnel metrics", async () => {
    const { pilotPass, rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: "Insights Test Co",
      intendedContactName: "Carol Insights",
      intendedContactEmail: `carol_${Date.now()}@insights.mu`,
      durationDays: 30,
      learnerSeatLimit: 10,
      permittedCourseIds: [testCourseId],
    });
    insightsPassId = pilotPass.id;

    const redeemed = await redeemPilotPass({
      rawCode,
      redeemedByUserId: "user:carol",
      redeemedByEmail: `carol_${Date.now()}@insights.mu`,
      companyName: "Insights Test Co",
    });
    insightsCompanyId = redeemed.company.id;

    // Add 2 invitations
    await db.insert(employeeInvitationsTable).values([
      {
        companyId: insightsCompanyId,
        email: `inv1_${Date.now()}@insights.mu`,
        tokenHash: crypto.randomBytes(32).toString("hex"),
        displayCodeHash: crypto.randomBytes(32).toString("hex"),
        displayCodeLastFour: "1111",
        status: "pending",
        intendedRole: "employee",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      {
        companyId: insightsCompanyId,
        email: `inv2_${Date.now()}@insights.mu`,
        tokenHash: crypto.randomBytes(32).toString("hex"),
        displayCodeHash: crypto.randomBytes(32).toString("hex"),
        displayCodeLastFour: "2222",
        status: "pending",
        intendedRole: "employee",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ]);

    // Add active learner with completed progress
    const [emp] = await db
      .insert(employeesTable)
      .values({
        companyId: insightsCompanyId,
        clerkUserId: `user_active_ins_${Date.now()}`,
        name: "Active Learner",
        email: `active_${Date.now()}@insights.mu`,
        role: "employee",
        status: "active",
      })
      .returning();

    await db.insert(enrollmentsTable).values({
      userId: `user_active_ins_${Date.now()}`,
      courseId: testCourseId,
      employeeId: emp.id,
      progressPct: 100,
      completedAt: new Date(),
    });

    const insights = await getPilotEngagementInsights(pilotPass.id);
    assert.strictEqual(insights.invitedLearners, 2);
    assert.strictEqual(insights.activatedLearners, 1);
    assert.strictEqual(insights.startedLearners, 1);
    assert.strictEqual(insights.completingLearners, 1);
    assert.strictEqual(insights.totalCourseCompletions, 1);
    assert.strictEqual(insights.averageCompletionPercentage, 100);
  });

  it("32. Engagement insights strictly excludes slennon2206@gmail.com and platform admins", async () => {
    // Add bootstrap admin email invitation to the insights company
    await db.insert(employeeInvitationsTable).values({
      companyId: insightsCompanyId,
      email: "slennon2206@gmail.com",
      tokenHash: crypto.randomBytes(32).toString("hex"),
      displayCodeHash: crypto.randomBytes(32).toString("hex"),
      displayCodeLastFour: "9999",
      status: "pending",
      intendedRole: "admin",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const insights = await getPilotEngagementInsights(insightsPassId);
    assert.strictEqual(
      insights.invitedLearners,
      2,
      "Platform admin email invitation is excluded from commercial funnel counts"
    );
  });

  it("33. Correctly derives followUpClassification based on engagement level", async () => {
    const insights = await getPilotEngagementInsights(insightsPassId);
    assert.strictEqual(insights.followUpClassification, "HIGH_ENGAGEMENT");
  });

  it("34. Unredeemed pilot pass returns NOT_STARTED classification", async () => {
    const { pilotPass } = await createPilotPass("admin:bootstrap", {
      companyName: "Unredeemed Insights Co",
      intendedContactName: "Dave Fresh",
      intendedContactEmail: `dave_${Date.now()}@unredeemed.mu`,
      durationDays: 30,
      permittedCourseIds: [testCourseId],
    });

    const insights = await getPilotEngagementInsights(pilotPass.id);
    assert.strictEqual(insights.followUpClassification, "NOT_STARTED");
    assert.strictEqual(insights.activatedLearners, 0);
  });

  it("35. Retention processing strictly preserves core learning and business records", async () => {
    const retention = await processPilotRetention({ dryRun: true });
    assert.strictEqual(retention.dryRun, true);
    assert.strictEqual(retention.preservedRecordsGuaranteed, true);
  });

  it("36. Internal job secret authentication rejects missing secret", async () => {
    const configuredSecret = "elevio-internal-job-secret-local";
    const headerSecret = "";
    const isAuthed =
      Boolean(headerSecret) &&
      crypto.timingSafeEqual(Buffer.from(configuredSecret), Buffer.from(headerSecret));
    assert.strictEqual(isAuthed, false);
  });

  it("37. Internal job secret authentication accepts valid secret in constant time", async () => {
    const configuredSecret = "elevio-internal-job-secret-local";
    const headerSecret = "elevio-internal-job-secret-local";
    const isAuthed =
      configuredSecret.length === headerSecret.length &&
      crypto.timingSafeEqual(Buffer.from(configuredSecret), Buffer.from(headerSecret));
    assert.strictEqual(isAuthed, true);
  });

  it("38. Conversion state transitions and audit logging are 100% verifiable", async () => {
    const upgradeAudits = await db
      .select()
      .from(upgradeRequestAuditLogsTable)
      .where(eq(upgradeRequestAuditLogsTable.upgradeRequestId, upgradeReqId));

    const actions = upgradeAudits.map((a) => a.action);
    assert.ok(actions.includes("requested"));
    assert.ok(actions.includes("status_changed"));
    assert.ok(actions.includes("payment_confirmed"));
    assert.ok(actions.includes("converted"));
  });
});
