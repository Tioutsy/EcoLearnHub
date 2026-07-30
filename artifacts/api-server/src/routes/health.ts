import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

// GET /healthz — Liveness check
router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

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
