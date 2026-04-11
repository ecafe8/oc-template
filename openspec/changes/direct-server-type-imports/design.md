## Context

仓库是 Bun + Turbo 的 monorepo，核心应用为 `server-template` 与 `web-template`。当前 server 类型共享依赖 `exports/types.ts` 作为中间层做 re-export，导致类型来源不够直接，并增加生成与审阅成本。

frontend 已具备到 server 源码的路径别名，直接导入类型在技术上可行。真正风险不在路径解析，而在于“误把 server 运行时代码引入 frontend”。

## Goals / Non-Goals

**Goals:**
- 移除对 `exports/types.ts` 的依赖。
- 让 server module 类型共享路径直接且可追溯。
- 通过 type-only 约束保持前后端运行时隔离。
- 提供低摩擦迁移路径，适配模板仓库使用者。

**Non-Goals:**
- 不改变 HTTP/RPC 运行时行为。
- 不进行模块目录的大规模重构。
- 不把 server 内部实现全面暴露为公共 API。

## Decisions

1. 生成流程不再产出 `exports/types.ts`。
- 采纳原因：该文件价值低、维护成本持续存在。
- 备选方案 A：保留生成但缩减导出内容。
  - 不采纳：仍保留中间层与工具负担，问题本质不变。

2. 采用从 `@repo/server-template/modules/**/types`（或等价源码别名）直接 `import type`。
- 采纳原因：类型所有权与模块对齐，减少中间产物。
- 备选方案 B：新增 `src/public-types.ts` 统一公开类型入口。
  - 暂不采纳：边界更强，但当前模板场景投入产出比不高，可后续再演进。

3. 为 frontend/shared 包增加导入 guardrails。
- 采纳原因：核心风险是 runtime import 回流。
- Guardrails：
  - 对 server module 类型路径强制 `import type`。
  - 禁止从 server 运行时目录导入（如 `lib/db`、`middlewares`、`config`、`index`）。
- 备选方案 C：不加 lint 约束，仅靠约定。
  - 不采纳：回归概率高，难以规模化维护。

4. 保持 `exports/rpc.ts` 生成逻辑不变。
- 采纳原因：RPC 类型导出仍是 web 侧生成 hooks 的关键依赖。

## Risks / Trade-offs

- [误导入 server 运行时代码] -> 缓解：lint 规则 + 受影响包 typecheck。
- [未来 server 重构导致路径变动] -> 缓解：文档明确推荐导入根（`modules/*/types`）并维护迁移说明。
- [模板使用者沿用旧模式] -> 缓解：README 与生成脚本注释同步更新。

## Compatibility

- 对现有模板使用者：运行时行为保持兼容，不影响 API 调用路径。
- 对开发体验：类型导入路径会变更，需一次性迁移 import 语句。
- 对迁移策略：先落地 guardrails，再迁移类型导入，最后移除生成桥接文件引用，避免中途失稳。
