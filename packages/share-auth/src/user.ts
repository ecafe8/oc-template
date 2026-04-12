import type { AuthenticatedUser, AuthUserLike } from "./types";

function toIsoString(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

export function toAuthenticatedUser(user: AuthUserLike): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image ?? null,
    emailVerified: user.emailVerified,
    createdAt: toIsoString(user.createdAt),
    updatedAt: toIsoString(user.updatedAt),
  };
}
