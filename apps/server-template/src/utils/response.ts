import type { ApiResponse } from "@repo/server-template/types/response.js";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Build a success response.
 * Usage: return success(c, data) or success(c, data, "Created", 201)
 */
export function success<T>(c: Context, data: T, message = "", status: ContentfulStatusCode = 200) {
  return c.json<ApiResponse<T>>(
    {
      code: "SUCCESS",
      message,
      data,
    },
    status,
  );
}

/**
 * Build an error response.
 * Typically called from the global error handler, not directly in controllers.
 */
export function error(
  c: Context,
  code: string,
  message: string,
  status: ContentfulStatusCode = 400,
  data: unknown = null,
) {
  return c.json<ApiResponse<unknown>>(
    {
      code,
      message,
      data,
    },
    status,
  );
}
