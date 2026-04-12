"use client";

import type { AuthSessionResult } from "@repo/share-auth";
import { useQuery } from "@tanstack/react-query";

async function fetchSession(): Promise<AuthSessionResult> {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });

  const payload = (await response.json()) as AuthSessionResult;

  if (response.status === 401) {
    return payload;
  }

  if (!response.ok) {
    throw new Error("Failed to load auth session");
  }

  return payload;
}

export function useAuthSession() {
  return useQuery({
    queryKey: ["auth", "session"],
    queryFn: fetchSession,
    staleTime: 30_000,
  });
}
