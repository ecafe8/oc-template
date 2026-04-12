import { env } from "@repo/server-template/config/env";
import { verifySessionFromHeaders } from "@repo/share-auth";
import { AuthError, ForbiddenError } from "@repo/server-template/errors/app-error";
import { ErrorCode } from "@repo/server-template/errors/error-codes";
import type { AppEnv } from "@repo/server-template/types/index";
import type { Context, Next } from "hono";

/**
 * Auth middleware: delegates session verification to the centralized auth service
 * and injects user info into context.
 */
export const authMiddleware = async (c: Context<AppEnv>, next: Next): Promise<void> => {
  if (env.NODE_ENV === "development" && (c.req.path.startsWith("/api/docs") || c.req.path.startsWith("/api/openapi"))) {
    await next();
    return;
  }

  const result = await verifySessionFromHeaders(c.req.raw.headers, {
    authBaseUrl: env.AUTH_SERVICE_URL,
    internalApiSecret: env.INTERNAL_API_SECRET,
  });

  if (result.status === 401) {
    throw new AuthError(ErrorCode.AUTH_TOKEN_INVALID, "Invalid or expired token");
  }

  if (result.status === 403) {
    throw new ForbiddenError("Forbidden");
  }

  if (!result.ok || !result.user) {
    throw new AuthError(ErrorCode.AUTH_UNAUTHORIZED, "Unable to verify current session");
  }

  c.set("userId", result.user.id);

  await next();
};

/**
 * Role-based authorization guard.
 * Usage: .use(requireRole("admin"))
 */
export function requireRole(...roles: string[]) {
  return async (c: Context<AppEnv>, next: Next): Promise<void> => {
    const userRole = c.get("userRole");
    if (!userRole || !roles.includes(userRole)) {
      throw new ForbiddenError("Insufficient permissions");
    }
    await next();
  };
}
