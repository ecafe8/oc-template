import { env } from "@repo/server-template/config/env.js";
import { cors } from "hono/cors";

export const corsMiddleware = cors({
  origin: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
  allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  credentials: true,
});
