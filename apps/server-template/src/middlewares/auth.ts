import { env } from "@repo/server-template/config/env.js";
import { AuthError, ForbiddenError } from "@repo/server-template/errors/app-error.js";
import { ErrorCode } from "@repo/server-template/errors/error-codes.js";
import type { AppEnv } from "@repo/server-template/types/index.js";
import type { Context, Next } from "hono";
import { verify } from "hono/jwt";

/** JWT payload shape */
export interface JwtPayload {
  sub: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Auth middleware: verifies JWT and injects user info into context.
 * Applied per-route, not globally.
 */
export const authMiddleware = async (c: Context<AppEnv>, next: Next): Promise<void> => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthError(ErrorCode.AUTH_UNAUTHORIZED, "Missing or invalid Authorization header");
  }

  const token = authHeader.slice(7);

  try {
    const payload = (await verify(token, env.JWT_SECRET, "HS256")) as unknown as JwtPayload;
    c.set("userId", payload.sub);
    c.set("userRole", payload.role);
  } catch {
    throw new AuthError(ErrorCode.AUTH_TOKEN_INVALID, "Invalid or expired token");
  }

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
