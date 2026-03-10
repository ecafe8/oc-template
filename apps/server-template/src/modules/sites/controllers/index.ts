import { ValidationError } from "@repo/server-template/errors/app-error";
import { success } from "@repo/server-template/utils/response";
import type { Context } from "hono";
import { z } from "zod";
import {
  createSite,
  deleteSite,
  getSite,
  getSiteTrend,
  listSiteAudits,
  listSites,
  triggerSiteAudit,
  updateSite,
} from "../services";

const CreateSiteSchema = z.object({
  url: z.string().url("Must be a valid URL"),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  config: z
    .object({
      crawlDepth: z.number().int().min(1).max(5).optional(),
      userAgent: z.string().optional(),
      ignorePaths: z.array(z.string()).optional(),
      scheduleCron: z.string().optional(),
      screenshotEnabled: z.boolean().optional(),
    })
    .optional(),
});

const UpdateSiteSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  config: z
    .object({
      crawlDepth: z.number().int().min(1).max(5).optional(),
      userAgent: z.string().optional(),
      ignorePaths: z.array(z.string()).optional(),
      scheduleCron: z.string().optional(),
      screenshotEnabled: z.boolean().optional(),
    })
    .optional(),
});

const PaginationSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const TrendSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
});

export async function listSitesHandler(c: Context): Promise<Response> {
  const query = PaginationSchema.safeParse(c.req.query());
  if (!query.success) throw new ValidationError("Invalid query params", z.treeifyError(query.error));

  const result = await listSites(query.data);
  return success(c, result);
}

export async function createSiteHandler(c: Context): Promise<Response> {
  const body = await c.req.json().catch(() => ({}));
  const input = CreateSiteSchema.safeParse(body);
  if (!input.success) throw new ValidationError("Invalid request body", z.treeifyError(input.error));

  const site = await createSite(input.data);
  return success(c, site, "Site created", 201);
}

export async function getSiteHandler(c: Context): Promise<Response> {
  const siteId = c.req.param("siteId") ?? "";
  const site = await getSite(siteId);
  return success(c, site);
}

export async function updateSiteHandler(c: Context): Promise<Response> {
  const siteId = c.req.param("siteId") ?? "";
  const body = await c.req.json().catch(() => ({}));
  const input = UpdateSiteSchema.safeParse(body);
  if (!input.success) throw new ValidationError("Invalid request body", z.treeifyError(input.error));

  const site = await updateSite(siteId, input.data);
  return success(c, site, "Site updated");
}

export async function deleteSiteHandler(c: Context): Promise<Response> {
  const siteId = c.req.param("siteId") ?? "";
  await deleteSite(siteId);
  return success(c, null, "Site deleted");
}

export async function triggerSiteAuditHandler(c: Context): Promise<Response> {
  const siteId = c.req.param("siteId") ?? "";
  const result = await triggerSiteAudit(siteId);
  return success(c, result, "Audit started", 202);
}

export async function listSiteAuditsHandler(c: Context): Promise<Response> {
  const siteId = c.req.param("siteId") ?? "";
  const query = PaginationSchema.safeParse(c.req.query());
  if (!query.success) throw new ValidationError("Invalid query params", z.treeifyError(query.error));

  const result = await listSiteAudits(siteId, query.data);
  return success(c, result);
}

export async function getSiteTrendHandler(c: Context): Promise<Response> {
  const siteId = c.req.param("siteId") ?? "";
  const query = TrendSchema.safeParse(c.req.query());
  if (!query.success) throw new ValidationError("Invalid query params", z.treeifyError(query.error));

  const data = await getSiteTrend(siteId, query.data.limit);
  return success(c, data);
}
