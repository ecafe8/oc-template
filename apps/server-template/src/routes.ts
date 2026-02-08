import type { AppEnv } from "./types/index.js";
import { Hono } from "hono";

// Import module routes here as they are created:
// import { yourRoutes } from "./modules/yourModule/routes/index.js";

const apiRoutes = new Hono<AppEnv>();
// .route("/yourPath", yourRoutes)

// Export the type for Hono RPC client inference
export type AppType = typeof apiRoutes;
export { apiRoutes };
