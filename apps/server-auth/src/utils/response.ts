import type { ApiResponse } from "@server/auth/types/response";
import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export function success<T, S extends ContentfulStatusCode = 200>(
  c: Context,
  data: T,
  message = "",
  status: S = 200 as S,
) {
  return c.json<ApiResponse<T>, S>(
    {
      code: "SUCCESS",
      message,
      data,
    },
    status,
  );
}

export function fail(
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
