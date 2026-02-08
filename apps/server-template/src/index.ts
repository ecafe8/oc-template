import { serve } from "@hono/node-server";
import { app } from "@repo/server-template/app.js";
import { env } from "@repo/server-template/config/env.js";
import { pool } from "@repo/server-template/lib/db/client.js";
import { logger } from "@repo/server-template/utils/logger.js";

const server = serve(
  {
    fetch: app.fetch,
    port: env.PORT,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  },
);

// Graceful shutdown with resource cleanup
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`Received ${signal}, starting graceful shutdown...`);

  server.close(async (err) => {
    if (err) {
      logger.error({ err }, "Error during server close");
      process.exit(1);
    }

    await pool.end();
    logger.info("Database pool closed");

    logger.info("Graceful shutdown complete");
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");
    process.exit(1);
  }, 10_000).unref();
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
