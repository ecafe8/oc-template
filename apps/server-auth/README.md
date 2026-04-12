
## Getting Started

```bash
# 1. 配置环境变量
cp .env.example .env

# 2. 生成 better-auth 所需表结构
bun run auth:gen

# 3. 执行迁移
bun run auth:migrate

# 4. 校验类型
bun run check-types

# 5. 启动服务
bun run dev
```

本地页面：

```text
http://localhost:4999/login
http://localhost:4999/account
http://localhost:4999/api/auth/reference
```

说明：

- 当前默认启用邮箱密码登录、找回密码和用户资料接口。
- 社交登录入口已从页面移除；如需启用，请先在 `src/lib/auth/index.ts` 中配置 provider，并补齐环境变量。
- 如果需要跨子域共享 Cookie，建议使用 `auth.local.com` / `app.local.com` 这类本地域名，再配置 `BETTER_AUTH_CROSS_SUBDOMAIN`。
