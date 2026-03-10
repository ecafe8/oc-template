import { db } from "@repo/server-template/lib/db";
import type { SiteConfig } from "@repo/server-template/lib/db/schemas";
import { auditResults, siteAuditSnapshots, sites } from "@repo/server-template/lib/db/schemas";
// import { startAudit } from "@repo/server-template/modules/audit/services/audit.service";
import { and, desc, eq, isNull } from "drizzle-orm";
import { SiteNotFoundError, SiteUrlDuplicateError } from "../errors/sites.errors";

export interface CreateSiteInput {
  url: string;
  name: string;
  description?: string;
  config?: SiteConfig;
}

export interface UpdateSiteInput {
  name?: string;
  description?: string;
  config?: SiteConfig;
}

/**
 * Creates a new site. Checks for duplicate URL first.
 */
export async function createSite(input: CreateSiteInput): Promise<typeof sites.$inferSelect> {
  // Check duplicate URL (only among non-deleted sites)
  const [existing] = await db
    .select({ id: sites.id })
    .from(sites)
    .where(and(eq(sites.url, input.url), isNull(sites.deletedAt)))
    .limit(1);

  if (existing) throw new SiteUrlDuplicateError(input.url);

  const [site] = await db
    .insert(sites)
    .values({
      url: input.url,
      name: input.name,
      description: input.description,
      config: input.config ?? {},
    })
    .returning();

  if (!site) throw new Error("Failed to create site");
  return site;
}

/**
 * Lists all non-deleted sites.
 */
export async function listSites(options: { limit?: number; offset?: number } = {}): Promise<{
  data: (typeof sites.$inferSelect)[];
  total: number;
}> {
  const { limit = 20, offset = 0 } = options;

  const data = await db
    .select()
    .from(sites)
    .where(isNull(sites.deletedAt))
    .orderBy(desc(sites.createdAt))
    .limit(limit)
    .offset(offset);

  return { data, total: data.length };
}

/**
 * Gets a single site by ID.
 */
export async function getSite(siteId: string): Promise<typeof sites.$inferSelect> {
  const [site] = await db
    .select()
    .from(sites)
    .where(and(eq(sites.id, siteId), isNull(sites.deletedAt)))
    .limit(1);

  if (!site) throw new SiteNotFoundError(siteId);
  return site;
}

/**
 * Updates a site's metadata.
 */
export async function updateSite(siteId: string, input: UpdateSiteInput): Promise<typeof sites.$inferSelect> {
  await getSite(siteId); // validate existence

  const [updated] = await db
    .update(sites)
    .set({ ...input, updatedAt: new Date() })
    .where(eq(sites.id, siteId))
    .returning();

  if (!updated) throw new Error("Failed to update site");
  return updated;
}

/**
 * Soft-deletes a site.
 */
export async function deleteSite(siteId: string): Promise<void> {
  await getSite(siteId); // validate existence
  await db.update(sites).set({ deletedAt: new Date() }).where(eq(sites.id, siteId));
}

/**
 * Triggers a new audit for a site.
 */
export async function triggerSiteAudit(siteId: string): Promise<{ taskId: string }> {
  const site = await getSite(siteId);
  // return startAudit({ url: site.url, siteId });
  return { taskId: "dummy-task-id" };
}

/**
 * Lists audit results for a site (newest first).
 */
export async function listSiteAudits(
  siteId: string,
  options: { limit?: number; offset?: number } = {},
): Promise<{ data: (typeof auditResults.$inferSelect)[]; total: number }> {
  await getSite(siteId);

  const { limit = 20, offset = 0 } = options;

  const data = await db
    .select()
    .from(auditResults)
    .where(eq(auditResults.siteId, siteId))
    .orderBy(desc(auditResults.createdAt))
    .limit(limit)
    .offset(offset);

  return { data, total: data.length };
}

/**
 * Returns time-series GEO Index trend data for a site.
 */
export async function getSiteTrend(siteId: string, limit = 30): Promise<(typeof siteAuditSnapshots.$inferSelect)[]> {
  await getSite(siteId);

  return db
    .select()
    .from(siteAuditSnapshots)
    .where(eq(siteAuditSnapshots.siteId, siteId))
    .orderBy(desc(siteAuditSnapshots.auditedAt))
    .limit(limit);
}
