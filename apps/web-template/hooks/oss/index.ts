"use client";

import type { ApiMutationOptions } from "@repo/web-template/app/api/rpc";
import { type OssSignatureInput, signatureOssApi } from "@repo/web-template/app/api/rpc";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export interface OssUploadInput {
  userId: number;
  file: File;
  dir?: string;
  filename?: string;
  expiresInSeconds?: number;
  onProgress?: (progress: number) => void;
}

export interface OssUploadResult {
  host: string;
  dir: string;
  key: string;
  url: string;
  filename: string;
}

function buildObjectKey(dir: string, filename: string): string {
  const normalizedDir = dir.endsWith("/") ? dir : `${dir}/`;
  return `${normalizedDir}${filename}`;
}

function createSignatureRequest(input: OssUploadInput): OssSignatureInput {
  return {
    json: {
      userId: input.userId,
      dir: input.dir,
      expiresInSeconds: input.expiresInSeconds,
    },
  };
}

function uploadToOssWithProgress(
  host: string,
  formData: FormData,
  onProgress?: (progress: number) => void,
): Promise<void> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.open("POST", host);
    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        return;
      }

      onProgress?.(Math.round((event.loaded / event.total) * 100));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve();
        return;
      }

      reject(new Error(`OSS upload failed with status ${xhr.status}`));
    };
    xhr.onerror = () => {
      reject(new Error("OSS upload failed due to a network error"));
    };
    xhr.send(formData);
  });
}

/**
 * 先向后端申请签名，再由浏览器直传文件到 OSS。
 */
export async function uploadFileToOss(input: OssUploadInput): Promise<OssUploadResult> {
  const signature = await signatureOssApi(createSignatureRequest(input));
  const filename = input.filename ?? input.file.name;
  const key = buildObjectKey(signature.dir, filename);
  const formData = new FormData();

  formData.set("success_action_status", "200");
  formData.set("key", key);
  formData.set("policy", signature.policy);
  formData.set("signature", signature.signature);
  formData.set("x-oss-signature-version", signature.x_oss_signature_version);
  formData.set("x-oss-credential", signature.x_oss_credential);
  formData.set("x-oss-date", signature.x_oss_date);
  formData.set("file", input.file);
  if (signature.security_token) {
    formData.set("x-oss-security-token", signature.security_token);
  }

  await uploadToOssWithProgress(signature.host, formData, input.onProgress);

  return {
    host: signature.host,
    dir: signature.dir,
    key,
    url: `${signature.host}/${key}`,
    filename,
  };
}

/**
 * 提供前端直传 OSS 的 mutation 封装，并暴露上传进度。
 */
export function useOssUpload(options?: ApiMutationOptions<OssUploadResult, OssUploadInput>) {
  const [progress, setProgress] = useState(0);
  const { onSuccess, onError, onSettled, ...mutationOptions } = options ?? {};

  const mutation = useMutation({
    mutationFn: async (input: OssUploadInput) => {
      setProgress(0);

      return uploadFileToOss({
        ...input,
        onProgress: (nextProgress) => {
          setProgress(nextProgress);
          input.onProgress?.(nextProgress);
        },
      });
    },
    onSuccess: (data, variables, onMutateResult, context) => {
      setProgress(100);
      onSuccess?.(data, variables, onMutateResult, context);
    },
    onError: (error, variables, onMutateResult, context) => {
      setProgress(0);
      onError?.(error, variables, onMutateResult, context);
    },
    onSettled: (data, error, variables, onMutateResult, context) => {
      onSettled?.(data, error, variables, onMutateResult, context);
    },
    ...mutationOptions,
  });

  return {
    ...mutation,
    progress,
  };
}
