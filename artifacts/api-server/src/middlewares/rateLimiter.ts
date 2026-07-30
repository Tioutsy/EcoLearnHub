import type { Request, Response, NextFunction } from "express";

interface RateLimitStoreEntry {
  count: number;
  resetTime: number;
}

const store = new Map<string, RateLimitStoreEntry>();

export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  message?: string;
}) {
  const windowMs = options.windowMs || 60 * 1000;
  const maxRequests = options.maxRequests || 60;
  const prefix = options.keyPrefix || "rl";
  const message = options.message || "Too many requests, please try again later.";

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";
    const key = `${prefix}_${ip}`;
    const now = Date.now();

    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      store.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      next();
      return;
    }

    entry.count++;
    if (entry.count > maxRequests) {
      res.status(429).json({ error: message, retryAfterSeconds: Math.ceil((entry.resetTime - now) / 1000) });
      return;
    }

    next();
  };
}

export const sensitiveActionLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 30,
  keyPrefix: "sensitive",
  message: "Rate limit exceeded for sensitive actions. Please wait before retrying.",
});
