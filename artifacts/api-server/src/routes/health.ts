import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

// GET /healthz & /health — Liveness check
const handleLiveness = (_req: any, res: any) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
};

router.get("/healthz", handleLiveness);
router.get("/health", handleLiveness);

// GET /ready — Readiness check verifying database connectivity
router.get("/ready", async (_req, res): Promise<void> => {
  try {
    await db.execute(sql`SELECT 1`);
    res.json({ status: "ready", database: "connected", timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({ status: "not_ready", database: "disconnected", error: err.message });
  }
});

export default router;
