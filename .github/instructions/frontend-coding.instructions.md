---
applyTo: 'apps/web-*/**'
description: Instructions for configuring the Frontend application.
---


# Frontend Coding standards for TypeScript

Apply the [general coding guidelines](./general-coding.instructions.md) to all code.

## 技术栈
- 使用 TypeScript 作为主要编程语言，确保类型安全和代码可维护性。
- 使用 Next.js 框架构建前端应用程序，利用其服务器端渲染和静态站点生成的优势。
- 使用 React 作为核心 UI 库，构建可复用的组件。基础样式组件在 `packages/share-ui` 。
  - 例如： Button 组件应从 `@repo/share-ui/components/reui/button` 导入。
  - `import { Button } from "@repo/share-ui/components/reui/button";`
  - 使用 Sonner 作为全局通知和提示的解决方案。
  - 全局只需在根组件引入一次 `Toaster` 组件。
  - 使用 React Hook 进行状态和副作用管理，遵循 React 的最佳实践。
- 使用 Tailwind CSS 进行样式设计，确保响应式和一致的用户界面。
- 使用 Jotai 进行状态管理
- 使用 jotai-tanstack-query @tanstack/query-core 进行数据获取和状态管理。

## Project Structure
- 代码应遵循清晰的页面化结构，确保每个页面职责单一，易于维护和扩展。
- 页面中组件化，确保组件可复用，提升开发效率。确保每个组件职责单一。
- 遵循命名约定，文件和目录名称应使用驼峰命名法。
- `src/types` 目录下存放所有类型定义文件。
- `src/app` 目录下存放所有页面和布局组件。
  - `src/app/api` 目录下存放所有 API 路由处理代码。
  - `src/app/(auth)` 目录下存放所有需要认证的页面代码。
  - `src/app/(public)` 目录下存放所有公共访问的页面代码。
  - `src/app/[page]/components` 目录下存放该页面特有的组件代码。
  - `src/app/[page]/stores` 目录下存放该页面特有的状态管理代码，例如，表单状态等。
- `src/layouts` 目录下存放所有布局相关的代码。
- `src/components` 目录下存放整站可复用的 UI 组件。页面特有组件应放在对应页面目录下。
- `src/utils` 目录下存放整站公共工具函数。
- `src/stores` 目录下存放整站公共状态管理相关的代码。例如，用户认证状态等。确保每个 store 职责单一。

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
- 在前端应用中，异步操作可以使用 `try/catch` 块进行错误处理。
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

## 状态管理
- 使用 React Query 进行服务器状态管理，确保数据获取和缓存的高效性。
- 使用 Jotai 进行客户端状态管理，确保状态的可预测性和易于维护。
- 避免在组件中直接操作全局状态，使用状态管理库提供的 API 进行状态更新。
- 使用原子（atom）和选择器（selector）进行状态的细粒度管理，确保状态的可复用性和可维护性。
- 避免在状态管理中存储大量数据，确保状态的轻量级和高效性。


