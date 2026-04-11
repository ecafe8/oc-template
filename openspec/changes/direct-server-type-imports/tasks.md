## 1. 生成链路简化

- [x] 1.1 修改 `apps/server-template/scripts/generate-rpc-type.ts`，停止生成 `exports/types.ts`。
- [x] 1.2 验证生成命令仍能正确产出 `exports/rpc.ts` 与相关 RPC 产物。
- [x] 1.3 清理脚本注释与文档中对 `exports/types.ts` 的过期引用。

## 2. 导入边界迁移

- [x] 2.1 识别现有共享 server 类型的消费方，迁移为从 server module `types` 路径直接 `import type`。
- [x] 2.2 保持运行时导入不变，仅迁移本次变更要求的类型导入。
- [x] 2.3 确认迁移后的导入路径稳定，并与模块所有权一致。

## 3. Guardrails 与验证

- [x] 3.1 新增或更新 lint/静态规则，阻止 frontend/shared 场景对 server 内部运行时模块的导入。
- [x] 3.2 对 server module `types` 目录建立 type-only 导入白名单或等价约束。
- [x] 3.3 执行受影响范围的 `bun run lint` 与 `bun run check-types`，修复边界回归。
- [x] 3.4 执行受影响范围测试（如 `bun test` 或包级测试命令）；若无测试覆盖则在 PR/变更说明中明确记录。

## 4. 文档与发布

- [x] 4.1 更新 README/文档，说明新的共享类型导入约定。
- [x] 4.2 为从 `exports/types.ts` 迁移的模板使用者补充简短迁移说明。
- [x] 4.3 复核 OpenSpec artifacts 与 `openspec/config.yaml` 规则一致，确认可进入 `/opsx:apply`。

说明：
- 本次改动主要为脚本/导出边界/文档调整，变更范围无新增单元测试目标；已通过静态边界检查与类型检查验证。
- `@repo/web-template` 的 `check-types` 仍存在仓库内既有错误（位于 `app/test/chat/page.tsx` 与 `packages/share-ui/src/components/ai-elements/*`），与本变更无直接关联。
