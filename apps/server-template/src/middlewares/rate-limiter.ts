import { env } from "@repo/server-template/config/env.js";
import { AppError } from "@repo/server-template/errors/app-error.js";
import { ErrorCode } from "@repo/server-template/errors/error-codes.js";
import type { Context, Next } from "hono";

// Simple in-memory rate limiter (replace with Redis for multi-instance production)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export const rateLimiterMiddleware = async (c: Context, next: Next): Promise<void> => {
  const ip = c.req.header("X-Forwarded-For")?.split(",")[0]?.trim() ?? c.req.header("X-Real-IP") ?? "unknown";

  const now = Date.now();
  const record = requestCounts.get(ip);

  if (!record || now > record.resetTime) {
    requestCounts.set(ip, { count: 1, resetTime: now + env.RATE_LIMIT_WINDOW_MS });
  } else {
    record.count++;
    if (record.count > env.RATE_LIMIT_MAX) {
      c.header("Retry-After", String(Math.ceil((record.resetTime - now) / 1000)));
      throw new AppError(ErrorCode.RATE_LIMIT_EXCEEDED, "Too many requests", 429);
    }
  }

  await next();
};

// Periodic cleanup to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60_000).unref();
