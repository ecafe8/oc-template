import { auth } from "@server/auth/lib/auth";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UpdateUserInput {
  name?: string;
  image?: string;
}

export async function getUserFromHeaders(headers: Headers): Promise<UserProfile | null> {
  const session = await auth.api.getSession({ headers });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image ?? null,
    emailVerified: session.user.emailVerified,
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  };
}

export async function updateUser(headers: Headers, input: UpdateUserInput): Promise<UserProfile | null> {
  const result = await auth.api.updateUser({ body: input, headers });
  if (!result) return null;
  const session = await auth.api.getSession({ headers });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image ?? null,
    emailVerified: session.user.emailVerified,
    createdAt: session.user.createdAt,
    updatedAt: session.user.updatedAt,
  };
}
