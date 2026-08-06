import { Router } from "express";
import { db, auditLogsTable, companiesTable, employeesTable, enrollmentsTable, courseAssignmentsTable, quizAttemptsTable, certificatesTable, learnerCommitmentsTable } from "@workspace/db";
import { and, eq } from "drizzle-orm";
import { requireCompanyAdmin, getCompanyAccess, sendHttpError } from "../lib/access";
import { logAuditEvent } from "../lib/auditLogService";

const router = Router();

// Record server-side notice acknowledgement
router.post("/acknowledgements", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const { noticeType, version, locale } = req.body ?? {};

    if (!noticeType || typeof noticeType !== "string") {
      res.status(400).json({ error: "noticeType is required" });
      return;
    }

    const validTypes = new Set(["company_pilot_notice", "learner_privacy_notice", "evidence_upload_notice"]);
    if (!validTypes.has(noticeType)) {
      res.status(400).json({ error: "Invalid noticeType" });
      return;
    }

    const versionStr = typeof version === "string" ? version : "1.0";
    const localeStr = typeof locale === "string" ? locale : "en";

    const entry = await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "notice.acknowledged",
      targetType: noticeType,
      targetId: versionStr,
      metadata: { locale: localeStr, timestamp: new Date().toISOString() },
    });

    res.json({ success: true, acknowledgement: entry });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to record notice acknowledgement" });
    }
  }
});

// Retrieve notice acknowledgements for current user
router.get("/acknowledgements", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const logs = await db
      .select()
      .from(auditLogsTable)
      .where(
        and(
          eq(auditLogsTable.companyId, access.companyId),
          eq(auditLogsTable.actorUserId, access.userId),
          eq(auditLogsTable.action, "notice.acknowledged")
        )
      );

    const acknowledgements = logs.map(l => ({
      noticeType: l.targetType,
      version: l.targetId,
      acknowledgedAt: l.createdAt,
    }));

    res.json({ acknowledgements });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to fetch notice acknowledgements" });
    }
  }
});

// Full tenant-scoped company data export for Company Admins
router.get("/export", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const companyId = access.companyId;

    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);
    if (!company) {
      res.status(404).json({ error: "Company not found" });
      return;
    }

    const employees = await db.select().from(employeesTable).where(eq(employeesTable.companyId, companyId));
    const assignments = await db.select().from(courseAssignmentsTable).where(eq(courseAssignmentsTable.companyId, companyId));
    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, access.userId));
    const quizAttempts = await db.select().from(quizAttemptsTable).where(eq(quizAttemptsTable.userId, access.userId));
    const certificates = await db.select().from(certificatesTable).where(eq(certificatesTable.companyId, companyId));
    const commitments = await db.select().from(learnerCommitmentsTable).where(eq(learnerCommitmentsTable.companyId, companyId));
    const acknowledgements = await db.select().from(auditLogsTable).where(and(eq(auditLogsTable.companyId, companyId), eq(auditLogsTable.action, "notice.acknowledged")));

    const exportPayload = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        exportedByUserId: access.userId,
        exportedByRole: access.role,
        companyId: company.id,
        companyName: company.name,
        companySlug: company.slug,
      },
      company,
      employees,
      assignments,
      enrollments,
      quizAttempts,
      certificates,
      commitments,
      acknowledgements,
    };

    res.setHeader("Content-Type", "application/json");
    res.setHeader("Content-Disposition", `attachment; filename="${company.slug}_pilot_export_${Date.now()}.json"`);
    res.json(exportPayload);

    // Audit log company export
    await logAuditEvent({
      companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "company.exported",
      targetType: "company_export",
      targetId: companyId,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to generate company export" });
    }
  }
});

export default router;
