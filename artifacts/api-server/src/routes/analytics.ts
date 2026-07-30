import { Router } from "express";
import { getCompanyAccess, requireCompanyAdmin, sendHttpError } from "../lib/access";
import { getCompanyTrainingAnalytics } from "../lib/trainingAnalyticsService";
import {
  getManagerInterventionQueue,
  executeBulkManagerInterventions,
} from "../lib/trainingInterventionService";
import {
  createLearnerCommitment,
  completeLearnerCommitment,
  confirmLearnerCommitmentByManager,
} from "../lib/learnerCommitmentService";
import { db, learnerCommitmentsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/analytics/training-analytics — Authoritative analytics
router.get("/training-analytics", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const managerDepartment = access.employee?.department ?? undefined;
    const analytics = await getCompanyTrainingAnalytics(
      access.companyId,
      access.role as any,
      managerDepartment
    );

    res.json(analytics);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load training analytics" });
    }
  }
});

// GET /api/analytics/manager/interventions — Manager intervention queue
router.get("/manager/interventions", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const managerDepartment = access.employee?.department ?? undefined;
    const queue = await getManagerInterventionQueue(
      access.companyId,
      access.role as any,
      managerDepartment
    );

    res.json(queue);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load intervention queue" });
    }
  }
});

// POST /api/analytics/manager/interventions/bulk — Bulk manager intervention
router.post("/manager/interventions/bulk", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const { employeeIds, interventionType, newDueDate, internalNote } = req.body;
    if (!Array.isArray(employeeIds) || employeeIds.length === 0 || !interventionType) {
      res.status(400).json({ error: "employeeIds array and interventionType are required" });
      return;
    }

    const result = await executeBulkManagerInterventions({
      companyId: access.companyId,
      actorUserId: access.userId,
      actorRole: access.role as any,
      managerDepartment: access.employee?.department ?? undefined,
      employeeIds,
      interventionType,
      newDueDate: newDueDate ? new Date(newDueDate) : undefined,
      internalNote,
    });

    res.json(result);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to execute bulk manager interventions" });
    }
  }
});

// GET /api/analytics/learner/commitments — Learner commitments
router.get("/learner/commitments", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId || !access.employee) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const commitments = await db
      .select()
      .from(learnerCommitmentsTable)
      .where(
        and(
          eq(learnerCommitmentsTable.companyId, access.companyId),
          eq(learnerCommitmentsTable.employeeId, access.employee.id)
        )
      );

    res.json(commitments);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to load learner commitments" });
    }
  }
});

// POST /api/analytics/learner/commitments — Create learner commitment
router.post("/learner/commitments", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId || !access.employee) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const { courseId, commitmentText, commitmentType, targetDate } = req.body;
    if (!courseId || typeof courseId !== "number" || !commitmentText) {
      res.status(400).json({ error: "courseId and commitmentText are required" });
      return;
    }

    const created = await createLearnerCommitment({
      companyId: access.companyId,
      employeeId: access.employee.id,
      courseId,
      commitmentText,
      commitmentType,
      targetDate: targetDate ? new Date(targetDate) : undefined,
    });

    res.status(201).json(created);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to create learner commitment" });
    }
  }
});

// PATCH /api/analytics/learner/commitments/:id — Complete commitment / add reflection
router.patch("/learner/commitments/:id", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId || !access.employee) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const commitmentId = Number(req.params.id);
    const { reflection } = req.body;

    const updated = await completeLearnerCommitment(
      commitmentId,
      access.companyId,
      access.employee.id,
      reflection
    );

    res.json(updated);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to update commitment" });
    }
  }
});

// POST /api/analytics/manager/commitments/:id/confirm — Manager confirm commitment
router.post("/manager/commitments/:id/confirm", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (!access.companyId) {
      res.status(403).json({ error: "Company membership required" });
      return;
    }

    const commitmentId = Number(req.params.id);
    const managerDepartment = access.employee?.department ?? undefined;

    const confirmed = await confirmLearnerCommitmentByManager(
      commitmentId,
      access.companyId,
      access.userId,
      managerDepartment
    );

    res.json(confirmed);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to confirm commitment" });
    }
  }
});

// GET /api/analytics/export — Export CSV management analytics report
router.get("/export", async (req, res): Promise<void> => {
  try {
    const access = await requireCompanyAdmin(req);
    const analytics = await getCompanyTrainingAnalytics(access.companyId, access.role as any);

    const escapeCsv = (val: string) => {
      let str = String(val ?? "");
      if (str.startsWith("=") || str.startsWith("+") || str.startsWith("-") || str.startsWith("@")) {
        str = "'" + str;
      }
      return `"${str.replace(/"/g, '""')}"`;
    };

    let csv = "Domain,Metric,Value\n";
    csv += `${escapeCsv("Participation")},${escapeCsv("Eligible Learners")},${analytics.participation.eligibleLearners}\n`;
    csv += `${escapeCsv("Participation")},${escapeCsv("Activated Learners")},${analytics.participation.activatedLearners}\n`;
    csv += `${escapeCsv("Participation")},${escapeCsv("Activation Rate (%)")},${analytics.participation.activationRatePct}\n`;
    csv += `${escapeCsv("Progress")},${escapeCsv("Total Assigned Courses")},${analytics.progress.totalAssignments}\n`;
    csv += `${escapeCsv("Progress")},${escapeCsv("Completion Rate (%)")},${analytics.progress.completionRatePct}\n`;
    csv += `${escapeCsv("Progress")},${escapeCsv("On-Time Completion Rate (%)")},${analytics.progress.onTimeCompletionRatePct}\n`;
    csv += `${escapeCsv("Progress")},${escapeCsv("Overdue Count")},${analytics.progress.overdueCount}\n`;
    csv += `${escapeCsv("Assessment")},${escapeCsv("Quiz Pass Rate (%)")},${analytics.assessment.passRatePct}\n`;
    csv += `${escapeCsv("Assessment")},${escapeCsv("Average Quiz Score (%)")},${analytics.assessment.averageScore}\n`;
    csv += `${escapeCsv("Commitments")},${escapeCsv("Total Workplace Commitments")},${analytics.commitments.totalCommitments}\n`;
    csv += `${escapeCsv("Commitments")},${escapeCsv("Completed Self-Reported")},${analytics.commitments.completedSelfReportedCount}\n`;
    csv += `${escapeCsv("Commitments")},${escapeCsv("Completed Manager-Confirmed")},${analytics.commitments.completedManagerConfirmedCount}\n`;

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="training_analytics_company_${access.companyId}.csv"`);
    res.send(csv);
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to export analytics report" });
    }
  }
});

export default router;
