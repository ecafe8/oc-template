import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ErrorCode, type ErrorCodeType } from "./error-codes.js";

export class AppError extends Error {
  public readonly code: ErrorCodeType;
  public readonly statusCode: ContentfulStatusCode;
  public readonly data: unknown;

  constructor(code: ErrorCodeType, message: string, statusCode: ContentfulStatusCode = 400, data: unknown = null) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class ValidationError extends AppError {
  constructor(message: string, data: unknown = null) {
    super(ErrorCode.VALIDATION_ERROR, message, 422, data);
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(ErrorCode.NOT_FOUND, `${resource} not found`, 404);
    this.name = "NotFoundError";
  }
}

export class AuthError extends AppError {
  constructor(code: ErrorCodeType = ErrorCode.AUTH_UNAUTHORIZED, message = "Unauthorized") {
    super(code, message, 401);
    this.name = "AuthError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(ErrorCode.AUTH_FORBIDDEN, message, 403);
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(ErrorCode.DB_CONFLICT, message, 409);
    this.name = "ConflictError";
  }
}
