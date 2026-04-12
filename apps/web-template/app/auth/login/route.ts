import { getAuthBaseUrl, normalizeRedirectTarget } from "@repo/share-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get("redirect");
  const returnTo = normalizeRedirectTarget(redirect, request.nextUrl.origin);
  const loginUrl = new URL("/login", getAuthBaseUrl());

  loginUrl.searchParams.set("redirect", returnTo);

  return NextResponse.redirect(loginUrl);
}
