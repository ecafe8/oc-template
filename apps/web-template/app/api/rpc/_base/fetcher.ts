import { ApiError } from "./error";

/**
 * Unwrap API response from `{ code, message, data }` envelope.
 *
 * - Non-OK HTTP status → throws ApiError
 * - code !== "SUCCESS" → throws ApiError
 * - Otherwise → returns `data` field
 */
export async function unwrapResponse<T = unknown>(response: Response): Promise<T> {
  let json: Record<string, unknown>;
  try {
    json = (await response.json()) as Record<string, unknown>;
  } catch {
    throw new ApiError(
      response.ok ? "PARSE_ERROR" : "NETWORK_ERROR",
      response.ok ? "响应解析失败" : `请求失败: HTTP ${response.status}`,
      response.status,
    );
  }

  if (!response.ok || (json.code && json.code !== "SUCCESS")) {
    throw new ApiError(
      (json.code as string) ?? "UNKNOWN_ERROR",
      (json.message as string) ?? `HTTP ${response.status}`,
      response.status,
      json.data,
    );
  }

  return (json.data !== undefined ? json.data : json) as T;
}
