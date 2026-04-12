import { honoDescribeRoute } from "@repo/server-template/utils/hono";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import {
  createSiteHandler,
  deleteSiteHandler,
  getSiteHandler,
  getSiteTrendHandler,
  listSiteAuditsHandler,
  listSitesHandler,
  triggerSiteAuditHandler,
  updateSiteHandler,
} from "../controllers";

/**
 * Sites routes — mounted at /api
 *
 * GET    /sites                        List all sites
 * POST   /sites                        Create a site
 * GET    /sites/:siteId                Get a site
 * PATCH  /sites/:siteId                Update a site
 * DELETE /sites/:siteId                Delete a site (soft)
 * POST   /sites/:siteId/audit          Trigger audit for a site
 * GET    /sites/:siteId/audits         List audits for a site
 * GET    /sites/:siteId/trend          GEO Index trend data
 */
export const sitesRoutes = new Hono()
  .get("/sites", describeRoute(honoDescribeRoute("Sites")), (c) => listSitesHandler(c))
  .post("/sites", describeRoute(honoDescribeRoute("Sites")), (c) => createSiteHandler(c))
  .get("/sites/:siteId", describeRoute(honoDescribeRoute("Sites")), (c) => getSiteHandler(c))
  .patch("/sites/:siteId", describeRoute(honoDescribeRoute("Sites")), (c) => updateSiteHandler(c))
  .delete("/sites/:siteId", describeRoute(honoDescribeRoute("Sites")), (c) => deleteSiteHandler(c))
  .post("/sites/:siteId/audit", describeRoute(honoDescribeRoute("Sites")), (c) => triggerSiteAuditHandler(c))
  .get("/sites/:siteId/audits", describeRoute(honoDescribeRoute("Sites")), (c) => listSiteAuditsHandler(c))
  .get("/sites/:siteId/trend", describeRoute(honoDescribeRoute("Sites")), (c) => getSiteTrendHandler(c));

export type RPCSitesRoutesType = typeof sitesRoutes;
