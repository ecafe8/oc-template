# @repo/share-auth

`share-auth` 用来沉淀多应用接入 `apps/server-auth` 时的公共鉴权能力，避免每个应用重复实现以下逻辑：

- 解析统一认证服务地址
- 转发 Cookie / Bearer Token
- 规范化登录回跳地址
- 从 `server-auth` 读取当前会话
- 让后端服务通过内部接口校验会话
- 统一用户数据结构

当前仓库里的接入基线是：

- `apps/server-auth` 作为统一登录和用户中心
- `apps/web-template` 负责跳转到 `server-auth` 登录页，并通过接口读取当前会话
- `apps/server-template` 不再本地验 JWT，而是委托 `server-auth` 做会话校验

## 环境变量约定

### 通用

```bash
AUTH_BASE_URL=http://localhost:4999
NEXT_PUBLIC_AUTH_BASE_URL=http://localhost:4999
AUTH_SERVICE_URL=http://localhost:4999
INTERNAL_API_SECRET=replace-with-a-shared-secret
```

说明：

- `AUTH_BASE_URL`：服务端读取 `server-auth` 地址时的首选变量。
- `NEXT_PUBLIC_AUTH_BASE_URL`：当没有 `AUTH_BASE_URL` 时的兜底值，适合 Next 应用前后端共用。
- `AUTH_SERVICE_URL`：后端服务调用 `server-auth` 内部校验接口时使用。
- `INTERNAL_API_SECRET`：后端服务和 `server-auth` 之间共享的内部调用密钥。

`getAuthBaseUrl()` 的解析顺序如下：

1. `AUTH_BASE_URL`
2. `NEXT_PUBLIC_AUTH_BASE_URL`
3. `http://localhost:4999`

## 导出能力

### 地址与跳转

- `getAuthBaseUrl()`：获取统一认证服务地址。
- `normalizeRedirectTarget(value, origin)`：校验并规范化回跳地址，防止跳转到非当前站点。

### 请求头转发

- `buildForwardAuthHeaders(headers, options)`：从当前请求里透传 `cookie` 和 `authorization`。
- 当传入 `internalApiSecret` 时，会自动补上 `x-internal-secret`。

### 会话读取与校验

- `readSessionFromHeaders(headers, authBaseUrl?)`
  - 面向 Web 应用
  - 调用 `server-auth /api/users/me`
  - 适合做“当前用户是否已登录”的判断
- `verifySessionFromHeaders(headers, { authBaseUrl, internalApiSecret })`
  - 面向服务端接口
  - 调用 `server-auth /api/internal/verify`
  - 适合做受保护 API 的统一鉴权

### 类型与用户转换

- `AuthenticatedUser`
- `AuthSessionResult`
- `AuthVerificationResult`
- `toAuthenticatedUser(user)`

`toAuthenticatedUser` 主要用于把数据库实体或 `better-auth` 返回的 `Date` 字段统一转成字符串格式，方便跨服务传输。

## Web 应用接入

推荐模式：业务应用不自己做登录页，只负责把未登录用户重定向到 `server-auth`。

### 1. 登录跳转路由

```ts
import { getAuthBaseUrl, normalizeRedirectTarget } from "@repo/share-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const redirect = request.nextUrl.searchParams.get("redirect");
  const returnTo = normalizeRedirectTarget(redirect, request.nextUrl.origin);
  const loginUrl = new URL("/login", getAuthBaseUrl());

  loginUrl.searchParams.set("redirect", returnTo);

  return NextResponse.redirect(loginUrl);
}
```

### 2. 当前会话代理接口

```ts
import { getAuthBaseUrl, readSessionFromHeaders } from "@repo/share-auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const session = await readSessionFromHeaders(request.headers, getAuthBaseUrl());

  return NextResponse.json(session, {
    status: session.authenticated ? 200 : 401,
    headers: {
      "cache-control": "no-store",
    },
  });
}
```

### 3. 页面或布局中做服务端鉴权

```ts
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { readSessionFromHeaders } from "@repo/share-auth";

export default async function ProtectedPage() {
  const session = await readSessionFromHeaders(await headers());

  if (!session.authenticated) {
    redirect("/auth/login?redirect=/");
  }

  return <main>{session.user?.email}</main>;
}
```

适用场景：

- `app/page.tsx` 首页保护
- `app/(protected)/layout.tsx` 统一保护整组路由
- 自定义 `/api/auth/session` 给客户端轮询或拉取当前用户

## 后端服务接入

推荐模式：业务 API 不自己解析用户 Token，而是委托 `server-auth` 通过内部接口验会话。

```ts
import { verifySessionFromHeaders } from "@repo/share-auth";

const result = await verifySessionFromHeaders(c.req.raw.headers, {
  authBaseUrl: env.AUTH_SERVICE_URL,
  internalApiSecret: env.INTERNAL_API_SECRET,
});

if (!result.ok || !result.user) {
  throw new Error("Unauthorized");
}

c.set("userId", result.user.id);
```

建议：

- 公开健康检查接口不要套鉴权中间件。
- `INTERNAL_API_SECRET` 只用于服务间调用，不要暴露到前端。
- 如果你的服务还需要角色、租户、组织信息，建议继续以 `server-auth` 为权威来源扩展内部校验返回体。

## 推荐接入边界

适合放进 `share-auth` 的内容：

- 认证服务地址解析
- Header 转发
- 登录跳转地址处理
- 公共会话类型
- 读取会话和内部校验的 fetch helper

不建议放进 `share-auth` 的内容：

- 具体 UI 组件
- 某个业务应用独有的权限模型
- 与单个应用路由结构强耦合的封装

## 注意事项

- `readSessionFromHeaders` 和 `verifySessionFromHeaders` 都依赖服务端 `fetch`，不要直接在浏览器端调用。
- `normalizeRedirectTarget` 会拒绝跨站跳转；如果传入非法地址，会回退到当前站点根路径。
- 如果要做跨子域登录态共享，请优先在 `apps/server-auth` 中正确配置 Cookie 域名和 `better-auth` 相关选项。
- `server-auth` 是统一认证中心，业务应用应尽量避免再次维护一套本地登录状态。

## 参考实现

- `apps/web-template/app/auth/login/route.ts`
- `apps/web-template/app/api/auth/session/route.ts`
- `apps/server-template/src/middlewares/auth.ts`
- `apps/server-auth/src/modules/internal/routes/index.ts`
