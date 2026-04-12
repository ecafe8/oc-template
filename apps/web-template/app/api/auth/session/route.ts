import { getAuthBaseUrl, readSessionFromHeaders } from "@repo/share-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const session = await readSessionFromHeaders(request.headers, getAuthBaseUrl());
    return NextResponse.json(session, {
      status: session.authenticated ? 200 : 401,
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
      },
      {
        status: 500,
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  }
}
