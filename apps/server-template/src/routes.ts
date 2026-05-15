import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";
import type { AppEnv } from "./types";
import { aiRoutes } from "./modules/ai/routes";
import { ossRoutes } from "./modules/oss/routes";
import { sitesRoutes } from "./modules/sites/routes";

const routes = new Hono<AppEnv>().basePath("/api");

const subRoutes = [sitesRoutes, ossRoutes, aiRoutes];

subRoutes.forEach((route) => {
  routes.route("/", route);
});

routes.get(
  "/docs",
  swaggerUI({
    url: "/api/openapi",
  }),
);

routes.get(
  "/openapi",
  openAPIRouteHandler(routes, {
    documentation: {
      info: {
        title: "Hono API",
        version: "1.0.0",
        description: "Greeting API",
      },
      // servers: [{ url: "http://localhost:5000", description: "Local Server" }],
    },
  }),
);

// Export the type for Hono RPC client inference
export type AppType = typeof routes;
export { routes };
