import { Router } from "express";
import { getCompanyAccess, sendHttpError } from "../lib/access";
import {
  createPilotCompany,
  approvePilotCompany,
  submitPilotFeedback,
  logPilotIssue,
} from "../lib/pilotOperationsService";
import { generatePilotOutcomeReport } from "../lib/pilotOutcomeReportService";
import { db, pilotCompaniesTable } from "@workspace/db";

const router = Router();

// GET /api/platform-admin/pilots — List pilot records
router.get("/", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Platform administrator access required" });
      return;
    }

    const pilots = await db.select().from(pilotCompaniesTable);
    res.json({ pilots });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list pilot records" });
    }
  }
});

// POST /api/platform-admin/pilots — Create candidate pilot company
router.post("/", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Platform administrator access required" });
      return;
    }

    const pilot = await createPilotCompany(req.body);
    res.status(201).json({ pilot });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to create pilot record" });
    }
  }
});

// POST /api/platform-admin/pilots/:id/approve — Approve pilot company
router.post("/:id/approve", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Platform administrator access required" });
      return;
    }

    const pilotId = Number(req.params.id);
    const learnerLimit = Number(req.body.learnerLimit) || 50;

    const approved = await approvePilotCompany(pilotId, access.userId, learnerLimit);
    res.json({ pilot: approved });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to approve pilot record" });
    }
  }
});

// POST /api/platform-admin/pilots/:id/feedback — Submit pilot feedback
router.post("/:id/feedback", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const pilotId = Number(req.params.id);

    const feedback = await submitPilotFeedback({
      pilotCompanyId: pilotId,
      companyId: access.companyId,
      respondentUserId: access.userId,
      respondentRole: access.role === "company_admin" ? "buyer" : "learner",
      overallRating: Number(req.body.overallRating) || 5,
      easeOfUseRating: Number(req.body.easeOfUseRating) || 5,
      contentRelevanceRating: Number(req.body.contentRelevanceRating) || 5,
      reportingUsefulnessRating: req.body.reportingUsefulnessRating ? Number(req.body.reportingUsefulnessRating) : undefined,
      freeTextFeedback: req.body.freeTextFeedback,
      consentForFollowUp: !!req.body.consentForFollowUp,
    });

    res.status(201).json({ feedback });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to submit pilot feedback" });
    }
  }
});

// POST /api/platform-admin/pilots/:id/issues — Log pilot issue
router.post("/:id/issues", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const pilotId = Number(req.params.id);

    const issue = await logPilotIssue({
      pilotCompanyId: pilotId,
      companyId: access.companyId,
      reportedByUserId: access.userId,
      issueType: req.body.issueType || "content",
      severity: req.body.severity || "medium",
      title: req.body.title || "Pilot Issue",
      description: req.body.description,
      affectedCourseId: req.body.affectedCourseId ? Number(req.body.affectedCourseId) : undefined,
    });

    res.status(201).json({ issue });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to log pilot issue" });
    }
  }
});

// GET /api/platform-admin/pilots/:id/report — Generate pilot outcome report
router.get("/:id/report", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    if (access.role !== "platform_admin") {
      res.status(403).json({ error: "Platform administrator access required" });
      return;
    }

    const pilotId = Number(req.params.id);
    const report = await generatePilotOutcomeReport(pilotId);
    res.json({ report });
  } catch (err) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to generate pilot outcome report" });
    }
  }
});

export default router;
