import { Scalar } from "@scalar/hono-api-reference";
import { env } from "@server/auth/config/env";
import { AppError } from "@server/auth/errors/app-error";
import { ErrorCodes } from "@server/auth/errors/error-codes";
import HonoMiddleware from "@server/auth/hono-middleware";
import { type AuthType, auth } from "@server/auth/lib/auth";
import { internalRoutes } from "@server/auth/modules/internal/routes";
import { usersRoutes } from "@server/auth/modules/users/routes";
import { fail } from "@server/auth/utils/response";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { handle } from "hono/vercel";
import { openAPIRouteHandler } from "hono-openapi";
import { ZodError } from "zod";

const authRouter = new Hono<{ Bindings: AuthType }>({
  strict: false,
});
authRouter.on(["POST", "GET"], "/*", (c) => {
  return auth.handler(c.req.raw);
});

const app = new Hono().basePath("/api");

app.use(contextStorage());

// Global error handler — catches AppError subclasses, ZodError, and unknowns
app.onError((err, c) => {
  if (err instanceof AppError) {
    return fail(c, err.code, err.message, err.statusCode as ContentfulStatusCode, err.data);
  }
  if (err instanceof ZodError) {
    const issues = err.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));
    return fail(c, ErrorCodes.VALIDATION_ERROR, "Validation failed", 422, issues);
  }
  console.error(err);
  return fail(c, ErrorCodes.INTERNAL_ERROR, "Internal server error", 500);
});

// Apply session auth guard to all routes except /auth/* and /internal/*
app.use(async (c, next) => {
  if (c.req.path.startsWith("/api/internal/")) {
    await next();
    return;
  }
  return HonoMiddleware(c, next);
});

app.route("/auth", authRouter);
app.route("/users", usersRoutes);
app.route("/internal", internalRoutes);

app.get(
  "/openapi",
  openAPIRouteHandler(app, {
    documentation: {
      info: {
        title: "Server Auth API",
        version: "1.0.0",
        description: "Centralized user management and authentication service.",
      },
      servers: [{ url: env.BETTER_AUTH_URL, description: "Local Server" }],
    },
  }),
);

app.get("/scalar", Scalar({ url: "/api/openapi" }));

export const GET = handle(app);
export const POST = handle(app);
export const PATCH = handle(app);
