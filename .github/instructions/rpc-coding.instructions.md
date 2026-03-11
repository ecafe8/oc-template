---
applyTo: 'apps/**'
description: This file describes the RPC full-stack type synchronization workflow for the project, detailing how to define routes on the server, generate types and hooks, and use them in the frontend components.
---


## RPC 全栈类型同步工作流

### 工作流概述

本项目使用 **Hono RPC + 代码生成** 实现前后端零手写的类型安全 API 调用：

```
server-example 路由定义
  → [gen:rpc-type] → server-example/exports/rpc.ts（类型导出）
  → [gen:rpc]      → web-example/app/api/rpc/generated/（React Query hooks）
  → 组件直接 import 使用
```

### 步骤一：服务端新增模块/路由

在 `apps/server-example/src/modules/<module>/routes/index.ts` 中：

```typescript
// 1. 定义路由（必须使用 .basePath() + 链式调用，Hono RPC 推断依赖此模式）
export const exampleRoutes = new Hono()
  .basePath('/example')
  .get('/', listHandler)
  .post('/', createHandler)
  .get('/:id', detailHandler);

// 2. 导出 RPC 类型（命名规则：RPC[Module]RoutesType，必须含 RPC 前缀）
export type RPCExampleRoutesType = typeof exampleRoutes;
```

然后在 `apps/server-example/src/routes.ts` 中挂载：
```typescript
import { exampleRoutes } from './modules/example/routes/index';
const subRoutes = [..., exampleRoutes];
```

### 步骤二：生成 RPC 代码

```bash
# 方式1：从 monorepo 根目录一键生成（推荐）
bun run gen:rpc

# 方式2：分步执行
cd apps/server-example && bun run gen:rpc-type   # 生成 exports/rpc.ts
cd apps/web-example && bun run gen:rpc             # 生成前端 hooks
```

生成管道（两阶段）：
1. **`gen:rpc-type`**（server-example）：扫描 `src/modules/*/routes/index.ts`，提取所有 `RPCXxxRoutesType` 导出，生成 `exports/rpc.ts`
2. **`gen:rpc`**（web-example）：读取 `exports/rpc.ts`，解析路由结构，在 `app/api/rpc/generated/` 下生成带类型的 React Query hooks

生成结果（`apps/web-example/app/api/rpc/generated/`）：
- `example.ts` — 每个端点对应一个 hook：GET → `useQuery`，POST/PATCH/DELETE → `useMutation`
- `index.ts` — 统一 barrel 导出

### 步骤三：在前端组件中使用

```typescript
// client 组件中使用（React Query hooks）
import { useListExample, useCreateExample } from '@web/example/app/api/rpc/generated';

function MyComponent() {
  const { data, isLoading } = useListExample();
  const createMutation = useCreateExample();

  const handleCreate = () => {
    createMutation.mutate({ json: { name: 'test' } });
  };
}
```

### 生成的 Hook 命名规则

| HTTP 方法 | 路径模式 | 生成 Hook 名 | 类型 |
|-----------|---------|------------|------|
| GET | `/<module>/` | `useList<Module>` | useQuery |
| GET | `/<module>/:id` | `useDetail<Module>` | useQuery |
| GET | `/<module>/:id/<sub>` | `use<Sub><Module>` | useQuery |
| POST | `/<module>/` | `useCreate<Module>` | useMutation |
| PATCH | `/<module>/:id` | `usePatch<Module>` | useMutation |
| DELETE | `/<module>/:id` | `useDelete<Module>` | useMutation |
| POST | `/<module>/:id/<sub>` | `use<Sub><Module>` | useMutation |

### 重要规则

- **不要手动编辑** `app/api/rpc/generated/` 下的文件，每次 `gen:rpc` 会覆盖
- **`bun run dev` 自动触发** `gen:rpc`，开发时无需手动运行
- **路由必须在 `routes/index.ts` 中**（生成器扫描此路径），不是 `routes/xxx.routes.ts`
- 如果后端新增了模块但前端 hook 没出现，先检查路由文件是否在正确位置且已挂载到 `routes.ts`
- 生成的 hooks 使用 `_base/client.ts` 中的 `getApiBaseUrl()`，读取 `NEXT_PUBLIC_example_API_URL` 环境变量