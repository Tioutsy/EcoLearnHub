import { Router, Request, Response } from "express";
import { requirePlatformAdmin, sendHttpError } from "../lib/access";
import {
  listUpgradeRequests,
  getUpgradeRequestById,
  markUpgradeRequestAwaitingPayment,
  confirmUpgradeRequestPayment,
  convertUpgradeRequestToPaid,
  cancelUpgradeRequest,
  getPilotEngagementInsights,
} from "../lib/pilotPassService";

const router = Router();

// GET /api/platform-admin/upgrade-requests — List all commercial upgrade requests
router.get("/upgrade-requests", async (req: Request, res: Response): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const status = req.query.status as string | undefined;
    const companyId = req.query.companyId ? Number(req.query.companyId) : undefined;
    const list = await listUpgradeRequests({ status, companyId });
    res.json(list);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list upgrade requests" });
    }
  }
});

// GET /api/platform-admin/upgrade-requests/:id — Detail of upgrade request
router.get("/upgrade-requests/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = Number(req.params.id);
    const item = await getUpgradeRequestById(id);
    res.json(item);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to get upgrade request details" });
    }
  }
});

// POST /api/platform-admin/upgrade-requests/:id/mark-awaiting-payment — Set status to AWAITING_PAYMENT
router.post("/upgrade-requests/:id/mark-awaiting-payment", async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await requirePlatformAdmin(req);
    const id = Number(req.params.id);
    const details = req.body?.details;
    const updated = await markUpgradeRequestAwaitingPayment(admin.userId, id, details);
    res.json(updated);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err?.message || "Failed to mark awaiting payment" });
    }
  }
});

// POST /api/platform-admin/upgrade-requests/:id/confirm-payment — Record confirmed payment
router.post("/upgrade-requests/:id/confirm-payment", async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await requirePlatformAdmin(req);
    const id = Number(req.params.id);
    const { paymentReference, paymentDate, amountMUR, paymentMethod, paymentInternalNote } = req.body;

    const updated = await confirmUpgradeRequestPayment(admin.userId, id, {
      paymentReference,
      paymentDate,
      amountMUR,
      paymentMethod,
      paymentInternalNote,
    });

    res.json({
      success: true,
      message: "Payment confirmed successfully. Upgrade request is now authorized for conversion.",
      upgradeRequest: updated,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err?.message || "Failed to confirm payment" });
    }
  }
});

// POST /api/platform-admin/upgrade-requests/:id/convert — Convert after payment confirmation
router.post("/upgrade-requests/:id/convert", async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await requirePlatformAdmin(req);
    const id = Number(req.params.id);

    const result = await convertUpgradeRequestToPaid(admin.userId, id);
    res.json({
      success: true,
      message: "Company converted to paid commercial subscription successfully",
      subscription: result.subscription,
      upgradeRequest: result.upgradeRequest,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err?.message || "Failed to convert upgrade request" });
    }
  }
});

// POST /api/platform-admin/upgrade-requests/:id/cancel — Cancel request
router.post("/upgrade-requests/:id/cancel", async (req: Request, res: Response): Promise<void> => {
  try {
    const admin = await requirePlatformAdmin(req);
    const id = Number(req.params.id);
    const reason = req.body?.reason;

    const updated = await cancelUpgradeRequest(admin.userId, id, reason);
    res.json({
      success: true,
      message: "Upgrade request cancelled",
      upgradeRequest: updated,
    });
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err?.message || "Failed to cancel upgrade request" });
    }
  }
});

// GET /api/platform-admin/pilot-passes/:id/insights — Pilot Engagement & Funnel Insights (Sprint 12.3 Phase 4)
router.get("/pilot-passes/:id/insights", async (req: Request, res: Response): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = Number(req.params.id);
    const insights = await getPilotEngagementInsights(id);
    res.json(insights);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to retrieve pilot engagement insights" });
    }
  }
});

export default router;
