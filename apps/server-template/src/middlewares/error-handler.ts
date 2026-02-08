import { AppError } from "@repo/server-template/errors/app-error.js";
import { ErrorCode } from "@repo/server-template/errors/error-codes.js";
import { logger } from "@repo/server-template/utils/logger.js";
import { error } from "@repo/server-template/utils/response.js";
import type { Context, Next } from "hono";
import { ZodError } from "zod";

export const errorHandlerMiddleware = async (c: Context, next: Next): Promise<Response> => {
  try {
    await next();
    return c.res;
  } catch (err) {
    const requestId = c.get("requestId") ?? "unknown";

    // Known application errors
    if (err instanceof AppError) {
      logger.warn({ err: { code: err.code, message: err.message }, requestId }, `AppError: ${err.code}`);
      return error(c, err.code, err.message, err.statusCode, err.data);
    }

    // Zod validation errors
    if (err instanceof ZodError) {
      const formattedIssues = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      logger.warn({ issues: formattedIssues, requestId }, "Validation error");
      return error(c, ErrorCode.VALIDATION_ERROR, "Validation failed", 422, formattedIssues);
    }

    // Unknown errors — never leak internals
    logger.error({ err, requestId }, "Unhandled error");
    return error(c, ErrorCode.INTERNAL_ERROR, "Internal server error", 500);
  }
};
