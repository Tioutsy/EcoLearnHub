import { Router } from "express";
import {
  db,
  pilotCompaniesTable,
  pilotFeedbackResponsesTable,
  pilotIssuesTable,
  companiesTable,
  employeesTable,
  enrollmentsTable,
  quizAttemptsTable,
  certificatesTable,
  learnerCommitmentsTable,
} from "@workspace/db";
import { and, eq, sql } from "drizzle-orm";
import { getCompanyAccess, requireCompanyAdmin, sendHttpError } from "../lib/access";
import { logAuditEvent } from "../lib/auditLogService";

const router = Router();

const VALID_PILOT_STATUSES = new Set([
  "preparing",
  "ready_to_launch",
  "active",
  "paused",
  "completed",
  "withdrawn",
  "converted",
  "archived",
]);

// GET /api/pilots/overview — Platform Admin overview of all pilots
router.get("/overview", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Access denied to platform admin overview" });
      return;
    }

    const pilots = await db.select().from(pilotCompaniesTable);
    const issues = await db.select().from(pilotIssuesTable);
    const feedback = await db.select().from(pilotFeedbackResponsesTable);

    res.json({
      totalPilots: pilots.length,
      activePilots: pilots.filter((p) => p.pilotStatus === "active").length,
      completedPilots: pilots.filter((p) => p.pilotStatus === "completed").length,
      totalIssues: issues.length,
      unresolvedIssues: issues.filter((i) => i.status !== "resolved" && i.status !== "closed").length,
      totalFeedbackResponses: feedback.length,
      pilots,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load pilot overview" });
    }
  }
});

// GET /api/pilots/monitoring — Tenant-scoped pilot monitoring metrics
router.get("/monitoring", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const companyId = access.companyId;

    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);
    const employees = await db.select().from(employeesTable).where(eq(employeesTable.companyId, companyId));
    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, access.userId));
    const quizAttempts = await db.select().from(quizAttemptsTable).where(eq(quizAttemptsTable.userId, access.userId));
    const certificates = await db.select().from(certificatesTable).where(eq(certificatesTable.companyId, companyId));
    const commitments = await db.select().from(learnerCommitmentsTable).where(eq(learnerCommitmentsTable.companyId, companyId));
    const feedback = await db.select().from(pilotFeedbackResponsesTable).where(eq(pilotFeedbackResponsesTable.companyId, companyId));
    const issues = await db.select().from(pilotIssuesTable).where(eq(pilotIssuesTable.companyId, companyId));

    const activatedEmployees = employees.filter((e) => e.status === "active").length;
    const completedEnrollments = enrollments.filter((e) => e.status === "completed").length;
    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + (q.score ?? 0), 0) / quizAttempts.length)
      : 0;

    res.json({
      companyId,
      companyName: company?.name ?? "Elevio Pilot Company",
      totalEmployees: employees.length,
      activatedEmployees,
      enrollmentCount: enrollments.length,
      completedEnrollments,
      completionRatePct: enrollments.length > 0 ? Math.round((completedEnrollments / enrollments.length) * 100) : 0,
      certificatesIssued: certificates.length,
      actionCommitmentsSubmitted: commitments.length,
      averageQuizScorePct: avgScore,
      feedbackResponseCount: feedback.length,
      openIssueCount: issues.filter((i) => i.status !== "resolved" && i.status !== "closed").length,
    });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load pilot monitoring metrics" });
    }
  }
});

// POST /api/pilots — Create or register a company pilot
router.post("/", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can register pilot companies" });
      return;
    }

    const { companyId, approvedLearnerLimit, primaryContactName, primaryContactEmail } = req.body ?? {};
    const targetCompanyId = Number(companyId) || access.companyId;

    const [entry] = await db
      .insert(pilotCompaniesTable)
      .values({
        companyId: targetCompanyId,
        pilotStatus: "preparing",
        pilotStage: "configuration",
        approvedLearnerLimit: Number(approvedLearnerLimit) || 50,
        primaryContactName: primaryContactName ?? null,
        primaryContactEmail: primaryContactEmail ?? null,
        approvedByUserId: access.userId,
        approvedAt: new Date(),
      })
      .returning();

    await logAuditEvent({
      companyId: targetCompanyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.created",
      targetType: "pilot_company",
      targetId: entry.id,
    });

    res.status(201).json(entry);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to register pilot company" });
    }
  }
});

