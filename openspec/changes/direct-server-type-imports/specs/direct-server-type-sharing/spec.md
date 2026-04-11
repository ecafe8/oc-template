## ADDED Requirements

### Requirement: 直接从 Server Modules 导入类型
系统 MUST 允许 frontend 与 workspace 包直接从 server module 的类型文件消费共享类型，而不依赖生成的 `exports/types.ts` 桥接文件。

#### Scenario: Frontend 导入共享模块类型
- **WHEN** frontend 代码需要使用 server module 中定义的类型
- **THEN** 通过 `import type` 从 server module 类型源路径导入该类型
- **AND** 在缺少 `exports/types.ts` 的情况下仍可通过类型检查

### Requirement: Type-Only 边界约束
系统 MUST 对 frontend/shared UI 场景中的 server 源码路径导入实施 type-only 约束，避免引入 server 运行时耦合。

#### Scenario: 尝试从 server 内部做运行时导入
- **WHEN** 开发者在 frontend/shared 包中以非 type-only 方式导入 server 运行时模块
- **THEN** lint 或静态检查以清晰的边界违规信息失败

#### Scenario: 合法的 type-only 导入通过检查
- **WHEN** 开发者从允许的 server module `types` 路径使用 `import type`
- **THEN** lint 与类型检查均通过

### Requirement: 生成流程停止产出类型桥接文件
server 类型/RPC 生成流程 MUST 停止创建或更新 `apps/server-template/exports/types.ts`。

#### Scenario: 执行 server 类型生成
- **WHEN** 开发者运行 server 侧生成命令
- **THEN** 生成流程按需更新 RPC 相关产物
- **AND** 不再产出 `exports/types.ts`
