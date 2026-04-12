// errors/app-error.ts
// 业务错误基类 - 所有业务错误应继承此类

export interface AppErrorOptions {
  code: string;
  message: string;
  statusCode: number;
  data?: unknown;
  cause?: Error;
}

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly data: unknown;
  public readonly isOperational: boolean = true;

  constructor(options: AppErrorOptions) {
    super(options.message);
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode;
    this.data = options.data;

    if (options.cause) {
      this.cause = options.cause;
    }

    // 修复原型链
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      statusCode: this.statusCode,
      data: this.data,
    };
  }
}

// 常用错误子类

export class ValidationError extends AppError {
  constructor(message: string, data?: unknown) {
    super({
      code: "VALIDATION_ERROR",
      message,
      statusCode: 400,
      data,
    });
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super({
      code: "NOT_FOUND",
      message: id ? `${resource} with id '${id}' not found` : `${resource} not found`,
      statusCode: 404,
    });
    this.name = "NotFoundError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super({
      code: "AUTH_UNAUTHORIZED",
      message,
      statusCode: 401,
    });
    this.name = "UnauthorizedError";
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super({
      code: "AUTH_FORBIDDEN",
      message,
      statusCode: 403,
    });
    this.name = "ForbiddenError";
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super({
      code: "CONFLICT",
      message,
      statusCode: 409,
    });
    this.name = "ConflictError";
  }
}
