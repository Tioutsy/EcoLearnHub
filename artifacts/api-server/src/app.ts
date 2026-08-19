import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import { clerkMiddleware } from "@clerk/express";
import { publishableKeyFromHost } from "@clerk/shared/keys";
import {
  CLERK_PROXY_PATH,
  clerkProxyMiddleware,
  getClerkProxyHost,
} from "./middlewares/clerkProxyMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import { authBypassMiddleware } from "./middlewares/authBypass";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

const app: Express = express();

// Trust reverse proxy for hosting platforms (e.g. Render / Cloudflare)
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Lightweight unauthenticated health checks for Render and external monitors
app.get(["/healthz", "/api/healthz", "/health", "/api/health"], (_req, res) => {
  res.status(200).json({ status: "ok" });
});

app.get(["/ready", "/api/ready"], async (_req, res) => {
  try {
    await db.execute(sql`SELECT 1`);
    res.status(200).json({ status: "ready", database: "connected", timestamp: new Date().toISOString() });
  } catch (err: any) {
    res.status(503).json({ status: "not_ready", database: "disconnected", error: err.message });
  }
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "Elevio API", timestamp: new Date().toISOString() });
});

app.use(CLERK_PROXY_PATH, clerkProxyMiddleware());

app.use(cors({ credentials: true, origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  clerkMiddleware((req) => ({
    publishableKey: publishableKeyFromHost(
      getClerkProxyHost(req) ?? "",
      process.env.CLERK_PUBLISHABLE_KEY,
    ),
  })),
);

app.use(authBypassMiddleware);

app.use("/api", router);

export default app;
