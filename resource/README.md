# Third-Party Resources

`resource/ai-elements` is a vendor submodule. It is intentionally isolated from this monorepo's workspace, Turbo pipeline, and type-check scope.

## Rules

- Do not add `resource/*` to root `workspaces`.
- Do not include `resource/*` in root `tsconfig` references.
- Use `bun run sync:ai-elements` to copy needed files into first-party packages.
- Avoid editing submodule files directly unless updating the submodule itself.
