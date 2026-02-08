---
applyTo: 'apps/server-*/**'
description: Instructions for configuring the Backend application.
---


# Backend Coding standards for TypeScript

Apply the [general coding guidelines](./general-coding.instructions.md) to all code.

## 技术栈
- 使用 TypeScript 作为主要编程语言，确保类型安全和代码可维护性。
- 使用 Hono 框架构建后端应用程序，利用其高性能和易用性的优势。
- 使用 Drizzle 作为 ORM（对象关系映射）工具，简化数据库操作并提高开发效率。
- 使用 PostgreSQL 作为主要数据库，确保数据的可靠性和性能。
- 使用 JWT（JSON Web Token）进行用户认证和授权，确保安全性。
- 使用 Zod 进行数据验证，确保输入数据的正确性和安全性。
- 每个模块导出自身的 PRC 接口定义，供前端调用，确保前后端接口的一致性和可维护性。

## Project Structure
- 代码应遵循清晰的页面化结构，确保每个页面职责单一，易于维护和扩展。
- 页面中组件化，确保组件可复用，提升开发效率。确保每个组件职责单一。
- 遵循命名约定，文件和目录名称应使用驼峰命名法。
- `src/lib` 目录下存放所有库相关的代码，如数据库连接、第三方服务集成等。
  - `src/lib/db` 目录下存放数据库连接和配置相关的代码。
   - `src/lib/db/schemas` 目录下存放数据库模式定义文件。
   - `src/lib/db/migrations` 目录下存放数据库迁移脚本。
   - `src/lib/db/client.ts` 文件用于创建和导出数据库客户端实例。
- `src/modules` 目录下存放所有业务模块相关的代码，确保模块化开发和维护。
  - 每个模块应包含其路由、控制器、服务和模型等相关代码。
  - `src/modules/[module]/enums` 目录下存放该模块特有的枚举定义。
  - `src/modules/[module]/schemas` 目录下存放该模块特有的 Zod 验证模式定义。
  - `src/modules/[module]/types` 目录下存放该模块特有的类型定义。
  - `src/modules/[module]/services` 目录下存放该模块特有的服务代码，如数据库操作、第三方 API 调用等。
  - `src/modules/[module]/controllers` 目录下存放该模块特有的控制器代码，处理具体的业务逻辑。
  - `src/modules/[module]/routes` 目录下存放该模块特有的路由定义代码。
  - `src/modules/[module]/dtos` 目录下存放该模块特有的数据传输对象定义, 若需要。
  - `src/modules/[module]/errors` 目录下存放该模块特有的错误定义。
  - `src/modules/[module]/help` 目录下存放该模块特有的辅助代码。
- `src/middlewares` 目录下存放所有中间件相关的代码。
  - `src/middlewares/auth.ts` 文件用于处理用户认证相关的中间件逻辑。
  - `src/middlewares/errorHandler.ts` 文件用于处理全局错误处理的中间件逻辑。
  - `src/middlewares/logging.ts` 文件用于处理请求日志记录的中间件逻辑。
  - `src/middlewares/rateLimiter.ts` 文件用于处理请求速率限制的中间件逻辑。
  - `src/middlewares/cors.ts` 文件用于处理跨域资源共享（CORS）的中间件逻辑。
- `src/routes.ts` 文件用于集中管理所有路由定义。
- `src/utils` 目录下存放整站公共工具函数。
- `src/types` 目录下存放所有全局类型定义文件。
- `src/app.ts` 文件作为应用程序的入口文件，配置全局中间件和路由。

## 前后端约定
- 所有 API 路由应以 `/api/` 前缀开头。
- 使用 RESTful 风格设计 API，确保资源的统一性和可预测性。
- 所有请求和响应均应使用 JSON 格式进行数据交换。
- 使用 `{ "code": string, "message": string, "data": any }` 作为统一的响应格式。
  - 其中 `code` 为字符串类型的错误码，`message` 为描述信息，`data` 为具体的响应数据。
  - 如果请求成功，`code` 应为 `"SUCCESS"`，`message` 可为 `空字符串` 也可为 `业务所需的成功消息`，`data` 包含实际数据。
  - 如果请求失败，`code` 应为具体的错误码字符串，`message` 包含错误描述，`data` 可为 `null` 或包含错误相关的数据。
- 所有敏感信息（如密码、令牌）在传输和存储时必须进行加密处理。
- 前端与后端约定使用 JWT（JSON Web Token）进行用户认证和授权。

## Error Handling
- 在应用中，异步操作可以使用 `try/catch` 块进行错误处理。
- 对于 API 请求错误，前端应根据后端返回的错误码和消息进行相应的处理和用户提示。需要有一个统一的错误处理机制。根据错误码进行分类处理。
- 错误 Toast 或提示信息应包含足够的上下文信息，以便于用户理解问题所在。
- 避免在前端暴露敏感的内部错误信息，确保安全性。
- 对于已知错误类型，提供明确的用户提示，帮助用户进行相应操作。
- 错误码应遵循统一的命名规范，便于识别和管理。

