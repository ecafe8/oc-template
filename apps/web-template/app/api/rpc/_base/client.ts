/**
 * Centralized RPC client configuration.
 * All generated module clients share these settings.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

/**
 * Custom fetch wrapper with credentials for cross-origin API calls.
 */
const customFetch: typeof fetch = (input, init) => {
  return fetch(input, {
    ...init,
    credentials: "include",
  });
};

/** Shared hc() client options */
export const fetchOptions = { fetch: customFetch };

/** API base URL (from NEXT_PUBLIC_API_URL env var) */
export function getApiBaseUrl(): string {
  return API_BASE_URL;
}
