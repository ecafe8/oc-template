import { z } from "zod";
import "dotenv/config";

const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4999),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),

  // BetterAuth
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters long"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:4999"),
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string().url().default("http://localhost:4999"),
  BETTER_AUTH_CROSS_SUBDOMAIN: z.string().default(""),
  BETTER_AUTH_TRUSTED_ORIGINS: z
    .string()
    .default("http://localhost:3000")
    .transform((val) => val.split(",").map((origin) => origin.trim())),

  // Organization invite JWT secret (optional, defaults to BETTER_AUTH_SECRET)
  BETTER_AUTH_ORGANIZATION_INVITE_SECRET: z.string().optional(),

  // Internal service-to-service secret — used to protect /api/internal/* endpoints.
  // Generate with: openssl rand -base64 32
  INTERNAL_API_SECRET: z.string().min(32, "INTERNAL_API_SECRET must be at least 32 characters"),

  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Auth: Invalid environment variables:");
  console.error(z.treeifyError(parsed.error));
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;
