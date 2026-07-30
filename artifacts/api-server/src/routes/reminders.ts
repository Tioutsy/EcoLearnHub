import { Router } from "express";
import { processTrainingReminders } from "../lib/reminderSchedulerService";
import { getCompanyAccess, sendHttpError } from "../lib/access";

const router = Router();

// POST /api/reminders/process — Authenticated scheduled reminder processor
router.post("/process", async (req, res): Promise<void> => {
  try {
    const access = await getCompanyAccess(req);
    // Enforce administrative or system invocation context
    if (access.role !== "platform_admin" && access.role !== "company_admin" && (access.role as string) !== "system") {
      res.status(403).json({ error: "Administrative authorization required for reminder scheduler" });
      return;
    }

    const { companyId, policyWindowPeriod } = req.body;
    const targetCompanyId = typeof companyId === "number" ? companyId : access.companyId ?? undefined;

    const summary = await processTrainingReminders({
      companyId: targetCompanyId,
      policyWindowPeriod: typeof policyWindowPeriod === "string" ? policyWindowPeriod : undefined,
    });

    res.json({
      message: "Training reminders processed successfully",
      ...summary,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: err.message || "Failed to process training reminders" });
    }
  }
});

export default router;
