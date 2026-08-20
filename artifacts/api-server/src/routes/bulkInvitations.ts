import { Router } from "express";
import {
  requireCompanyAdmin,
  getCompanyAccess,
  sendHttpError,
  HttpError,
} from "../lib/access";
import {
  getBulkInvitationTemplateCsv,
  processBulkInvitations,
  getBulkBatchStatus,
  generateErrorReportCsv,
} from "../lib/bulkInvitationService";
import {
  listCompanyJobTitles,
  createJobTitle,
  updateJobTitle,
  deactivateJobTitle,
  listCompanyDepartments,
  createDepartment,
  updateDepartment,
  deactivateDepartment,
} from "../lib/companyListService";
import {
  resendEmployeeInvitation,
  revokeEmployeeInvitation,
  maskDisplayCode,
} from "../lib/invitationService";
import { processInvitationQueueChunk } from "../lib/invitationDispatchWorker";
import { db, bulkInvitationBatchesTable, employeeInvitationsTable } from "@workspace/db";
import { eq, desc, and, sql } from "drizzle-orm";
import { logAuditEvent } from "../lib/auditLogService";

const router = Router();

// GET /company/bulk-invitations/template — Download official CSV template
router.get("/bulk-invitations/template", async (_req, res): Promise<void> => {
  const templateCsv = getBulkInvitationTemplateCsv();
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", "attachment; filename=elevio-bulk-invitation-template.csv");
  res.send(templateCsv);
});

// POST /company/bulk-invitations/upload — Upload CSV, validate, enforce seat limits, create batch & queue outbox
router.post("/bulk-invitations/upload", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { csvContent, fileName } = req.body;

    if (!csvContent || typeof csvContent !== "string") {
      res.status(400).json({ error: "Missing or invalid csvContent in request body" });
      return;
    }

    const effectiveFileName = typeof fileName === "string" && fileName.trim() ? fileName.trim() : "employees_bulk_upload.csv";

    const originBaseUrl = req.headers.origin || `${req.protocol}://${req.get("host")}`;

    const batchResult = await processBulkInvitations({
      companyId: access.companyId,
      adminUserId: access.userId,
      fileName: effectiveFileName,
      csvContent,
      originBaseUrl,
    });

    // Fire asynchronous background queue processing in non-blocking manner
    setImmediate(async () => {
      try {
        await processInvitationQueueChunk({ batchSize: 50, originBaseUrl });
      } catch (err: any) {
        req.log?.warn({ err: err?.message }, "Background outbox processing triggered after upload");
      }
    });

    res.status(201).json(batchResult);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err?.message || "Failed to process bulk invitation upload" });
    }
  }
});

// GET /company/bulk-invitations/batches — List recent batches for company
router.get("/bulk-invitations/batches", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const batches = await db
      .select()
      .from(bulkInvitationBatchesTable)
      .where(eq(bulkInvitationBatchesTable.companyId, access.companyId))
      .orderBy(desc(bulkInvitationBatchesTable.createdAt))
      .limit(20);

    res.json(batches);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list bulk invitation batches" });
    }
  }
});

// GET /company/bulk-invitations/batches/:id — Get status and summary for a batch
router.get("/bulk-invitations/batches/:id", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const batchId = Number(req.params.id);
    if (!batchId || !Number.isInteger(batchId)) {
      res.status(400).json({ error: "Invalid batch id" });
      return;
    }

    const batch = await getBulkBatchStatus(access.companyId, batchId);
    if (!batch) {
      res.status(404).json({ error: "Batch not found" });
      return;
    }

    res.json(batch);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to retrieve batch status" });
    }
  }
});

// GET /company/bulk-invitations/batches/:id/invitations — Paginated list of invitations in this batch
router.get("/bulk-invitations/batches/:id/invitations", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const batchId = Number(req.params.id);
    if (!batchId || !Number.isInteger(batchId)) {
      res.status(400).json({ error: "Invalid batch id" });
      return;
    }

    const page = Math.max(1, parseInt(String(req.query.page || "1"), 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(String(req.query.limit || "50"), 10) || 50));
    const offset = (page - 1) * limit;
    const statusFilter = typeof req.query.status === "string" && req.query.status.trim() ? req.query.status.trim() : null;

    const conditions = [
      eq(employeeInvitationsTable.batchId, batchId),
      eq(employeeInvitationsTable.companyId, access.companyId),
    ];

    if (statusFilter) {
      conditions.push(eq(employeeInvitationsTable.status, statusFilter));
    }

    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(employeeInvitationsTable)
      .where(and(...conditions));

    const total = countRes?.count ?? 0;

    const rows = await db
      .select()
      .from(employeeInvitationsTable)
      .where(and(...conditions))
      .orderBy(desc(employeeInvitationsTable.createdAt))
      .limit(limit)
      .offset(offset);

    const now = new Date();
    const items = rows.map((inv) => {
      let computedStatus = inv.status;
      if (inv.status === "pending" && new Date(inv.expiresAt) < now) {
        computedStatus = "expired";
      }

      return {
        id: inv.id,
        batchId: inv.batchId,
        companyId: inv.companyId,
        email: inv.email,
        firstName: inv.firstName,
        lastName: inv.lastName,
        department: inv.department,
        intendedRole: inv.intendedRole,
        displayCode: maskDisplayCode(inv.displayCodeLastFour),
        status: computedStatus,
        expiresAt: inv.expiresAt,
        createdAt: inv.createdAt,
        acceptedAt: inv.acceptedAt,
      };
    });

    res.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list batch invitations" });
    }
  }
});

