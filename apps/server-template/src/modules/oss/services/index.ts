import { env } from "@repo/server-template/config/env";
import { OssDownloadError, OssUploadError } from "@repo/server-template/modules/oss/errors";
import {
  buildOssObjectKey,
  ensureOssRegion,
  formatOssDate,
  getCredential,
  getStandardRegion,
  normalizeOssDir,
  policy2Str,
} from "@repo/server-template/modules/oss/helpers";
import {
  OSS_SIGNATURE_VERSION,
  type OssGetSignatureInput,
  type OssGetSignatureResult,
  type OssPolicy,
  type OssTemporaryCredentials,
} from "@repo/server-template/modules/oss/types";
import { logger } from "@repo/server-template/utils/logger";

// @ts-expect-error ali-oss does not expose stable ESM typings in this workspace.
import OSS from "ali-oss";

interface OssClientOptions {
  bucket: string;
  region: string;
  accessKeyId: string;
  accessKeySecret: string;
  authorizationV4?: boolean;
  secure?: boolean;
  stsToken?: string;
}

interface OssClientInstance {
  options: OssClientOptions;
  deleteMulti(paths: string[], options?: { quiet?: boolean }): Promise<unknown>;
  put(name: string, value: Buffer): Promise<{ url?: string }>;
  signPostObjectPolicyV4(policy: OssPolicy | string, date: Date): string;
}

interface OssAssumeRoleResult {
  credentials: OssTemporaryCredentials;
}

interface OssStsInstance {
  assumeRole(roleArn: string, policy: string, expiration: number, sessionName: string): Promise<OssAssumeRoleResult>;
}

interface OssSdkConstructor {
  new (options: OssClientOptions): OssClientInstance;
  STS: new (options: { accessKeyId: string; accessKeySecret: string }) => OssStsInstance;
}

const OssSdk = OSS as unknown as OssSdkConstructor;

/**
 * 兼容旧调用方式，统一解析签名生成入参。
 */
function resolveSignatureInput(input: number | OssGetSignatureInput): OssGetSignatureInput {
  if (typeof input === "number") {
    return { userId: input };
  }

  return input;
}

/**
 * 根据 bucket 和 region 拼接公开访问域名。
 */
function getPublicHost(bucket: string, region: string): string {
  return `https://${bucket}.${ensureOssRegion(region)}.aliyuncs.com`;
}

class OssService {
  private readonly _client: OssClientInstance;

  constructor() {
    this._client = this.createClient({
      accessKeyId: env.OSS_ACCESS_KEY_ID,
      accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
    });
  }

  /**
   * 创建 OSS 客户端，支持长期凭证和 STS 临时凭证两种场景。
   */
  private createClient(credentials: {
    accessKeyId: string;
    accessKeySecret: string;
    stsToken?: string;
  }): OssClientInstance {
    return new OssSdk({
      bucket: env.OSS_BUCKET,
      region: ensureOssRegion(env.OSS_REGION),
      accessKeyId: credentials.accessKeyId,
      accessKeySecret: credentials.accessKeySecret,
      stsToken: credentials.stsToken,
      authorizationV4: true,
      secure: true,
    });
  }

  /**
   * 通过 STS AssumeRole 获取临时访问凭证，用于前端直传签名。
   */
  private async getTemporaryCredentials(): Promise<OssTemporaryCredentials> {
    const sts = new OssSdk.STS({
      accessKeyId: env.OSS_ACCESS_KEY_ID,
      accessKeySecret: env.OSS_ACCESS_KEY_SECRET,
    });

    const result = await sts.assumeRole(
      env.OSS_STS_ROLE_ARN,
      "",
      env.OSS_STS_EXPIRES_IN_SECONDS,
      env.OSS_STS_SESSION_NAME,
    );

    return result.credentials;
  }

  /**
   * 解析上传目录，统一追加项目级上传前缀。
   */
  private resolveUploadDir(path: string): string {
    return normalizeOssDir(env.OSS_UPLOAD_DIR_PREFIX, path);
  }

  /**
   * 生成最终上传对象 Key，并在结果为空时直接阻断。
   */
  private resolveObjectKey(path: string, filename: string): string {
    const key = buildOssObjectKey(env.OSS_UPLOAD_DIR_PREFIX, path, filename);

    if (!key) {
      throw new OssUploadError("OSS object key cannot be empty");
    }

    return key;
  }

