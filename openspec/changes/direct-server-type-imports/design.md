## Context

The repo is a Bun + Turbo monorepo with `server-template` and `web-template`. Today, server type sharing uses a generated file (`exports/types.ts`) that re-exports module types. This pattern duplicates source-of-truth type paths and creates extra generation and review churn for a template intended to stay lightweight.

Frontend already has tsconfig path aliases to server source, which makes direct type imports technically feasible. The challenge is not path resolution, but preventing accidental runtime coupling.

## Goals / Non-Goals

**Goals:**
- Remove dependency on generated `exports/types.ts`.
- Make server module type sharing explicit and direct.
- Preserve runtime isolation by requiring type-only imports from allowed server paths.
- Keep migration small for template users.

**Non-Goals:**
- No changes to HTTP/RPC runtime behavior.
- No broad refactor of module directory layout.
- No attempt to expose all server internals as public API.

## Decisions

1. Remove `exports/types.ts` from generation output.
- Rationale: It is a thin re-export layer with little value and recurring maintenance cost.
- Alternative considered: Keep generation but reduce content.
  - Rejected because it keeps the same indirection and tooling burden.

2. Use direct `import type` from `@repo/server-template/modules/**/types` (or equivalent source alias).
- Rationale: Keeps type ownership close to modules and removes intermediary files.
- Alternative considered: Introduce a curated `src/public-types.ts`.
  - Deferred. Useful for stricter API boundaries, but unnecessary for current template scope.

3. Add import guardrails for frontend and shared packages.
- Rationale: Main risk is accidental runtime imports from server source.
- Guardrails:
  - Enforce `import type` for server-module type paths.
  - Disallow imports from server runtime-heavy areas (e.g., `lib/db`, `middlewares`, `config`, `index`).
- Alternative considered: No lint guardrails.
  - Rejected due to high probability of future regressions.

4. Keep RPC export file (`exports/rpc.ts`) unchanged.
- Rationale: RPC type generation still provides high value for typed client generation.

## Risks / Trade-offs

- [Accidental runtime import from server source] -> Mitigation: lint rules + typecheck verification in affected apps.
- [Path churn during future server refactors] -> Mitigation: document recommended import roots (`modules/*/types`) and update migration notes.
- [Template users copy old pattern] -> Mitigation: update README and generator comments to show new convention.
