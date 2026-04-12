export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  image: string | null;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthEnvelope<T> {
  code: string;
  message: string;
  data: T;
}

export interface AuthSessionResult {
  authenticated: boolean;
  user: AuthenticatedUser | null;
}

export interface AuthVerificationResult {
  ok: boolean;
  status: number;
  code: string | null;
  user: AuthenticatedUser | null;
}

export interface AuthUserLike {
  id: string;
  email: string;
  name: string;
  image?: string | null;
  emailVerified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}
