import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import {
  reconcilePilotLifecycle,
  processPilotNotifications,
  processPilotRetention,
} from "../lib/pilotPassService";
import { logger } from "../lib/logger";

const router = Router();

/**
 * Constant-time authentication middleware for internal scheduled background jobs.
 */
function requireInternalJobSecret(req: Request, res: Response, next: NextFunction): void {
  const configuredSecret =
    process.env.INTERNAL_JOB_SECRET ||
    process.env.CRON_SECRET ||
    "elevio-internal-job-secret-local";

  const headerSecret =
    (req.headers["x-job-secret"] as string) ||
    (req.headers["authorization"]?.startsWith("Bearer ")
      ? req.headers["authorization"].slice(7)
      : undefined);

  if (!headerSecret) {
    res.status(401).json({ error: "Missing internal job authorization secret" });
    return;
  }

  const configuredBuffer = Buffer.from(configuredSecret);
  const providedBuffer = Buffer.from(headerSecret);

  if (
    configuredBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(configuredBuffer, providedBuffer)
  ) {
    res.status(401).json({ error: "Invalid internal job authorization secret" });
    return;
  }

  next();
}

// POST /api/internal/jobs/reconcile-pilot-lifecycle — Scheduled Reconciliation (Sprint 12.3 Phase 1.3)
router.post("/reconcile-pilot-lifecycle", requireInternalJobSecret, async (req: Request, res: Response): Promise<void> => {
  try {
    const batchSize = req.body?.batchSize ? Number(req.body.batchSize) : 50;
    const result = await reconcilePilotLifecycle({ batchSize });
    res.json({
      success: true,
      job: "reconcile-pilot-lifecycle",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Internal job reconcile-pilot-lifecycle failed");
    res.status(500).json({ error: err?.message || "Reconciliation failed" });
  }
});

// POST /api/internal/jobs/process-pilot-notifications — Milestone Warnings Engine (Sprint 12.3 Phase 2)
router.post("/process-pilot-notifications", requireInternalJobSecret, async (_req: Request, res: Response): Promise<void> => {
  try {
    const result = await processPilotNotifications();
    res.json({
      success: true,
      job: "process-pilot-notifications",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Internal job process-pilot-notifications failed");
    res.status(500).json({ error: err?.message || "Notification processing failed" });
  }
});

// POST /api/internal/jobs/process-pilot-retention — Retention Verification (Sprint 12.3 Phase 5)
router.post("/process-pilot-retention", requireInternalJobSecret, async (req: Request, res: Response): Promise<void> => {
  try {
    const dryRun = req.body?.dryRun !== false; // defaults to dry-run true
    const batchSize = req.body?.batchSize ? Number(req.body.batchSize) : 50;
    const result = await processPilotRetention({ dryRun, batchSize });
    res.json({
      success: true,
      job: "process-pilot-retention",
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error({ err: err?.message }, "Internal job process-pilot-retention failed");
    res.status(500).json({ error: err?.message || "Retention processing failed" });
  }
});

export default router;
