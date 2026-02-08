import type { HttpBindings } from "@hono/node-server";

/** Variables injected by middleware into Hono's context */
export interface AppVariables {
  requestId: string;
  userId?: string;
  userRole?: string;
}

/** Full Hono environment type used in `new Hono<AppEnv>()` */
export interface AppEnv {
  Bindings: HttpBindings;
  Variables: AppVariables;
}
