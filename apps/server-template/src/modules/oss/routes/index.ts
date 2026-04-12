import { honoDescribeRoute } from "@repo/server-template/utils/hono";
import { Hono } from "hono";
import { validator } from "hono/validator";
import { describeRoute } from "hono-openapi";
import { deleteOssFilesHandler, generateOssSignatureHandler, uploadOssNetworkFileHandler } from "../controllers";
import {
  deleteFilesRequestZod,
  deleteFilesResultZod,
  ossGetSignatureInputZod,
  ossGetSignatureResultZod,
  uploadNetworkFileResultZod,
  uploadNetworkFileZod,
} from "../schema";

/**
 * OSS routes — mounted at /api
 *
 * POST /oss/signature      Generate direct-upload signature
 * POST /oss/network-file   Upload a remote file through backend
 * POST /oss/delete         Delete OSS objects in batch
 */
export const ossRoutes = new Hono()
  .post(
    "/oss/signature",
    describeRoute(honoDescribeRoute("OSS", ossGetSignatureResultZod)),
    validator("json", (value) => ossGetSignatureInputZod.parse(value)),
    (c) => generateOssSignatureHandler(c),
  )
  .post(
    "/oss/network-file",
    describeRoute(honoDescribeRoute("OSS", uploadNetworkFileResultZod)),
    validator("json", (value) => uploadNetworkFileZod.parse(value)),
    (c) => uploadOssNetworkFileHandler(c),
  )
  .post(
    "/oss/delete",
    describeRoute(honoDescribeRoute("OSS", deleteFilesResultZod)),
    validator("json", (value) => deleteFilesRequestZod.parse(value)),
    (c) => deleteOssFilesHandler(c),
  );

export type RPCOssRoutesType = typeof ossRoutes;
