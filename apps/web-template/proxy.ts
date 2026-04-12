import { getAuthBaseUrl, readSessionFromHeaders } from "@repo/share-auth";
import { buildAuthRedirectTarget, isProtectedAppPath } from "@repo/web-template/lib/auth/protected-routes";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  if (!isProtectedAppPath(pathname)) {
    return NextResponse.next();
  }

  try {
    const session = await readSessionFromHeaders(request.headers, getAuthBaseUrl());

    if (session.authenticated && session.user) {
      return NextResponse.next();
    }
  } catch {
    // Fall through to the shared login route when the current session cannot be resolved.
  }

  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("redirect", buildAuthRedirectTarget(pathname, search));

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!api|auth|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
