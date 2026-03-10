// Export Drizzle table schemas here as they are created:
// export { users } from "./user";

// 这里的定义仅供模版参考，实际的表结构和字段请根据你的需求进行设计和调整。
export type {
  AuditReport,
  BacklinksAnalysisResult,
  ContentAnalysisResult,
  CrawledPageData,
  EeatAnalysisResult,
  HeadingNode,
  Issue,
  Recommendation,
  TechnicalAnalysisResult,
  UxAnalysisResult,
} from "./audit-results";
export { auditResults } from "./audit-results";
export { auditTaskStatusEnum, auditTasks } from "./audit-tasks";
export { siteAuditSnapshots } from "./site-audit-snapshots";
export type { SiteConfig } from "./sites";
export { sites } from "./sites";
