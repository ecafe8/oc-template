import { AppError } from "@repo/server-template/errors/app-error";
import { ErrorCode } from "@repo/server-template/errors/error-codes";

export class OssDownloadError extends AppError {
  constructor(message: string, data: unknown = null) {
    super(ErrorCode.BAD_REQUEST, message, 400, data);
    this.name = "OssDownloadError";
  }
}

export class OssUploadError extends AppError {
  constructor(message: string, data: unknown = null) {
    super(ErrorCode.INTERNAL_ERROR, message, 500, data);
    this.name = "OssUploadError";
  }
}
