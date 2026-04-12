import { zValidator } from "@hono/zod-validator";
import { honoDescribeRoute } from "@server/auth/utils/hono";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { changePasswordController, getMeController, updateMeController } from "../controllers";
import { ChangePasswordSchema, UpdateUserSchema } from "../dto";

const TAG = "Users";

export const usersRoutes = new Hono()
  .basePath("/me")
  // -------------------------------------------------------------------------
  // GET /users/me — get current user profile
  // -------------------------------------------------------------------------
  .get(
    "/",
    describeRoute(
      honoDescribeRoute({
        tag: TAG,
        summary: "Get current user profile",
      }),
    ),
    getMeController,
  )
  // -------------------------------------------------------------------------
  // PATCH /users/me — update current user profile
  // -------------------------------------------------------------------------
  .patch(
    "/",
    describeRoute(
      honoDescribeRoute({
        tag: TAG,
        summary: "Update current user profile",
        bodyZod: UpdateUserSchema,
      }),
    ),
    zValidator("json", UpdateUserSchema),
    updateMeController,
  )
  // -------------------------------------------------------------------------
  // POST /users/me/change-password — change password
  // -------------------------------------------------------------------------
  .post(
    "/change-password",
    describeRoute(
      honoDescribeRoute({
        tag: TAG,
        summary: "Change user password",
        bodyZod: ChangePasswordSchema,
      }),
    ),
    zValidator("json", ChangePasswordSchema),
    changePasswordController,
  );

export type RPCUsersRoutesType = typeof usersRoutes;