  /**
   * 生成前端直传 OSS 所需的表单签名参数。
   */
  async generateSignature(userId: number): Promise<OssGetSignatureResult>;
  async generateSignature(input: OssGetSignatureInput): Promise<OssGetSignatureResult>;
  async generateSignature(input: number | OssGetSignatureInput): Promise<OssGetSignatureResult> {
    const resolvedInput = resolveSignatureInput(input);
    const now = new Date();
    const expirationDate = new Date(
      now.getTime() + (resolvedInput.expiresInSeconds ?? env.OSS_SIGNATURE_EXPIRES_IN_SECONDS) * 1000,
    );
    const xOssDate = formatOssDate(now);
    const credentials = await this.getTemporaryCredentials();
    const client = this.createClient({
      accessKeyId: credentials.AccessKeyId,
      accessKeySecret: credentials.AccessKeySecret,
      stsToken: credentials.SecurityToken,
    });
    const credential = getCredential(
      xOssDate.split("T")[0] ?? "",
      getStandardRegion(client.options.region),
      client.options.accessKeyId,
    );
    const dir = normalizeOssDir(resolvedInput.dir ?? `${env.OSS_UPLOAD_DIR_PREFIX}/${resolvedInput.userId}`);
    const policy: OssPolicy = {
      expiration: expirationDate.toISOString(),
      conditions: [
        { bucket: env.OSS_BUCKET },
        { "x-oss-credential": credential },
        { "x-oss-signature-version": OSS_SIGNATURE_VERSION },
        { "x-oss-date": xOssDate },
        { "x-oss-security-token": credentials.SecurityToken },
      ],
    };
    const policyBase64 = Buffer.from(policy2Str(policy), "utf8").toString("base64");
    const signature = client.signPostObjectPolicyV4(policy, now);

    return {
      host: getPublicHost(client.options.bucket, client.options.region),
      policy: policyBase64,
      x_oss_signature_version: OSS_SIGNATURE_VERSION,
      x_oss_credential: credential,
      x_oss_date: xOssDate,
      signature,
      dir,
      security_token: credentials.SecurityToken,
    };
  }

  /**
   * 批量删除 OSS 文件，删除失败时记录日志并返回 false。
   */
  async deleteFiles(paths: string[]): Promise<boolean> {
    const normalizedPaths = paths.map((path) => path.replace(/^\/+/g, "").trim()).filter(Boolean);

    if (normalizedPaths.length === 0) {
      return true;
    }

    try {
      await this._client.deleteMulti(normalizedPaths, { quiet: true });
      return true;
    } catch (error) {
      logger.error({ err: error, paths: normalizedPaths }, "Failed to delete OSS files");
      return false;
    }
  }

  /**
   * 先下载远程文件，再上传到 OSS。
   */
  async uploadNetworkFile(url: string, path: string, filename: string): Promise<string> {
    let response: Response;

    try {
      response = await fetch(url);
    } catch (error) {
      logger.error({ err: error, url }, "Failed to download remote file before OSS upload");
      throw new OssDownloadError("Failed to download the remote file", { url });
    }

    if (!response.ok) {
      throw new OssDownloadError(`Download failed with status ${response.status}`, { status: response.status, url });
    }

    const arrayBuffer = await response.arrayBuffer();

    if (arrayBuffer.byteLength === 0) {
      throw new OssDownloadError("Downloaded file is empty", { url });
    }

    return this.uploadBuffer(Buffer.from(arrayBuffer), path, filename);
  }

  /**
   * 将内存中的 Buffer 直接上传到 OSS，并返回可访问地址。
   */
  async uploadBuffer(buffer: Buffer, path: string, filename: string): Promise<string> {
    const key = this.resolveObjectKey(path, filename);

    try {
      const result = await this._client.put(key, buffer);
      return result.url ?? `${getPublicHost(this._client.options.bucket, this._client.options.region)}/${key}`;
    } catch (error) {
      logger.error({ err: error, key, dir: this.resolveUploadDir(path) }, "Failed to upload buffer to OSS");
      throw new OssUploadError("Failed to upload file to OSS", { key });
    }
  }
}

export const ossService = new OssService();
