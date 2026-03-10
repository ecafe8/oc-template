import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { env } from "../../config/env";

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export const db = drizzle({
  client: pool,
});
