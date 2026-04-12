import { jwtVerify, SignJWT } from "jose";

/** Payload for organization invitation JWTs */
export interface OrganizationInvite {
  organizationId: string;
  email: string;
  role?: string;
  invitedBy?: string;
}

export async function verifyJWT(token: string, secret: string) {
  const decoded = await jwtVerify(token, new TextEncoder().encode(secret));
  return decoded;
}

export async function generateOrganizationInviteJWT(payload: OrganizationInvite, secret: string): Promise<string> {
  const jwt = await new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("5m")
    .sign(new TextEncoder().encode(secret));

  return jwt;
}

export function parseJwt<T>(token: string): T | null {
  try {
    const parts = token.split(".");
    const base64 = parts[1];
    if (!base64) return null;
    const decoded = JSON.parse(atob(base64)) as T;
    return decoded;
  } catch (_e) {
    return null;
  }
}
