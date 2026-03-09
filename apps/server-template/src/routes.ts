import { swaggerUI } from "@hono/swagger-ui";
import { Hono } from "hono";
import { openAPIRouteHandler } from "hono-openapi";

const routes = new Hono().basePath("/api");

const subRoutes: Hono[] = [];

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
