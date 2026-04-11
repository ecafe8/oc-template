## Why

Current type sharing relies on generating `apps/server-template/exports/types.ts`, but this file is only a re-export bridge and adds maintenance overhead. In this monorepo template, frontend can already resolve server source paths, so we should simplify the flow and reduce generated artifacts.

## What Changes

- Stop generating `apps/server-template/exports/types.ts` in the server RPC/type generation script.
- Switch frontend/server shared type usage to direct `import type` from `apps/server-template/src/modules/**/types`.
- Define and enforce import boundary rules so frontend only imports type-only modules from server source paths.
- Update documentation and migration guidance for developers using shared types.

## Capabilities

### New Capabilities
- `direct-server-type-sharing`: Frontend and other workspace packages can consume server module types directly via type-only imports without a generated `exports/types.ts` bridge.

### Modified Capabilities
- (none)

## Impact

- Affected code:
  - `apps/server-template/scripts/generate-rpc-type.ts`
  - Type imports in `apps/web-template` and potentially shared packages
  - Documentation in app/package READMEs
- APIs:
  - No runtime API contract changes
  - Internal type import paths change
- Tooling:
  - Reduced generated files and generation surface area
  - Requires lint/guardrails to prevent runtime imports from server internals
