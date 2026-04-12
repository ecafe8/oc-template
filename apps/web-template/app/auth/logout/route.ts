import { getAuthBaseUrl, normalizeRedirectTarget } from "@repo/share-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get("redirect");
  const returnTo = normalizeRedirectTarget(redirect, request.nextUrl.origin);

  const response = await fetch(new URL("/api/auth/sign-out", getAuthBaseUrl()), {
    method: "POST",
    headers: {
      cookie: request.headers.get("cookie") ?? "",
      origin: request.nextUrl.origin,
    },
    cache: "no-store",
  });

  const redirectResponse = NextResponse.redirect(returnTo);
  const setCookie = response.headers.get("set-cookie");

  if (setCookie) {
    redirectResponse.headers.set("set-cookie", setCookie);
  }

  return redirectResponse;
}
