// errors/error-codes.ts
// 错误码常量 - 使用 as const 对象而非枚举

export const ErrorCodes = {
  // 成功
  SUCCESS: "SUCCESS",

  // 通用错误
  INTERNAL_ERROR: "INTERNAL_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND",
  BAD_REQUEST: "BAD_REQUEST",
  CONFLICT: "CONFLICT",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",

  // 认证错误
  AUTH_UNAUTHORIZED: "AUTH_UNAUTHORIZED",
  AUTH_FORBIDDEN: "AUTH_FORBIDDEN",
  AUTH_TOKEN_EXPIRED: "AUTH_TOKEN_EXPIRED",
  AUTH_TOKEN_INVALID: "AUTH_TOKEN_INVALID",

  // AI 相关错误
  AI_GENERATION_FAILED: "AI_GENERATION_FAILED",
  AI_RATE_LIMIT_EXCEEDED: "AI_RATE_LIMIT_EXCEEDED",
  AI_CONTEXT_TOO_LONG: "AI_CONTEXT_TOO_LONG",

  // 验证错误
  INVALID_INPUT: "INVALID_INPUT",
  MISSING_REQUIRED_FIELD: "MISSING_REQUIRED_FIELD",
  INVALID_FORMAT: "INVALID_FORMAT",

  // 业务错误
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

// HTTP 状态码映射
export const ErrorCodeToStatus: Record<ErrorCode, number> = {
  [ErrorCodes.SUCCESS]: 200,
  [ErrorCodes.INTERNAL_ERROR]: 500,
  [ErrorCodes.VALIDATION_ERROR]: 400,
  [ErrorCodes.NOT_FOUND]: 404,
  [ErrorCodes.BAD_REQUEST]: 400,
  [ErrorCodes.CONFLICT]: 409,
  [ErrorCodes.TOO_MANY_REQUESTS]: 429,
  [ErrorCodes.AUTH_UNAUTHORIZED]: 401,
  [ErrorCodes.AUTH_FORBIDDEN]: 403,
  [ErrorCodes.AUTH_TOKEN_EXPIRED]: 401,
  [ErrorCodes.AUTH_TOKEN_INVALID]: 401,
  [ErrorCodes.AI_GENERATION_FAILED]: 502,
  [ErrorCodes.AI_RATE_LIMIT_EXCEEDED]: 429,
  [ErrorCodes.AI_CONTEXT_TOO_LONG]: 413,
  [ErrorCodes.INVALID_INPUT]: 400,
  [ErrorCodes.MISSING_REQUIRED_FIELD]: 400,
  [ErrorCodes.INVALID_FORMAT]: 400,
};

/** 需要跳转登录页的认证相关错误码 */
export const AUTH_REDIRECT_CODES: Set<string> = new Set([
  ErrorCodes.AUTH_UNAUTHORIZED,
  ErrorCodes.AUTH_TOKEN_EXPIRED,
  ErrorCodes.AUTH_TOKEN_INVALID,
]);

/** 发生这些错误时不进行重试 */
export const NO_RETRY_CODES: Set<string> = new Set([...AUTH_REDIRECT_CODES, ErrorCodes.AUTH_FORBIDDEN]);