## TypeScript
- 类型定义文件应放置在 `types/` 目录下，确保类型定义的集中管理和易于维护。方便打包时自动包含。
- 使用接口（`interface`）和类型别名（`type`）定义复杂的数据结构，确保代码的可读性和可维护性。
- 避免使用 `any` 类型，尽量使用具体的类型定义，以确保类型安全。
- 使用枚举（`enum`）定义一组相关的常量值，确保代码的可读性和可维护性。
- 使用类型断言（`as`）时，应确保类型转换的正确性，避免潜在的类型错误。
- 定义通用类型时，使用泛型（`<T>`）以提高代码的灵活性和可重用性。
- 使用类型守卫（`typeof`、`instanceof`）进行类型检查，确保代码的类型安全。

## App 与 Server 分离
- `src/app.ts` 负责创建 Hono App 实例、注册全局中间件、挂载路由。
- `src/index.ts` 仅负责启动 HTTP 服务器和处理优雅关停（SIGINT/SIGTERM）。
- 这种分离确保测试时可以直接 `import { app }` 通过 `app.request()` 测试路由，无需启动真实服务器。

## 中间件注册顺序
全局中间件应按以下顺序注册，顺序不可随意调整：
1. **requestId** — 最先执行，确保所有后续日志和响应都带有追踪 ID。
2. **logging** — 记录请求生命周期（含耗时）。
3. **errorHandler** — 包裹所有下游，捕获异常转为统一响应格式。
4. **cors** — 挂载在 `/api/*`，确保 preflight 正常（必须在 auth 之前）。
5. **rateLimiter** — 挂载在 `/api/*`，限流在鉴权之前。
6. **auth** — **不是全局中间件**，在各模块路由内部按需使用 `.use(authMiddleware)`。

## 错误处理体系
- 所有业务错误应继承 `AppError` 基类（定义在 `src/errors/app-error.ts`）。
- 错误码常量定义在 `src/errors/error-codes.ts`，使用 `as const` 对象而非枚举。
- 全局 `errorHandlerMiddleware` 统一捕获三类异常：
  - `AppError` → 使用其 code/message/statusCode 构建统一响应。
  - `ZodError` → 格式化 `.issues` 为 `[{ path, message }]`，返回 422。
  - 未知错误 → 记录完整日志，返回 500 + `INTERNAL_ERROR`（不泄漏内部信息）。
- Controller 中使用 Zod `.parse()` 而非 `.safeParse()`，验证失败自动抛出 ZodError 由全局 handler 处理。

## 环境变量管理
- 所有环境变量必须在 `src/config/env.ts` 中使用 Zod Schema 校验。
- 应用启动时执行 `safeParse`，校验失败则打印错误并 `process.exit(1)`（fail-fast）。
- 不允许在业务代码中直接读取 `process.env`，统一通过 `env` 对象访问。
- `.env.example` 文件提交到仓库，文档化所有必需的环境变量及默认值。

## 日志规范
- 使用 pino 进行结构化日志输出，开发环境使用 pino-pretty 格式化。
- 所有日志必须携带 `requestId` 字段，实现请求级链路追踪。
- Logger 实例定义在 `src/utils/logger.ts`，通过 `import { logger }` 使用。

## 模块分层模式
数据流：`HTTP Request → Route → (Zod parse) → Controller → Service → DB (Drizzle) → Response`
- **Controller**（薄层）：提取请求参数/body，Zod 校验，调用 Service，返回 `success(c, data)`。
- **Service**（业务逻辑）：包含所有业务规则，使用 Drizzle 操作数据库，抛出 AppError 子类。Service 不依赖 Hono Context。
- **Route**：使用 `new Hono<AppEnv>().use(...).get(...).post(...)` 链式定义。链式调用是 Hono RPC 类型推导的前提。

## Hono RPC 类型导出
- `src/routes.ts` 导出 `type AppType = typeof apiRoutes`，包含所有路由的完整类型信息。
- 前端通过 `import type { AppType }` 和 `hc<AppType>()` 创建类型安全的 API 客户端。
- 路由必须使用链式调用定义，否则 TypeScript 无法推导完整类型。

## 数据库迁移工作流
- `db:generate` — 根据 Schema 变更生成迁移文件。
- `db:migrate` — 执行迁移（生产环境使用）。
- `db:push` — 直接推送 Schema 到数据库（仅开发环境使用）。
- `db:studio` — 启动 Drizzle Studio 可视化管理数据库。
- Drizzle Schema 定义在 `src/lib/db/schemas/` 下，每张表一个文件，字段命名 snake_case。

## 测试规范
- 使用 Vitest 作为测试框架。
- 集成测试使用 `app.request()` 直接测试路由，不依赖真实服务器。
- Service 层单元测试通过 mock `db` 实现隔离。
- 测试文件与源码同目录，命名为 `*.test.ts`（单元测试）或 `*.integration.test.ts`（集成测试）。


