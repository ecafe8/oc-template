import { index, pgTable, real, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { auditResults } from "./audit-results";
import { sites } from "./sites";

/**
 * Lightweight time-series snapshots for trend queries.
 * One row per completed audit linked to a registered site.
 * Avoids full report JSONB scans for trend/dashboard queries.
 */
export const siteAuditSnapshots = pgTable(
  "site_audit_snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    siteId: uuid("site_id")
      .notNull()
      .references(() => sites.id, { onDelete: "cascade" }),
    auditResultId: uuid("audit_result_id")
      .notNull()
      .references(() => auditResults.id, { onDelete: "cascade" }),

    /** Snapshot of overall GEO Index at time of audit */
    geoIndex: real("geo_index").notNull(),
    technicalSeoScore: real("technical_seo_score").notNull(),
    contentQualityScore: real("content_quality_score").notNull(),
    eeatScore: real("eeat_score").notNull(),
    backlinksScore: real("backlinks_score").notNull(),
    uxScore: real("ux_score").notNull(),

    /** URL audited (may differ from site base URL) */
    url: varchar("url", { length: 2048 }).notNull(),

    auditedAt: timestamp("audited_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_site_audit_snapshots_site_id").on(t.siteId),
    index("idx_site_audit_snapshots_audited_at").on(t.auditedAt),
    index("idx_site_audit_snapshots_site_audited").on(t.siteId, t.auditedAt),
  ],
);
