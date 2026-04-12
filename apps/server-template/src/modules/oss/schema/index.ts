import { OSS_SIGNATURE_VERSION } from "@repo/server-template/modules/oss/types";
import { z } from "zod";

export const ossGetSignatureInputZod = z.object({
  userId: z.number().int().positive(),
  dir: z.string().min(1).optional(),
  expiresInSeconds: z.number().int().min(1).max(3600).optional(),
});

export const ossGetSignatureResultZod = z.object({
  host: z.string(),
  policy: z.string(),
  x_oss_signature_version: z.literal(OSS_SIGNATURE_VERSION),
  x_oss_credential: z.string(),
  x_oss_date: z.string(),
  signature: z.string(),
  dir: z.string(),
  security_token: z.string(),
});

export const uploadNetworkFileZod = z.object({
  url: z.string().url(),
  path: z.string().min(1),
  filename: z.string().min(1),
});

export const uploadNetworkFileResultZod = z.object({
  url: z.string().url(),
});

export const uploadBufferZod = z.object({
  buffer: z.instanceof(Buffer),
  path: z.string().min(1),
  filename: z.string().min(1),
});

export const deleteFilesZod = z.array(z.string().min(1));

export const deleteFilesRequestZod = z.object({
  paths: deleteFilesZod.min(1),
});

export const deleteFilesResultZod = z.object({
  success: z.boolean(),
});
