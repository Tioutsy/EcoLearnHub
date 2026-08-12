import { Router } from "express";
import { getCompanyAccess, sendHttpError } from "../lib/access";
import {
  resolveCompanyManagementActions,
  getOverdueLearnersForCompany,
  getNotStartedLearnersForCompany,
  getStrugglingLearnersForCompany,
  sendTrainingReminderBatch,
  assignRefresherTrainingBatch,
  getManagementFollowUpHistory,
} from "../lib/ai/trainingActionResolverService";

const router = Router();

// GET /api/company/training-actions — Get allowlisted management actions
router.get("/", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const actions = await resolveCompanyManagementActions(access);
    res.json(actions);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to resolve management actions" });
    }
  }
});

// GET /api/company/training-actions/learners/overdue — Drill-down overdue learners
router.get("/learners/overdue", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
    const learners = await getOverdueLearnersForCompany(access, courseId);
    res.json({ learners, count: learners.length });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to retrieve overdue learners" });
    }
  }
});

// GET /api/company/training-actions/learners/not-started — Drill-down unstarted learners
router.get("/learners/not-started", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
    const learners = await getNotStartedLearnersForCompany(access, courseId);
    res.json({ learners, count: learners.length });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to retrieve unstarted learners" });
    }
  }
});

// GET /api/company/training-actions/learners/struggling — Drill-down struggling learners
router.get("/learners/struggling", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const courseId = req.query.courseId ? Number(req.query.courseId) : undefined;
    const learners = await getStrugglingLearnersForCompany(access, courseId);
    res.json({ learners, count: learners.length });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to retrieve struggling learners" });
    }
  }
});

// POST /api/company/training-actions/remind — Prepare & dispatch training reminders
// REQUIRES explicit confirmation from the client before calling (requiresConfirmation: true)
router.post("/remind", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const { employeeIds, courseId, category, customNote, source } = req.body;

    const result = await sendTrainingReminderBatch(access, {
      employeeIds: Array.isArray(employeeIds) ? employeeIds.map(Number) : undefined,
      courseId: courseId ? Number(courseId) : undefined,
      category: category === "not_started" ? "not_started" : category === "manual" ? "manual" : "overdue",
      customNote: typeof customNote === "string" ? customNote : undefined,
      source: source === "AI-copilot" ? "AI-copilot" : source === "manual" ? "manual" : "training-insight",
    });

    res.json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to send training reminders" });
    }
  }
});

// POST /api/company/training-actions/assign-refresher — Assign refresher training
// REQUIRES explicit confirmation from the client before calling (requiresConfirmation: true)
// Preserves historical completions and certificates.
router.post("/assign-refresher", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const { employeeIds, courseId, dueDate, source } = req.body;

    if (!Array.isArray(employeeIds) || employeeIds.length === 0) {
      res.status(400).json({ error: "Select at least one employee for refresher assignment" });
      return;
    }

    if (!courseId || typeof courseId !== "number") {
      res.status(400).json({ error: "A valid courseId is required for refresher assignment" });
      return;
    }

    const result = await assignRefresherTrainingBatch(access, {
      employeeIds: employeeIds.map(Number),
      courseId: Number(courseId),
      dueDate: typeof dueDate === "string" ? dueDate : undefined,
      source: source === "AI-copilot" ? "AI-copilot" : source === "manual" ? "manual" : "training-insight",
    });

    res.json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to assign refresher training" });
    }
  }
});

// GET /api/company/training-actions/audit-history — Follow-up audit history
router.get("/audit-history", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    const history = await getManagementFollowUpHistory(access);
    res.json({ history, count: history.length });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to retrieve follow-up audit history" });
    }
  }
});

export default router;
