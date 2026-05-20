# Server Template


## Description
This is a template for creating a server application using Bun. It provides a basic structure and setup to get you started quickly.

## Getting Started
```
bun install
bun run dev
```

## Auth Integration

`server-template` no longer verifies local JWTs by itself. It delegates auth validation to `apps/server-auth`.

Required env:

```bash
AUTH_SERVICE_URL=http://localhost:4999
INTERNAL_API_SECRET=the-same-secret-configured-in-server-auth
```

Request flow:

- Browser sends session cookie or bearer token to `server-template`
- `server-template` forwards auth headers to `server-auth /api/internal/verify`
- `server-auth` returns the resolved user
- `server-template` injects `userId` into Hono context

## RPC Types
生成 RPC 类型导出：

```bash
bun run gen:rpc-type
```

说明：
- 该脚本会生成 `exports/rpc.ts` 供 web 侧 RPC 代码生成使用。
- 不再生成 `exports/types.ts`。
- 共享业务类型请从 `src/modules/*/types` 维护，并由消费方使用 `import type` 直接导入。

## RPC Route Convention

- 供前端 RPC 生成使用的 Hono 路由，优先保持单一链式写法。
- 尽量使用 `new Hono().basePath("...").get(...).post(...)` 这种连续链式定义。
- 避免在 RPC 路由里优先使用 `.route("/prefix", childRoutes)` 子路由拆分；当前 `web-app` 的 RPC 生成器对单链写法支持最稳定。
- 路由调整后，先在 `apps/server-api` 运行 `bun run gen:rpc-type`，再到 `apps/web-app` 重新生成前端 RPC。

推荐伪代码：

```ts
export const reviewRoutes = new Hono()
  .basePath("/extraction-dictionary")
  .get("/review-items", ...)
  .post("/review-items/sync", ...)
  .post("/review-items/sync/batch", ...)
  .post("/review-items/manual-tools/verify-pending", ...)
  .post("/review-items/manual-tools/mine-from-resource", ...)
  .get("/review-items/:reviewItemId", ...)
  .post("/review-items/:reviewItemId/decision", ...)
  .get("/review-entities", ...)

export type RPCReviewRoutesType = typeof reviewRoutes
```

尽量避免：

```ts
const reviewItemsRoutes = new Hono()
  .get("/", ...)
  .post("/sync", ...)

const reviewEntitiesRoutes = new Hono().get("/", ...)

export const reviewRoutes = new Hono()
  .basePath("/extraction-dictionary")
  .route("/review-items", reviewItemsRoutes)
  .route("/review-entities", reviewEntitiesRoutes)
```

原因：当前前端 RPC 生成链路对单文件、单链式 Hono 路由支持最稳定。

## Accessing the Server
Once the server is running, you can access it by navigating to the following URL in your web browser:
```
open http://localhost:3100
```