// PATCH /api/pilots/:id/status — Update pilot status
router.patch("/:id/status", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Only platform admins can update pilot status" });
      return;
    }

    const pilotId = Number(req.params.id);
    const { pilotStatus } = req.body ?? {};

    if (!pilotStatus || !VALID_PILOT_STATUSES.has(pilotStatus)) {
      res.status(400).json({ error: "Invalid pilotStatus" });
      return;
    }

    const [updated] = await db
      .update(pilotCompaniesTable)
      .set({ pilotStatus, updatedAt: new Date() })
      .where(eq(pilotCompaniesTable.id, pilotId))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Pilot record not found" });
      return;
    }

    await logAuditEvent({
      companyId: updated.companyId,
      actorUserId: access.userId,
      actorRole: access.role,
      action: "pilot.status_updated",
      targetType: "pilot_company",
      targetId: pilotId,
      metadata: { newStatus: pilotStatus },
    });

    res.json(updated);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to update pilot status" });
    }
  }
});

// POST /api/pilots/surveys — Submit pilot survey response
router.post("/surveys", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const { feedbackStage, overallRating, easeOfUseRating, contentRelevanceRating, reportingUsefulnessRating, freeTextFeedback, consentForFollowUp } = req.body ?? {};

    const [entry] = await db
      .insert(pilotFeedbackResponsesTable)
      .values({
        companyId: access.companyId,
        respondentUserId: access.userId,
        respondentRole: access.role === "company_admin" || access.role === "platform_admin" ? "buyer" : "learner",
        feedbackStage: feedbackStage ?? "midpoint",
        overallRating: Number(overallRating) || 5,
        easeOfUseRating: Number(easeOfUseRating) || 5,
        contentRelevanceRating: Number(contentRelevanceRating) || 5,
        reportingUsefulnessRating: reportingUsefulnessRating ? Number(reportingUsefulnessRating) : null,
        freeTextFeedback: freeTextFeedback ?? null,
        consentForFollowUp: Boolean(consentForFollowUp),
      })
      .returning();

    res.status(201).json(entry);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to submit survey response" });
    }
  }
});

// GET /api/pilots/surveys — Fetch tenant-scoped survey responses
router.get("/surveys", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const responses = await db
      .select()
      .from(pilotFeedbackResponsesTable)
      .where(eq(pilotFeedbackResponsesTable.companyId, access.companyId));

    res.json({ responses });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to fetch survey responses" });
    }
  }
});

// GET /api/pilots/company-report — Generate structured company pilot report payload
router.get("/company-report", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const companyId = access.companyId;

    const [company] = await db.select().from(companiesTable).where(eq(companiesTable.id, companyId)).limit(1);
    const employees = await db.select().from(employeesTable).where(eq(employeesTable.companyId, companyId));
    const enrollments = await db.select().from(enrollmentsTable).where(eq(enrollmentsTable.userId, access.userId));
    const quizAttempts = await db.select().from(quizAttemptsTable).where(eq(quizAttemptsTable.userId, access.userId));
    const certificates = await db.select().from(certificatesTable).where(eq(certificatesTable.companyId, companyId));
    const commitments = await db.select().from(learnerCommitmentsTable).where(eq(learnerCommitmentsTable.companyId, companyId));
    const feedback = await db.select().from(pilotFeedbackResponsesTable).where(eq(pilotFeedbackResponsesTable.companyId, companyId));

    const avgScore = quizAttempts.length > 0
      ? Math.round(quizAttempts.reduce((acc, q) => acc + (q.score ?? 0), 0) / quizAttempts.length)
      : 0;

    const reportPayload = {
      reportMetadata: {
        generatedAt: new Date().toISOString(),
        companyId,
        companyName: company?.name ?? "Elevio Pilot Company",
        companySlug: company?.slug ?? "pilot",
      },
      adoption: {
        totalEmployees: employees.length,
        activatedEmployees: employees.filter((e) => e.status === "active").length,
        enrollmentCount: enrollments.length,
        completedCount: enrollments.filter((e) => e.status === "completed").length,
        completionRatePct: enrollments.length > 0 ? Math.round((enrollments.filter((e) => e.status === "completed").length / enrollments.length) * 100) : 0,
      },
      learning: {
        averageQuizScorePct: avgScore,
        certificatesIssued: certificates.length,
      },
      workplaceApplication: {
        actionCommitmentsSubmitted: commitments.length,
        selfReportedNotice: "Workplace action commitments and manager reviews are self-reported participation indicators.",
      },
      userFeedback: {
        totalResponses: feedback.length,
        averageOverallRating: feedback.length > 0 ? (feedback.reduce((a, f) => a + f.overallRating, 0) / feedback.length).toFixed(1) : "5.0",
      },
      recommendations: [
        "Continue core sustainability pathways (ELH-01 to ELH-03).",
        "Expand departmental training for HR, Finance, and Procurement teams.",
      ],
    };

    res.json(reportPayload);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to generate company pilot report" });
    }
  }
});

export default router;