// GET /company/bulk-invitations/batches/:id/error-report — Download sanitized error report CSV
router.get("/bulk-invitations/batches/:id/error-report", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const batchId = Number(req.params.id);
    if (!batchId || !Number.isInteger(batchId)) {
      res.status(400).json({ error: "Invalid batch id" });
      return;
    }

    const batch = await getBulkBatchStatus(access.companyId, batchId);
    if (!batch) {
      res.status(404).json({ error: "Batch not found" });
      return;
    }

    const errorCsv = generateErrorReportCsv(batch.skippedReport || []);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=elevio-batch-${batchId}-skipped-report.csv`);
    res.send(errorCsv);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to generate batch error report" });
    }
  }
});

// POST /company/bulk-invitations/process-queue — Manually or scheduler triggered queue chunk dispatch
router.post("/bulk-invitations/process-queue", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const originBaseUrl = req.headers.origin || `${req.protocol}://${req.get("host")}`;
    const result = await processInvitationQueueChunk({ batchSize: 50, originBaseUrl });
    res.json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to process invitation queue" });
    }
  }
});

// ─── Company Departments ──────────────────────────────────────────────────────

// GET /company/departments — List departments (scoped to user's company)
router.get("/departments", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const includeArchived = req.query.includeArchived === "true";
    const departments = await listCompanyDepartments(access.companyId, includeArchived);
    res.json(departments);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list departments" });
    }
  }
});

// POST /company/departments — Create department (Admin only)
router.post("/departments", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { name, code, managerEmployeeId } = req.body;
    const department = await createDepartment({
      companyId: access.companyId,
      name,
      code,
      managerEmployeeId: managerEmployeeId ? Number(managerEmployeeId) : null,
      actorUserId: access.userId,
    });
    res.status(201).json(department);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to create department" });
    }
  }
});

// PATCH /company/departments/:id — Update/archive department (Admin only)
router.patch("/departments/:id", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = Number(req.params.id);
    const { name, code, managerEmployeeId, status } = req.body;
    const updated = await updateDepartment({
      companyId: access.companyId,
      id,
      name,
      code,
      managerEmployeeId: managerEmployeeId !== undefined ? (managerEmployeeId ? Number(managerEmployeeId) : null) : undefined,
      status,
      actorUserId: access.userId,
    });
    res.json(updated);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to update department" });
    }
  }
});

// ─── Company Job Titles ───────────────────────────────────────────────────────

// GET /company/job-titles — List job titles (scoped to user's company)
router.get("/job-titles", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const includeArchived = req.query.includeArchived === "true";
    const jobTitles = await listCompanyJobTitles(access.companyId, includeArchived);
    res.json(jobTitles);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list job titles" });
    }
  }
});

// POST /company/job-titles — Create job title (Admin only)
router.post("/job-titles", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const { name, code } = req.body;
    const jobTitle = await createJobTitle({
      companyId: access.companyId,
      name,
      code,
      actorUserId: access.userId,
    });
    res.status(201).json(jobTitle);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to create job title" });
    }
  }
});

// PATCH /company/job-titles/:id — Update/archive job title (Admin only)
router.patch("/job-titles/:id", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const id = Number(req.params.id);
    const { name, code, status } = req.body;
    const updated = await updateJobTitle({
      companyId: access.companyId,
      id,
      name,
      code,
      status,
      actorUserId: access.userId,
    });
    res.json(updated);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to update job title" });
    }
  }
});

// ─── Invitation Resend & Revoke ──────────────────────────────────────────────

// POST /company/invitations/:id/resend — Resend invitation (Audited)
router.post("/invitations/:id/resend", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const invitationId = Number(req.params.id);
    if (!invitationId || !Number.isInteger(invitationId)) {
      res.status(400).json({ error: "Invalid invitation id" });
      return;
    }

    const originBaseUrl = req.headers.origin || `${req.protocol}://${req.get("host")}`;
    const result = await resendEmployeeInvitation(access.companyId, invitationId, originBaseUrl);

    await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: "company_admin",
      action: "invitation.resent",
      targetType: "employee_invitation",
      targetId: invitationId,
      metadata: { email: result.email },
    });

    res.json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to resend invitation" });
    }
  }
});

// POST /company/invitations/:id/revoke — Revoke invitation & release seat (Audited)
router.post("/invitations/:id/revoke", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const invitationId = Number(req.params.id);
    if (!invitationId || !Number.isInteger(invitationId)) {
      res.status(400).json({ error: "Invalid invitation id" });
      return;
    }

    const result = await revokeEmployeeInvitation(access.companyId, invitationId);

    await logAuditEvent({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: "company_admin",
      action: "invitation.revoked",
      targetType: "employee_invitation",
      targetId: invitationId,
    });

    res.json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to revoke invitation" });
    }
  }
});

export default router;
