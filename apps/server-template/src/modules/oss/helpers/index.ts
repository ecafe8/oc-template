import type { OssPolicy } from "@repo/server-template/modules/oss/types";

/**
 * 生成 OSS V4 签名所需的 credential 字符串。
 */
export function getCredential(date: string, region: string, accessKeyId?: string, product = "oss"): string {
  const tempCredential = `${date}/${region}/${product}/aliyun_v4_request`;

  if (accessKeyId) {
    return `${accessKeyId}/${tempCredential}`;
  }

  return tempCredential;
}

/**
 * 将带 `oss-` 前缀的 region 转为标准区域名。
 */
export function getStandardRegion(region: string): string {
  return region.replace(/^oss-/g, "");
}

/**
 * 确保 region 带有 OSS SDK 需要的 `oss-` 前缀。
 */
export function ensureOssRegion(region: string): string {
  return region.startsWith("oss-") ? region : `oss-${region}`;
}

/**
 * 将时间格式化为 OSS 签名使用的 UTC 时间字符串。
 */
export function formatOssDate(date: Date): string {
  const padTo2Digits = (value: number): string => value.toString().padStart(2, "0");

  return (
    date.getUTCFullYear() +
    padTo2Digits(date.getUTCMonth() + 1) +
    padTo2Digits(date.getUTCDate()) +
    "T" +
    padTo2Digits(date.getUTCHours()) +
    padTo2Digits(date.getUTCMinutes()) +
    padTo2Digits(date.getUTCSeconds()) +
    "Z"
  );
}

/**
 * 将 policy 规范化为稳定的 JSON 字符串，便于后续签名和编码。
 */
export function policy2Str(policy: OssPolicy | string): string {
  if (typeof policy === "string") {
    return JSON.stringify(JSON.parse(policy));
  }

  return JSON.stringify(policy);
}

/**
 * 过滤空路径、`.` 和 `..`，避免生成非法或危险的对象路径。
 */
function normalizePathParts(value: string): string[] {
  return value
    .split("/")
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && part !== "." && part !== "..");
}

/**
 * 规范化 OSS 目录路径，并保证目录以 `/` 结尾。
 */
export function normalizeOssDir(...segments: string[]): string {
  const parts = segments.flatMap((segment) => normalizePathParts(segment));

  if (parts.length === 0) {
    return "";
  }

  return `${parts.join("/")}/`;
}

/**
 * 组合目录和文件名，生成最终的 OSS 对象 Key。
 */
export function buildOssObjectKey(prefix: string, path: string, filename: string): string {
  const normalizedFilename = normalizePathParts(filename).join("/");
  const normalizedDir = normalizeOssDir(prefix, path);

  if (!normalizedFilename) {
    return normalizedDir.slice(0, -1);
  }

  return `${normalizedDir}${normalizedFilename}`;
}
