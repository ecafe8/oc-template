import type { Context, Hono, Next } from "hono";
import { ZodError } from "zod";
import { logger } from "../utils/logger";
import { fail } from "../utils/response";
import { AppError } from "./app-error";
import { ErrorCode } from "./error-codes";

export const errorHandler = (app: Hono) => {
  app.onError((err, c) => {
    const requestId = c.get("requestId") ?? "unknown";

    if (err instanceof AppError) {
      console.error(err);
      logger.warn({ err: { code: err.code, message: err.message }, requestId }, `AppError: ${err.code}`);
      return fail(c, err.code, err.message, err.statusCode, err.data);
    }

    if (err instanceof ZodError) {
      // Zod validation errors
      const formattedIssues = err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      logger.warn({ issues: formattedIssues, requestId }, "Validation error");
      return fail(c, ErrorCode.VALIDATION_ERROR, "Validation failed", 422, formattedIssues);
    }

    // Unknown errors — never leak internals
    logger.error({ err, requestId }, "Unhandled error");
    return fail(c, ErrorCode.INTERNAL_ERROR, "Internal server error", 500);
  });
};
