import { randomUUID } from "node:crypto";
import type { Context, Next } from "hono";

export const requestIdMiddleware = async (c: Context, next: Next): Promise<void> => {
  const requestId = c.req.header("X-Request-Id") ?? randomUUID();
  c.set("requestId", requestId);
  c.header("X-Request-Id", requestId);
  await next();
};
