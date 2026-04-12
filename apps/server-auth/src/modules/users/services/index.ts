import { auth } from "@server/auth/lib/auth";
import { toAuthenticatedUser, type AuthenticatedUser } from "@repo/share-auth";

export interface UpdateUserInput {
  name?: string;
  image?: string;
}

export async function getUserFromHeaders(headers: Headers): Promise<AuthenticatedUser | null> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user) return null;
  return toAuthenticatedUser(session.user);
}

export async function updateUser(headers: Headers, input: UpdateUserInput): Promise<AuthenticatedUser | null> {
  const result = await auth.api.updateUser({ body: input, headers });
  if (!result) return null;
  const session = await auth.api.getSession({ headers });
  if (!session?.user) return null;
  return toAuthenticatedUser(session.user);
}
