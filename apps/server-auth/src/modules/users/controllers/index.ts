import { ErrorCodes } from "@server/auth/errors/error-codes";
import { auth } from "@server/auth/lib/auth";
import { fail, success } from "@server/auth/utils/response";
import type { Context } from "hono";
import { getUserFromHeaders, updateUser } from "../services";
import type { ChangePasswordInput, UpdateUserInput } from "../dto";

export async function getMeController(c: Context): Promise<Response> {
  const user = await getUserFromHeaders(c.req.raw.headers);
  if (!user) {
    return fail(c, ErrorCodes.AUTH_UNAUTHORIZED, "Unauthenticated", 401);
  }
  return success(c, user);
}

export async function updateMeController(c: Context): Promise<Response> {
  const body = (c.req as { valid: (target: "json") => UpdateUserInput }).valid("json");
  const updated = await updateUser(c.req.raw.headers, body);
  if (!updated) {
    return fail(c, ErrorCodes.AUTH_UNAUTHORIZED, "Unauthenticated", 401);
  }
  return success(c, updated);
}

export async function changePasswordController(c: Context): Promise<Response> {
  const body = (c.req as { valid: (target: "json") => ChangePasswordInput }).valid("json");
  try {
    await auth.api.changePassword({ body, headers: c.req.raw.headers });
    return success(c, null);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Change password failed";
    return fail(c, ErrorCodes.BAD_REQUEST, message, 400);
  }
}
