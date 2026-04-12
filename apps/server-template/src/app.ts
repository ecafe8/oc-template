import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { requestId } from "hono/request-id";
import { errorHandler } from "./errors/error-handler";
import { pool } from "./lib/db/client";
import { authMiddleware } from "./middlewares/auth";
import { corsMiddleware } from "./middlewares/cors";
import { loggingMiddleware } from "./middlewares/logging";
import { rateLimiterMiddleware } from "./middlewares/rate-limiter";
import { routes } from "./routes";

const app = new Hono();

// --- Global Middleware (order matters) ---

// 1. Request ID — must be first so all logs have it
app.use(requestId());

// 2. Logging — captures request/response timing
app.use(loggingMiddleware);

// 3. CORS — before auth so preflight works
app.use(corsMiddleware);

// 4. Error handler — wraps everything below in try/catch
errorHandler(app);

app.use(contextStorage());

// 5. Rate limiter — after CORS, before routes
app.use("/api/*", rateLimiterMiddleware);
app.use("/api/*", authMiddleware);

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
app.route("/", routes);

export { app };
