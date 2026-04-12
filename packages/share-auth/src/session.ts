import { getAuthBaseUrl } from "./config";
import { buildForwardAuthHeaders } from "./headers";
import type { AuthEnvelope, AuthSessionResult, AuthVerificationResult, AuthenticatedUser } from "./types";

function isSuccessEnvelope(payload: AuthEnvelope<AuthenticatedUser>): boolean {
  return payload.code === "SUCCESS" && payload.data !== undefined;
}

export async function readSessionFromHeaders(
  inputHeaders: Headers,
  authBaseUrl: string = getAuthBaseUrl(),
): Promise<AuthSessionResult> {
  const response = await fetch(new URL("/api/users/me", authBaseUrl), {
    method: "GET",
    headers: buildForwardAuthHeaders(inputHeaders),
  });

  if (response.status === 401) {
    return { authenticated: false, user: null };
  }

  if (!response.ok) {
    throw new Error(`Auth service request failed: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as AuthEnvelope<AuthenticatedUser>;

  if (!isSuccessEnvelope(payload)) {
    return { authenticated: false, user: null };
  }

  return {
    authenticated: true,
    user: payload.data,
  };
}

export async function verifySessionFromHeaders(
  inputHeaders: Headers,
  options: {
    authBaseUrl?: string;
    internalApiSecret: string;
  },
): Promise<AuthVerificationResult> {
  const response = await fetch(new URL("/api/internal/verify", options.authBaseUrl ?? getAuthBaseUrl()), {
    method: "POST",
    headers: buildForwardAuthHeaders(inputHeaders, {
      internalApiSecret: options.internalApiSecret,
    }),
  });

  if (response.status === 401) {
    return {
      ok: false,
      status: 401,
      code: "AUTH_TOKEN_INVALID",
      user: null,
    };
  }

  if (response.status === 403) {
    return {
      ok: false,
      status: 403,
      code: "AUTH_FORBIDDEN",
      user: null,
    };
  }

  if (!response.ok) {
    throw new Error(`Auth verification failed: HTTP ${response.status}`);
  }

  const payload = (await response.json()) as AuthEnvelope<AuthenticatedUser>;

  if (!isSuccessEnvelope(payload)) {
    return {
      ok: false,
      status: response.status,
      code: payload.code ?? null,
      user: null,
    };
  }

  return {
    ok: true,
    status: response.status,
    code: payload.code,
    user: payload.data,
  };
}
