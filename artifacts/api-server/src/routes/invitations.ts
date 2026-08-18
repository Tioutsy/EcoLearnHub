import { Router } from "express";
import { getAuthContext, getClaimEmail, sendHttpError, HttpError } from "../lib/access";
import {
  validateInvitation,
  acceptEmployeeInvitation,
} from "../lib/invitationService";

const router = Router();

// In-memory sliding window rate limiter for validation abuse protection
interface RateLimitRecord {
  count: number;
  resetAt: number;
}
const validationAttempts = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_VALIDATION_ATTEMPTS = 15; // 15 attempts per minute per IP

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = validationAttempts.get(ip);
  if (!record || record.resetAt <= now) {
    validationAttempts.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (record.count >= MAX_VALIDATION_ATTEMPTS) {
    return false;
  }
  record.count += 1;
  return true;
}

// Clean up expired rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of validationAttempts.entries()) {
    if (record.resetAt <= now) {
      validationAttempts.delete(ip);
    }
  }
}, 5 * 60 * 1000).unref();

// Helper to format error responses with code & message
function sendJsonError(res: any, err: any) {
  if (err instanceof HttpError) {
    try {
      const parsed = JSON.parse(err.message);
      res.status(err.status).json({ error: parsed.message, code: parsed.code, ...parsed });
      return;
    } catch {
      res.status(err.status).json({ error: err.message });
      return;
    }
  }
  res.status(400).json({ error: err?.message || "An unexpected error occurred" });
}

// GET /api/invitations/verify?token=XXX or ?code=XXX
router.get("/verify", async (req, res): Promise<void> => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({
        error: "Too many validation attempts. Please wait a minute and try again.",
        code: "RATE_LIMIT_EXCEEDED",
      });
      return;
    }

    const token = typeof req.query.token === "string" ? req.query.token.trim() : null;
    const code = typeof req.query.code === "string" ? req.query.code.trim() : null;
    const secret = token || code;

    if (!secret) {
      res.status(400).json({ error: "Token or code query parameter is required" });
      return;
    }

    const result = await validateInvitation(secret);
    res.json(result);
  } catch (err: any) {
    sendJsonError(res, err);
  }
});

// POST /api/invitations/validate or /api/employee-invitations/validate
router.post("/validate", async (req, res): Promise<void> => {
  try {
    const clientIp = req.ip || req.socket.remoteAddress || "unknown";
    if (!checkRateLimit(clientIp)) {
      res.status(429).json({
        error: "Too many validation attempts. Please wait a minute and try again.",
        code: "RATE_LIMIT_EXCEEDED",
      });
      return;
    }

    const token = typeof req.body.token === "string" ? req.body.token.trim() : null;
    const code = typeof req.body.code === "string" ? req.body.code.trim() : null;
    const secret = token || code;

    if (!secret) {
      res.status(400).json({ error: "token or code is required in request body" });
      return;
    }

    const result = await validateInvitation(secret);
    res.json(result);
  } catch (err: any) {
    sendJsonError(res, err);
  }
});

// POST /api/invitations/accept or /api/employee-invitations/accept
router.post("/accept", async (req, res): Promise<void> => {
  try {
    const token = typeof req.body.token === "string" ? req.body.token.trim() : null;
    const code = typeof req.body.code === "string" ? req.body.code.trim() : null;
    const secret = token || code;

    if (!secret) {
      res.status(400).json({ error: "token or code is required" });
      return;
    }

    const auth = getAuthContext(req);
    const userId = auth.userId;
    if (!userId) {
      res.status(401).json({ error: "Authentication required to accept invitation", code: "UNAUTHENTICATED" });
      return;
    }

    const sessionEmail = getClaimEmail(auth.sessionClaims ?? {});
    const result = await acceptEmployeeInvitation(secret, userId, sessionEmail);

    res.json({
      message: "Invitation accepted successfully",
      success: true,
      companyId: result.companyId,
      companyName: result.companyName,
      employeeId: result.employeeId,
      role: result.role,
      redirectUrl: result.redirectUrl,
    });
  } catch (err: any) {
    sendJsonError(res, err);
  }
});

export default router;
