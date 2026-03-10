import { index, jsonb, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

/**
 * Registered sites managed by the user.
 * Each site can have multiple audits over time.
 */
export const sites = pgTable(
  "audit_sites",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: varchar("url", { length: 2048 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    /** JSON config: crawlDepth, userAgent, ignorePaths[], scheduleCron, etc. */
    config: jsonb("config").default({}).$type<SiteConfig>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (t) => [index("idx_audit_sites_url").on(t.url), index("idx_audit_sites_deleted_at").on(t.deletedAt)],
);

export interface SiteConfig {
  crawlDepth?: number;
  userAgent?: string;
  ignorePaths?: string[];
  scheduleCron?: string;
  screenshotEnabled?: boolean;
}
