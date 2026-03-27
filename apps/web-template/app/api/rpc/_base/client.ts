/**
 * Centralized RPC client configuration.
 * All generated module clients share these settings.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Custom fetch wrapper with credentials for cross-origin API calls.
 */
const customFetch: typeof fetch = (input, init) => {
  const token = ""; // 如果需要，可以在这里获取 auth token，例如从 localStorage 或 cookie 中

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  return fetch(input, {
    ...init,
    headers,
    credentials: "include",
  });
};

/** Shared hc() client options */
export const fetchOptions = { fetch: customFetch };

/** API base URL (from NEXT_PUBLIC_API_URL env var) */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
