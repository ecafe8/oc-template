import { AppError } from "@repo/server-template/errors/app-error";
import { ErrorCode } from "@repo/server-template/errors/error-codes";

export class SiteNotFoundError extends AppError {
  constructor(siteId: string) {
    super(ErrorCode.NOT_FOUND, `Site ${siteId} not found`, 404);
    this.name = "SiteNotFoundError";
  }
}

export class SiteUrlDuplicateError extends AppError {
  constructor(url: string) {
    super(ErrorCode.DB_CONFLICT, `A site with URL ${url} already exists`, 409);
    this.name = "SiteUrlDuplicateError";
  }
}
