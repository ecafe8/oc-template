import { pool } from "./lib/db/client.js";
import { corsMiddleware } from "./middlewares/cors.js";
import { errorHandlerMiddleware } from "./middlewares/error-handler.js";
import { loggingMiddleware } from "./middlewares/logging.js";
import { rateLimiterMiddleware } from "./middlewares/rate-limiter.js";
import { requestIdMiddleware } from "./middlewares/request-id.js";
import { apiRoutes } from "./routes.js";
import type { AppEnv } from "./types/index.js";
import { Hono } from "hono";

const app = new Hono<AppEnv>();

// --- Global Middleware (order matters) ---

// 1. Request ID — must be first so all logs have it
app.use("*", requestIdMiddleware);

// 2. Logging — captures request/response timing
app.use("*", loggingMiddleware);

// 3. Error handler — wraps everything below in try/catch
app.use("*", errorHandlerMiddleware);

// 4. CORS — before auth so preflight works
app.use("/api/*", corsMiddleware);

// 5. Rate limiter — after CORS, before routes
app.use("/api/*", rateLimiterMiddleware);

// --- Health Check (outside /api/ prefix, no auth) ---
app.get("/health", async (c) => {
  try {
    await pool.query("SELECT 1");
  } catch {
    return c.json({ status: "unhealthy", db: "disconnected" }, 503);
  }

  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// --- API Routes ---
app.route("/api", apiRoutes);

export { app };
