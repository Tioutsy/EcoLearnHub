import { Router } from "express";
import { requirePlatformAdmin, sendHttpError } from "../lib/access";
import {
  createPilotPass,
  listPilotPasses,
  getPilotPassDetails,
  extendPilotPass,
  revokePilotPass,
  convertPilotToPaid,
} from "../lib/pilotPassService";

const router = Router();

// GET /api/platform-admin/pilot-passes — List all company pilot passes
router.get("/", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const { status, search } = req.query as { status?: string; search?: string };
    const passes = await listPilotPasses({ status, search });
    res.json(passes);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to list pilot passes" });
    }
  }
});

// POST /api/platform-admin/pilot-passes — Create a new pilot pass (returns full code ONCE)
router.post("/", async (req, res): Promise<void> => {
  try {
    const access = await requirePlatformAdmin(req);
    const {
      companyName,
      intendedContactName,
      intendedContactEmail,
      intendedEmailDomain,
      durationDays,
      learnerSeatLimit,
      administratorSeatLimit,
      permittedCourseIds,
      internalSalesNote,
    } = req.body;

    const result = await createPilotPass(access.userId, {
      companyName,
      intendedContactName,
      intendedContactEmail,
      intendedEmailDomain,
      durationDays: durationDays ? parseInt(durationDays, 10) : 30,
      learnerSeatLimit: learnerSeatLimit ? parseInt(learnerSeatLimit, 10) : 10,
      administratorSeatLimit: administratorSeatLimit ? parseInt(administratorSeatLimit, 10) : 1,
      permittedCourseIds: Array.isArray(permittedCourseIds) ? permittedCourseIds.map((id: any) => parseInt(id, 10)) : [],
      internalSalesNote,
    });

    res.status(201).json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to create pilot pass" });
    }
  }
});

// GET /api/platform-admin/pilot-passes/:id — Get details of a single pilot pass
router.get("/:id", async (req, res): Promise<void> => {
  try {
    await requirePlatformAdmin(req);
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid pilot pass ID" });
      return;
    }

    const details = await getPilotPassDetails(id);
    res.json(details);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(500).json({ error: "Failed to retrieve pilot pass details" });
    }
  }
});

// POST /api/platform-admin/pilot-passes/:id/extend — Extend duration with a required reason
router.post("/:id/extend", async (req, res): Promise<void> => {
  try {
    const access = await requirePlatformAdmin(req);
    const id = parseInt(req.params.id, 10);
    const { additionalDays, reason } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid pilot pass ID" });
      return;
    }
    if (!additionalDays || parseInt(additionalDays, 10) <= 0) {
      res.status(400).json({ error: "Additional days must be greater than zero" });
      return;
    }
    if (!reason || !reason.trim()) {
      res.status(400).json({ error: "Extension reason is required" });
      return;
    }

    const updated = await extendPilotPass(access.userId, id, parseInt(additionalDays, 10), reason);
    res.json(updated);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to extend pilot pass" });
    }
  }
});

// POST /api/platform-admin/pilot-passes/:id/revoke — Revoke pilot pass with a required reason
router.post("/:id/revoke", async (req, res): Promise<void> => {
  try {
    const access = await requirePlatformAdmin(req);
    const id = parseInt(req.params.id, 10);
    const { reason } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid pilot pass ID" });
      return;
    }
    if (!reason || !reason.trim()) {
      res.status(400).json({ error: "Revocation reason is required" });
      return;
    }

    const updated = await revokePilotPass(access.userId, id, reason);
    res.json(updated);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to revoke pilot pass" });
    }
  }
});

// POST /api/platform-admin/pilot-passes/:id/convert — Convert pilot company to a paid subscription
router.post("/:id/convert", async (req, res): Promise<void> => {
  try {
    const access = await requirePlatformAdmin(req);
    const id = parseInt(req.params.id, 10);
    const { planCode, employeeBandCode, billingInterval } = req.body;

    if (isNaN(id)) {
      res.status(400).json({ error: "Invalid pilot pass ID" });
      return;
    }

    const details = await getPilotPassDetails(id);
    if (!details.pilotPass.companyId) {
      res.status(400).json({ error: "Pilot pass has not been redeemed by a company yet" });
      return;
    }

    const result = await convertPilotToPaid(details.pilotPass.companyId, {
      planCode: planCode || "COMPLETE",
      employeeBandCode: employeeBandCode || "UP_TO_25",
      billingInterval: billingInterval || "MONTHLY",
      performedBy: access.userId,
    });

    res.json(result);
  } catch (err: any) {
    if (!sendHttpError(res, err)) {
      res.status(400).json({ error: err.message || "Failed to convert pilot pass to paid subscription" });
    }
  }
});

export default router;
