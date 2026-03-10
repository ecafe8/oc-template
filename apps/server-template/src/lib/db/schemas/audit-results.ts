import { index, integer, jsonb, pgTable, real, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { auditTasks } from "./audit-tasks";
import { sites } from "./sites";

/**
 * Full GEO audit report stored as JSONB.
 * One record per completed audit run.
 */
export const auditResults = pgTable(
  "audit_results",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    taskId: uuid("task_id")
      .notNull()
      .references(() => auditTasks.id, { onDelete: "cascade" }),
    siteId: uuid("site_id").references(() => sites.id, { onDelete: "set null" }),
    url: varchar("url", { length: 2048 }).notNull(),

    /** Overall GEO Index score 0-100 */
    geoIndex: real("geo_index").notNull(),

    /** Dimension scores 0-100 */
    technicalSeoScore: real("technical_seo_score").notNull(),
    contentQualityScore: real("content_quality_score").notNull(),
    eeatScore: real("eeat_score").notNull(),
    backlinksScore: real("backlinks_score").notNull(),
    uxScore: real("ux_score").notNull(),

    /**
     * Full report payload:
     * {
     *   technical: TechnicalAnalysisResult,
     *   content: ContentAnalysisResult,
     *   eeat: EeatAnalysisResult,
     *   backlinks: BacklinksAnalysisResult,
     *   ux: UxAnalysisResult,
     *   recommendations: Recommendation[],
     *   rawData: CrawledPageData,
     * }
     */
    report: jsonb("report").notNull().$type<AuditReport>(),

    /** How long the full audit took in milliseconds */
    durationMs: integer("duration_ms"),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index("idx_audit_results_task_id").on(t.taskId),
    index("idx_audit_results_site_id").on(t.siteId),
    index("idx_audit_results_geo_index").on(t.geoIndex),
    index("idx_audit_results_created_at").on(t.createdAt),
  ],
);

// ---- Type definitions for the JSONB report field ----

export interface AuditReport {
  technical: TechnicalAnalysisResult;
  content: ContentAnalysisResult;
  eeat: EeatAnalysisResult;
  backlinks: BacklinksAnalysisResult;
  ux: UxAnalysisResult;
  recommendations: Recommendation[];
  rawData: CrawledPageData;
}

export interface TechnicalAnalysisResult {
  score: number;
  title: string | null;
  titleLength: number | null;
  description: string | null;
  descriptionLength: number | null;
  h1Count: number;
  h1Text: string | null;
  canonicalUrl: string | null;
  robotsMeta: string | null;
  openGraphTags: Record<string, string>;
  twitterCardTags: Record<string, string>;
  structuredDataCount: number;
  httpsEnabled: boolean;
  issues: Issue[];
}

export interface ContentAnalysisResult {
  score: number;
  wordCount: number;
  readabilityScore: number | null;
  headingStructure: HeadingNode[];
  paragraphCount: number;
  imageCount: number;
  imagesWithAlt: number;
  internalLinkCount: number;
  externalLinkCount: number;
  keywordDensity: Record<string, number>;
  issues: Issue[];
}

export interface EeatAnalysisResult {
  score: number;
  hasAuthorInfo: boolean;
  hasPublishDate: boolean;
  hasUpdateDate: boolean;
  hasSources: boolean;
  hasAboutPage: boolean;
  hasContactPage: boolean;
  hasPrivacyPolicy: boolean;
  hasTermsOfService: boolean;
  schemaTypes: string[];
  issues: Issue[];
}

export interface BacklinksAnalysisResult {
  score: number;
  /** Placeholder — real backlink data requires external API (Moz/Ahrefs) */
  note: string;
  issues: Issue[];
}

export interface UxAnalysisResult {
  score: number;
  viewportMetaPresent: boolean;
  loadTimeEstimate: number | null;
  mobileOptimized: boolean;
  issues: Issue[];
}

export interface Issue {
  code: string;
  severity: "critical" | "warning" | "info";
  message: string;
  detail?: string;
}

export interface Recommendation {
  dimension: "technical_seo" | "content_quality" | "eeat" | "backlinks" | "ux";
  priority: "high" | "medium" | "low";
  title: string;
  description: string;
}

export interface HeadingNode {
  level: number;
  text: string;
}

export interface CrawledPageData {
  url: string;
  finalUrl: string;
  statusCode: number;
  html: string;
  markdown: string;
  screenshot?: string;
  loadTimeMs: number;
  headers: Record<string, string>;
}
