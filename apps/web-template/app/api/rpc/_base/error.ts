/**
 * API Error class for RPC client errors.
 * Sets `cause` for compatibility with the global error handler in providers.
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly data: unknown;

  constructor(code: string, message: string, statusCode: number, data?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.statusCode = statusCode;
    this.data = data ?? null;

    // Compatible with providers/index.tsx QueryCache/MutationCache error handler
    this.cause = {
      code,
      message,
      statusCode,
      data: data ?? null,
    };
  }
}
