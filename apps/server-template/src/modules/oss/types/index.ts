export const OSS_SIGNATURE_VERSION = "OSS4-HMAC-SHA256";

export type OssSignatureVersion = typeof OSS_SIGNATURE_VERSION;

export type OssPolicyCondition =
  | { bucket: string }
  | { "x-oss-credential": string }
  | { "x-oss-signature-version": OssSignatureVersion }
  | { "x-oss-date": string }
  | { "x-oss-security-token": string };

export interface OssPolicy {
  expiration: string;
  conditions: OssPolicyCondition[];
}

export interface OssGetSignatureInput {
  userId: number;
  dir?: string;
  expiresInSeconds?: number;
}

export interface OssGetSignatureResult {
  host: string;
  policy: string;
  x_oss_signature_version: OssSignatureVersion;
  x_oss_credential: string;
  x_oss_date: string;
  signature: string;
  dir: string;
  security_token: string;
}

export interface OssUploadInput {
  path: string;
  filename: string;
}

export interface OssUploadBufferInput extends OssUploadInput {
  buffer: Buffer;
}

export interface OssUploadNetworkFileInput extends OssUploadInput {
  url: string;
}

export interface OssUploadNetworkFileResult {
  url: string;
}

export interface OssDeleteFilesInput {
  paths: string[];
}

export interface OssDeleteFilesResult {
  success: boolean;
}

export interface OssTemporaryCredentials {
  AccessKeyId: string;
  AccessKeySecret: string;
  SecurityToken: string;
}
