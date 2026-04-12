export const DEFAULT_AUTH_BASE_URL = "http://localhost:4999";

export function getAuthBaseUrl(): string {
  return process.env.AUTH_BASE_URL ?? process.env.NEXT_PUBLIC_AUTH_BASE_URL ?? DEFAULT_AUTH_BASE_URL;
}
