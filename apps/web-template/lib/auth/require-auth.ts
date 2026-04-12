import { getAuthBaseUrl, readSessionFromHeaders, type AuthenticatedUser } from "@repo/share-auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface RequiredSession {
  authenticated: true;
  user: AuthenticatedUser;
}

export async function requireAuth(redirectTo: string): Promise<RequiredSession> {
  const session = await readSessionFromHeaders(await headers(), getAuthBaseUrl());

  if (!session.authenticated || !session.user) {
    redirect(`/auth/login?redirect=${encodeURIComponent(redirectTo)}`);
  }

  return {
    authenticated: true,
    user: session.user,
  };
}
