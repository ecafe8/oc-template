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
} from "../controllers/sites.controller";

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
  .get("/sites", describeRoute(honoDescribeRoute("Sites")), listSitesHandler)
  .post("/sites", describeRoute(honoDescribeRoute("Sites")), createSiteHandler)
  .get("/sites/:siteId", describeRoute(honoDescribeRoute("Sites")), getSiteHandler)
  .patch("/sites/:siteId", describeRoute(honoDescribeRoute("Sites")), updateSiteHandler)
  .delete("/sites/:siteId", describeRoute(honoDescribeRoute("Sites")), deleteSiteHandler)
  .post("/sites/:siteId/audit", describeRoute(honoDescribeRoute("Sites")), triggerSiteAuditHandler)
  .get("/sites/:siteId/audits", describeRoute(honoDescribeRoute("Sites")), listSiteAuditsHandler)
  .get("/sites/:siteId/trend", describeRoute(honoDescribeRoute("Sites")), getSiteTrendHandler);

export type RPCSitesRoutesType = typeof sitesRoutes;
