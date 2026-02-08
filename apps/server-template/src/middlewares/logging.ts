import { logger } from "@repo/server-template/utils/logger.js";
import type { Context, Next } from "hono";

export const loggingMiddleware = async (c: Context, next: Next): Promise<void> => {
  const start = Date.now();
  const method = c.req.method;
  const path = c.req.path;
  const requestId = c.get("requestId") ?? "unknown";

  logger.info({ requestId, method, path }, "Incoming request");

  await next();

  const duration = Date.now() - start;
  const status = c.res.status;

  const logFn = status >= 500 ? logger.error : status >= 400 ? logger.warn : logger.info;
  logFn.call(logger, { requestId, method, path, status, duration: `${duration}ms` }, "Request completed");
};
