import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3100),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // Auth
  AUTH_SERVICE_URL: z.string().url().default("http://localhost:4999"),
  INTERNAL_API_SECRET: z.string().min(32, "INTERNAL_API_SECRET must be at least 32 characters"),

  // CORS
  CORS_ORIGINS: z.string().default("http://localhost:3399"),

  // Rate Limiting
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(60_000),

  // OSS
  OSS_BUCKET: z.string().min(1, "OSS_BUCKET is required"),
  OSS_REGION: z.string().min(1, "OSS_REGION is required"),
  OSS_ACCESS_KEY_ID: z.string().min(1, "OSS_ACCESS_KEY_ID is required"),
  OSS_ACCESS_KEY_SECRET: z.string().min(1, "OSS_ACCESS_KEY_SECRET is required"),
  OSS_STS_ROLE_ARN: z.string().min(1, "OSS_STS_ROLE_ARN is required"),
  OSS_UPLOAD_DIR_PREFIX: z.string().min(1).default("ai_apm_im/attachments"),
  OSS_STS_SESSION_NAME: z.string().min(1).default("server-template"),
  OSS_STS_EXPIRES_IN_SECONDS: z.coerce.number().int().min(900).max(43_200).default(3600),
  OSS_SIGNATURE_EXPIRES_IN_SECONDS: z.coerce.number().int().min(1).max(3600).default(600),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid environment variables:");
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
