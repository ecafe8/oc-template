import { success } from "@repo/server-template/utils/response";
import type { Context } from "hono";
import { deleteFilesRequestZod, ossGetSignatureInputZod, uploadNetworkFileZod } from "../schema";
import { ossService } from "../services";

/**
 * 生成前端直传 OSS 所需签名。
 */
export async function generateOssSignatureHandler(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const input = ossGetSignatureInputZod.parse(body);
  const signature = await ossService.generateSignature(input);

  return success(c, signature);
}

/**
 * 由服务端代为下载远程文件并上传到 OSS。
 */
export async function uploadOssNetworkFileHandler(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const input = uploadNetworkFileZod.parse(body);
  const url = await ossService.uploadNetworkFile(input.url, input.path, input.filename);

  return success(c, { url }, "File uploaded", 201);
}

/**
 * 批量删除 OSS 文件。
 */
export async function deleteOssFilesHandler(c: Context) {
  const body = await c.req.json().catch(() => ({}));
  const input = deleteFilesRequestZod.parse(body);
  const deleted = await ossService.deleteFiles(input.paths);

  return success(c, { success: deleted });
}
