import { env } from "@server/auth/config/env";
import { ErrorCodes } from "@server/auth/errors/error-codes";
import { fail } from "@server/auth/utils/response";
import type { Context } from "hono";
import { auth } from "./lib/auth";

export type UserInfo = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type UserOrganizationInfo = {
  userId: string;
  name?: string;
  email?: string;
  organizationId?: string;
  role?: string;
};

declare module "hono" {
  interface ContextVariableMap {
    user: UserOrganizationInfo;
  }
}

const publicApiPrefixes = ["/api/auth/", "/api/openapi", "/api/scalar"];

export default async function HonoMiddleware(c: Context, next: () => Promise<void>) {
  const path = c.req.path;
  try {
    if (path.startsWith("/api/auth/reference") || path.startsWith("/api/scalar")) {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });
      if (env.NODE_ENV !== "development" && session?.user.email !== "admin@auth.com")
        throw new Error("authentication failed");
    }

    if (publicApiPrefixes.some((prefix) => path.startsWith(prefix))) {
      await next();
      return;
    }

    const session = await auth.api.getSession({
      headers: c.req.raw.headers,
    });
    if (!session?.user) throw new Error("authentication failed");

    c.set("user", {
      userId: session.user.id,
      name: session.user.name,
      email: session.user.email,
    });

    await next();
  } catch (_error) {
    return fail(c, ErrorCodes.AUTH_UNAUTHORIZED, "authentication failed", 401);
  }
}
