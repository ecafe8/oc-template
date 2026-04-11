## Why

当前类型共享依赖生成 `apps/server-template/exports/types.ts`，但该文件本质是薄 re-export 层，长期带来额外维护与评审噪音。该模板仓库已具备跨包源码路径解析能力，可以改为直接类型导入，减少生成面与心智负担。

## What Changes

In Scope:
- 停止在 server 侧生成 `apps/server-template/exports/types.ts`。
- 前后端共享类型改为从 `apps/server-template/src/modules/**/types` 进行 `import type`。
- 增加导入边界约束，限制 frontend/shared 场景仅做 type-only 导入。
- 更新 README/脚本说明，补充迁移指引。

Out of Scope:
- 不调整 RPC 运行时协议与 API 行为。
- 不重构 server 模块目录结构。
- 不引入新的业务能力，仅优化类型共享方式与工程约束。

## Capabilities

### New Capabilities
- `direct-server-type-sharing`: frontend 与其他 workspace 包可通过 type-only 方式直接消费 server module 类型，无需 `exports/types.ts` 桥接文件。

### Modified Capabilities
- (none)

## Impact

- Affected code:
  - `apps/server-template/scripts/generate-rpc-type.ts`
  - `apps/web-template` 与可能受影响的共享包类型导入语句
  - 应用与包级 README/脚本注释
- APIs:
  - 无运行时 API 契约变化
  - 内部类型导入路径发生调整
- Tooling:
  - 减少生成文件与生成链路复杂度
  - 需要 lint/静态规则防止误导入 server 运行时代码
