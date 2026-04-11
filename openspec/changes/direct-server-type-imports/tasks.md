## 1. Generator Simplification

- [ ] 1.1 Update `apps/server-template/scripts/generate-rpc-type.ts` to stop generating `exports/types.ts`.
- [ ] 1.2 Verify generation command still produces valid `exports/rpc.ts` and related RPC artifacts.
- [ ] 1.3 Remove stale references to `exports/types.ts` in script comments or command docs.

## 2. Import Boundary Migration

- [ ] 2.1 Identify existing consumers of shared server types and migrate them to direct `import type` from server module `types` paths.
- [ ] 2.2 Keep runtime imports unchanged; only migrate type-level imports required by this change.
- [ ] 2.3 Confirm migrated import paths are stable and aligned with module ownership.

## 3. Guardrails and Verification

- [ ] 3.1 Add or update lint/static rules to block runtime imports from server internals in frontend/shared contexts.
- [ ] 3.2 Allowlist/encourage type-only imports from server module `types` directories.
- [ ] 3.3 Run workspace typecheck/lint for affected apps and fix any boundary regressions.

## 4. Documentation and Rollout

- [ ] 4.1 Update README/docs to describe the new shared type import convention.
- [ ] 4.2 Add a short migration note for template users moving from `exports/types.ts`.
- [ ] 4.3 Validate OpenSpec artifacts are complete and ready for `/opsx:apply`.
