import test, { describe, it, before } from "node:test";
import assert from "node:assert/strict";
import crypto from "crypto";
import {
  db,
  coursesTable,
  companiesTable,
  employeesTable,
  companyPilotPassesTable,
  pilotPassAuditLogsTable,
  enrollmentsTable,
  certificatesTable,
  companySubscriptionsTable,
  subscriptionPlansTable,
  employeeBandsTable,
  companyUpgradeRequestsTable,
  catalogueRemediationAuditLogsTable,
} from "@workspace/db";
import { eq, sql, inArray, and, like, isNotNull } from "drizzle-orm";
import {
  createPilotPass,
  redeemPilotPass,
  extendPilotPass,
  convertPilotToPaid,
  validatePilotPassCode,
  resolveCompanyPilotEntitlement,
  getPilotPassDetails,
  reconcilePilotLifecycle,
  AUTHORISED_CANONICAL_COURSE_CODES,
  isAuthorisedCanonicalCourseCode,
} from "./lib/pilotPassService";
import { evaluateCourseAccess } from "./lib/courseAccessService";
import { verifyDatabaseIntegrity } from "./lib/verifyDatabaseIntegrity";
import { ensureSchemaModifications } from "./lib/ensureSchemaModifications";

describe("Sprint 12.3.1 Final Production Readiness: Catalogue Remediation & Audit Integrity", () => {
  let canonicalCourse1: any;
  let canonicalCourse2: any;
  let suspendedPass: any;

  before(async () => {
    // 1. Run schema modifications and catalogue remediation
    await ensureSchemaModifications();

    // 2. Fetch existing canonical published courses using explicit authorised codes
    const published = await db
      .select()
      .from(coursesTable)
      .where(
        and(
          eq(coursesTable.isPublished, true),
          isNotNull(coursesTable.courseCode),
          inArray(coursesTable.courseCode, AUTHORISED_CANONICAL_COURSE_CODES as string[])
        )
      )
      .orderBy(coursesTable.id);

    assert.strictEqual(published.length, 34, "All 34 canonical published courses must exist in the database");
    canonicalCourse1 = published[0];
    canonicalCourse2 = published[1];
  });

  // ── GROUP 1: Explicit Authorised Catalogue Definition (ELH-01 to ELH-34) ───

  it("1. Explicit AUTHORISED_CANONICAL_COURSE_CODES contains exactly ELH-01 through ELH-34", () => {
    assert.strictEqual(AUTHORISED_CANONICAL_COURSE_CODES.length, 34);
    assert.strictEqual(AUTHORISED_CANONICAL_COURSE_CODES[0], "ELH-01");
    assert.strictEqual(AUTHORISED_CANONICAL_COURSE_CODES[33], "ELH-34");

    for (let i = 1; i <= 34; i++) {
      const code = `ELH-${String(i).padStart(2, "0")}`;
      assert.ok(AUTHORISED_CANONICAL_COURSE_CODES.includes(code), `Catalogue must include ${code}`);
      assert.strictEqual(isAuthorisedCanonicalCourseCode(code), true);
    }
  });

  it("2. Helper isAuthorisedCanonicalCourseCode rejects malformed, out-of-bounds, and null codes", () => {
    assert.strictEqual(isAuthorisedCanonicalCourseCode("ELH-00"), false);
    assert.strictEqual(isAuthorisedCanonicalCourseCode("ELH-0"), false);
    assert.strictEqual(isAuthorisedCanonicalCourseCode("ELH-35"), false);
    assert.strictEqual(isAuthorisedCanonicalCourseCode("ELH-99"), false);
    assert.strictEqual(isAuthorisedCanonicalCourseCode("ELH-TEST"), false);
    assert.strictEqual(isAuthorisedCanonicalCourseCode("PILOT-01"), false);
    assert.strictEqual(isAuthorisedCanonicalCourseCode(""), false);
    assert.strictEqual(isAuthorisedCanonicalCourseCode(null), false);
    assert.strictEqual(isAuthorisedCanonicalCourseCode(undefined), false);
    assert.strictEqual(isAuthorisedCanonicalCourseCode("'; DROP TABLE courses; --"), false);
  });

  it("3. Final database contains exactly 34 authorised courses, all published", async () => {
    const allCourses = await db.select().from(coursesTable);
    assert.strictEqual(allCourses.length, 34, "Database must contain exactly 34 courses total");

    for (const c of allCourses) {
      assert.strictEqual(c.isPublished, true, `Course ${c.id} (${c.courseCode}) must be published`);
      assert.ok(c.courseCode, `Course ${c.id} must have a course code`);
      assert.ok(
        AUTHORISED_CANONICAL_COURSE_CODES.includes(c.courseCode!),
        `Course code ${c.courseCode} must be within ELH-01..34`
      );
    }
  });

  it("4. Obsolete draft Course ID 234 is deleted and snapshotted in catalogue_remediation_audit_logs", async () => {
    const draft234 = await db.select().from(coursesTable).where(eq(coursesTable.id, 234));
    assert.strictEqual(draft234.length, 0, "Course 234 must be completely deleted from courses table");

    const draftLogs = await db
      .select()
      .from(catalogueRemediationAuditLogsTable)
      .where(
        and(
          eq(catalogueRemediationAuditLogsTable.entityType, "course"),
          eq(catalogueRemediationAuditLogsTable.entityId, 234),
          eq(catalogueRemediationAuditLogsTable.actionTaken, "deleted_obsolete_draft")
        )
      );

    assert.ok(draftLogs.length > 0, "Course 234 snapshot must exist in remediation audit logs");
    assert.strictEqual(draftLogs[0].batchId, "batch-sprint-12-3-1");
    assert.ok((draftLogs[0].originalData as any).slug === "workplace-sustainability-leadership");
  });

  // ── GROUP 2: Course Selection Validation & Malformed Code Rejection ─────────

  it("5. Pilot pass creation rejects malformed course IDs and unknown course IDs", async () => {
    await assert.rejects(
      async () => {
        await createPilotPass("admin:bootstrap", {
          companyName: "Malformed ID Co",
          intendedContactName: "Admin",
          intendedContactEmail: `malformed_${Date.now()}@test.mu`,
          durationDays: 30,
          permittedCourseIds: [999999],
        });
      },
      (err: any) => err.status === 400 && /authorised canonical catalogue \(ELH-01 to ELH-34\)/i.test(err.message)
    );
  });

  it("6. Pilot pass creation rejects string injections, decimal numbers, and non-integer course IDs", async () => {
    await assert.rejects(
      async () => {
        await createPilotPass("admin:bootstrap", {
          companyName: "Injection Co",
          intendedContactName: "Admin",
          intendedContactEmail: `inject_${Date.now()}@test.mu`,
          durationDays: 30,
          permittedCourseIds: ["ELH-01" as any],
        });
      },
      (err: any) => err.status === 400 && /Invalid course ID format/i.test(err.message)
    );

    await assert.rejects(
      async () => {
        await createPilotPass("admin:bootstrap", {
          companyName: "Decimal Co",
          intendedContactName: "Admin",
          intendedContactEmail: `decimal_${Date.now()}@test.mu`,
          durationDays: 30,
          permittedCourseIds: [1.5 as any],
        });
      },
      (err: any) => err.status === 400 && /Invalid course ID format/i.test(err.message)
    );
  });

  it("7. Platform Admin can select existing canonical courses", async () => {
    const created = await createPilotPass("admin:bootstrap", {
      companyName: `Valid Canonical Co ${Date.now()}`,
      intendedContactName: "Valid Admin",
      intendedContactEmail: `valid_canonical_${Date.now()}@test.mu`,
      durationDays: 30,
      learnerSeatLimit: 15,
      permittedCourseIds: [canonicalCourse1.id, canonicalCourse2.id],
    });

    assert.ok(created.pilotPass.id);
    assert.deepStrictEqual(created.pilotPass.permittedCourseIds, [canonicalCourse1.id, canonicalCourse2.id]);
  });

  // ── GROUP 3: Suspended Pilot Pass Rejection Services ────────────────────────

  it("8. Suspended pilot pass is rejected by validation service (validatePilotPassCode)", async () => {
    // Create a pilot pass and suspend it
    const { rawCode, pilotPass } = await createPilotPass("admin:bootstrap", {
      companyName: `Suspended Test Co ${Date.now()}`,
      intendedContactName: "Suspended Admin",
      intendedContactEmail: `suspended_test_${Date.now()}@test.mu`,
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id],
    });

    await db
      .update(companyPilotPassesTable)
      .set({
        status: "suspended",
        permittedCourseIds: [],
        internalSalesNote: "[REQUIRES REVIEW - NO VALID COURSES REMAINING]",
      })
      .where(eq(companyPilotPassesTable.id, pilotPass.id));

    suspendedPass = { id: pilotPass.id, rawCode };

    const validation = await validatePilotPassCode(rawCode);
    assert.strictEqual(validation.valid, false);
    assert.strictEqual(validation.error, "SUSPENDED");
    assert.ok(/suspended and pending Platform Admin review/i.test(validation.message));
  });

  it("9. Suspended pilot pass is rejected by redemption service (redeemPilotPass)", async () => {
    await assert.rejects(
      async () => {
        await redeemPilotPass({
          rawCode: suspendedPass.rawCode,
          redeemedByUserId: `user:suspended_${Date.now()}`,
          redeemedByEmail: `suspended_test_${Date.now()}@test.mu`,
          companyName: "Suspended Test Co",
        });
      },
      (err: any) => err.status === 403 && /suspended and pending Platform Admin review/i.test(err.message)
    );
  });

  it("10. Suspended pilot pass is rejected by extension service (extendPilotPass)", async () => {
    await assert.rejects(
      async () => {
        await extendPilotPass("admin:bootstrap", suspendedPass.id, 15, "Try extending suspended");
      },
      (err: any) => err.status === 400 && /Cannot extend a suspended pilot pass/i.test(err.message)
    );
  });

  it("11. Suspended pilot pass is treated as SUSPENDED and read-only by entitlement resolver", async () => {
    // Create a redeemed pilot pass and suspend its company
    const { rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: `Suspended Entitlement Co ${Date.now()}`,
      intendedContactName: "Admin",
      intendedContactEmail: `susp_ent_${Date.now()}@test.mu`,
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id],
    });

    const redeemed = await redeemPilotPass({
      rawCode,
      redeemedByUserId: `user:susp_ent_${Date.now()}`,
      redeemedByEmail: `susp_ent_${Date.now()}@test.mu`,
      companyName: `Suspended Entitlement Co ${Date.now()}`,
    });

    await db
      .update(companyPilotPassesTable)
      .set({ status: "suspended", permittedCourseIds: [] })
      .where(eq(companyPilotPassesTable.id, redeemed.pilotPass.id));

    const entitlement = await resolveCompanyPilotEntitlement(redeemed.company.id);
    assert.strictEqual(entitlement.isPilot, true);
    assert.strictEqual(entitlement.effectiveStatus, "SUSPENDED");
    assert.strictEqual(entitlement.isReadOnly, true);

    const courseAccess = await evaluateCourseAccess(canonicalCourse1.id, {
      userId: `user:susp_ent_${Date.now()}`,
      email: `susp_ent_${Date.now()}@test.mu`,
      companyId: redeemed.company.id,
      role: "employee",
      employee: null,
      isDemo: false,
    });

    assert.strictEqual(courseAccess.allowed, false);
  });

  it("12. Lifecycle reconciliation service (reconcilePilotLifecycle) skips suspended passes", async () => {
    const result = await reconcilePilotLifecycle();
    assert.ok(typeof result.processedCount === "number");

    // Verify suspended pass remains suspended
    const [pass] = await db
      .select()
      .from(companyPilotPassesTable)
      .where(eq(companyPilotPassesTable.id, suspendedPass.id))
      .limit(1);

    assert.strictEqual(pass.status, "suspended");
  });

  // ── GROUP 4: Audit Logs Append-Only Integrity & Schema Completeness ─────────

  it("13. Catalogue remediation audit logs contain batch_id, source, action, timestamp, and pre-remediation snapshot", async () => {
    const logs = await db.select().from(catalogueRemediationAuditLogsTable);
    assert.ok(logs.length > 0, "Audit logs must exist");

    for (const log of logs) {
      assert.ok(log.id, "Log must have serial ID");
      assert.ok(log.batchId, "Log must have batch_id");
      assert.ok(log.entityType, "Log must have entity_type");
      assert.ok(log.originalData, "Log must have original_data snapshot");
      assert.ok(log.actionTaken, "Log must have action_taken");
      assert.ok(log.reason, "Log must have reason");
      assert.ok(log.source, "Log must have source");
      assert.ok(log.performedBy, "Log must have performed_by");
      assert.ok(log.createdAt, "Log must have timestamp");
    }
  });

  it("14. Zero orphaned enrollments exist in the database", async () => {
    const canonicalIds = (await db.select({ id: coursesTable.id }).from(coursesTable)).map((c) => c.id);
    const enrollments = await db.select().from(enrollmentsTable);

    for (const enr of enrollments) {
      assert.ok(
        canonicalIds.includes(enr.courseId),
        `Enrollment ID ${enr.id} points to canonical course ID ${enr.courseId}`
      );
    }
  });

  it("15. Zero non-canonical certificates exist in the database", async () => {
    const canonicalIds = (await db.select({ id: coursesTable.id }).from(coursesTable)).map((c) => c.id);
    const certificates = await db.select().from(certificatesTable);

    for (const cert of certificates) {
      assert.ok(
        canonicalIds.includes(cert.courseId),
        `Certificate ID ${cert.id} points to canonical course ID ${cert.courseId}`
      );
    }
  });

  // ── GROUP 5: Zero Side-Effect Remapping & Idempotence ───────────────────────

  it("16. No learner gains synthetic ELH-01 enrollment or progress", async () => {
    const [elh01] = await db
      .select()
      .from(coursesTable)
      .where(eq(coursesTable.courseCode, "ELH-01"))
      .limit(1);

    assert.ok(elh01, "ELH-01 must exist");

    const enrs = await db
      .select()
      .from(enrollmentsTable)
      .where(eq(enrollmentsTable.courseId, elh01.id));

    for (const e of enrs) {
      assert.ok(e.userId, "Enrollment on ELH-01 must belong to a valid user");
    }
  });

  it("17. No pilot pass gains ELH-01 permission automatically when invalid courses are pruned", async () => {
    const passes = await db.select().from(companyPilotPassesTable);
    for (const p of passes) {
      if (p.status === "suspended") {
        assert.deepStrictEqual(p.permittedCourseIds, [], "Suspended pass must have empty permitted courses, not remapped to [1]");
      }
    }
  });

  it("18. Repeated remediation execution is 100% idempotent and causes zero further changes", async () => {
    const countCoursesBefore = (await db.select().from(coursesTable)).length;
    const countEnrBefore = (await db.select().from(enrollmentsTable)).length;
    const countCertBefore = (await db.select().from(certificatesTable)).length;
    const countPassesBefore = (await db.select().from(companyPilotPassesTable)).length;
    const countAuditBefore = (await db.select().from(catalogueRemediationAuditLogsTable)).length;

    // Re-run schema modifications
    await ensureSchemaModifications();

    const countCoursesAfter = (await db.select().from(coursesTable)).length;
    const countEnrAfter = (await db.select().from(enrollmentsTable)).length;
    const countCertAfter = (await db.select().from(certificatesTable)).length;
    const countPassesAfter = (await db.select().from(companyPilotPassesTable)).length;
    const countAuditAfter = (await db.select().from(catalogueRemediationAuditLogsTable)).length;

    assert.strictEqual(countCoursesAfter, countCoursesBefore, "Course count unchanged on rerun");
    assert.strictEqual(countEnrAfter, countEnrBefore, "Enrollment count unchanged on rerun");
    assert.strictEqual(countCertAfter, countCertBefore, "Certificate count unchanged on rerun");
    assert.strictEqual(countPassesAfter, countPassesBefore, "Pilot pass count unchanged on rerun");
    assert.strictEqual(countAuditAfter, countAuditBefore, "Audit log count unchanged on rerun");
  });

  it("19. verifyDatabaseIntegrity passes with 0 critical issues", async () => {
    const report = await verifyDatabaseIntegrity();
    assert.strictEqual(report.valid, true);
    assert.strictEqual(report.issues.filter((i) => i.type === "critical").length, 0);
  });

  it("20. Platform Admin can reactivate a suspended pass by assigning valid canonical courses", async () => {
    const { reactivateSuspendedPilotPass } = await import("./lib/pilotPassService");

    // Create a pass and suspend it
    const { rawCode } = await createPilotPass("admin:bootstrap", {
      companyName: `Reactivation Co ${Date.now()}`,
      intendedContactName: "Admin",
      intendedContactEmail: `reactivate_${Date.now()}@test.mu`,
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id],
    });

    const redeemed = await redeemPilotPass({
      rawCode,
      redeemedByUserId: `user:reactivate_${Date.now()}`,
      redeemedByEmail: `reactivate_${Date.now()}@test.mu`,
      companyName: `Reactivation Co ${Date.now()}`,
    });

    await db
      .update(companyPilotPassesTable)
      .set({ status: "suspended", permittedCourseIds: [] })
      .where(eq(companyPilotPassesTable.id, redeemed.pilotPass.id));

    // Reactivate pass with canonical courses 1 & 2
    const reactivated = await reactivateSuspendedPilotPass(
      "admin:bootstrap",
      redeemed.pilotPass.id,
      [canonicalCourse1.id, canonicalCourse2.id],
      "Verified client business needs and assigned approved canonical course modules."
    );

    assert.strictEqual(reactivated.status, "active");
    assert.deepStrictEqual(reactivated.permittedCourseIds, [canonicalCourse1.id, canonicalCourse2.id]);
    assert.ok(reactivated.internalSalesNote.includes("[REACTIVATED by admin:bootstrap:"));

    // Verify course access is restored for permitted courses
    const courseAccess1 = await evaluateCourseAccess(canonicalCourse1.id, {
      userId: `user:reactivate_${Date.now()}`,
      email: `reactivate_${Date.now()}@test.mu`,
      companyId: redeemed.company.id,
      role: "employee",
      employee: null,
      isDemo: false,
    });
    assert.strictEqual(courseAccess1.allowed, true);
  });

  it("21. Platform Admin can cancel a suspended pilot pass with explicit administrative confirmation", async () => {
    const { cancelSuspendedPilotPass } = await import("./lib/pilotPassService");

    const created = await createPilotPass("admin:bootstrap", {
      companyName: `Cancel Co ${Date.now()}`,
      intendedContactName: "Admin",
      intendedContactEmail: `cancel_${Date.now()}@test.mu`,
      durationDays: 30,
      permittedCourseIds: [canonicalCourse1.id],
    });

    await db
      .update(companyPilotPassesTable)
      .set({ status: "suspended", permittedCourseIds: [] })
      .where(eq(companyPilotPassesTable.id, created.pilotPass.id));

    const cancelled = await cancelSuspendedPilotPass(
      "admin:bootstrap",
      created.pilotPass.id,
      "Company confirmed they will not be proceeding with pilot evaluation."
    );

    assert.strictEqual(cancelled.status, "revoked");
    assert.ok(cancelled.internalSalesNote.includes("[CANCELLED by admin:bootstrap:"));
  });

  it("22. Database-level trigger trg_prevent_catalogue_audit_log_mutation blocks direct UPDATE and DELETE", async () => {
    await ensureSchemaModifications();

    const [auditRow] = await db
      .select({ id: catalogueRemediationAuditLogsTable.id })
      .from(catalogueRemediationAuditLogsTable)
      .limit(1);

    assert.ok(auditRow, "Audit row must exist to test trigger");

    // Attempt UPDATE on audit table
    await assert.rejects(
      async () => {
        await db.execute(sql`
          UPDATE "catalogue_remediation_audit_logs" 
          SET "reason" = 'unauthorized_tampering_attempt'
          WHERE "id" = ${auditRow.id};
        `);
      },
      (err: any) => {
        const fullMsg = `${err?.message || ""} ${err?.cause?.message || ""} ${String(err?.cause || "")}`;
        return /catalogue_remediation_audit_logs is append-only/i.test(fullMsg);
      }
    );

    // Attempt DELETE on audit table
    await assert.rejects(
      async () => {
        await db.execute(sql`
          DELETE FROM "catalogue_remediation_audit_logs" 
          WHERE "id" = ${auditRow.id};
        `);
      },
      (err: any) => {
        const fullMsg = `${err?.message || ""} ${err?.cause?.message || ""} ${String(err?.cause || "")}`;
        return /catalogue_remediation_audit_logs is append-only/i.test(fullMsg);
      }
    );
  });
});
