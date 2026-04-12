import { env } from "@server/auth/config/env";
import { ErrorCodes } from "@server/auth/errors/error-codes";
import { auth } from "@server/auth/lib/auth";
import { honoDescribeRoute } from "@server/auth/utils/hono";
import { fail, success } from "@server/auth/utils/response";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";

const TAG = "Internal";

/**
 * Internal endpoint: POST /api/internal/verify
 * Called by other server-* services to validate a Bearer token or session cookie.
 * Returns the user info if the session is valid.
 *
 * Security: protected by a shared internal secret (INTERNAL_API_SECRET).
 * The caller must include `x-internal-secret: <secret>` header.
 */
export const internalRoutes = new Hono().post(
  "/verify",
  describeRoute(
    honoDescribeRoute({
      tag: TAG,
      summary: "Verify session and return user info",
    }),
  ),
  async (c) => {
    const secret = c.req.header("x-internal-secret");
    if (secret !== env.INTERNAL_API_SECRET) {
      return fail(c, ErrorCodes.AUTH_FORBIDDEN, "Forbidden", 403);
    }

    const session = await auth.api.getSession({ headers: c.req.raw.headers });
    if (!session?.user) {
      return fail(c, ErrorCodes.AUTH_TOKEN_INVALID, "Invalid or expired session", 401);
    }
    return success(c, {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      image: session.user.image ?? null,
      emailVerified: session.user.emailVerified,
      createdAt: session.user.createdAt,
      updatedAt: session.user.updatedAt,
    });
  },
);

export type RPCInternalRoutesType = typeof internalRoutes;
