## ADDED Requirements

### Requirement: Direct Type Imports From Server Modules
The system MUST allow frontend and workspace packages to consume shared server-defined types directly from server module type files, without requiring a generated `exports/types.ts` bridge file.

#### Scenario: Frontend imports shared module type
- **WHEN** frontend code needs a type defined by a server module
- **THEN** it imports that type from the server module type source path using `import type`
- **AND** the import resolves during type checking without `exports/types.ts`

### Requirement: Type-Only Boundary Enforcement
The system MUST enforce that imports from server source paths in frontend/shared UI contexts are type-only and do not introduce runtime coupling to server runtime modules.

#### Scenario: Runtime import from server internals is attempted
- **WHEN** a developer imports a server runtime module (non-type import) from frontend/shared package code
- **THEN** linting or static checks fail with a clear boundary violation

#### Scenario: Valid type-only import passes checks
- **WHEN** a developer uses `import type` from an allowed server module `types` path
- **THEN** linting and type checking pass

### Requirement: Generator Stops Emitting Types Bridge File
The server type/RPC generation flow MUST stop creating or updating `apps/server-template/exports/types.ts`.

#### Scenario: Run server type generation
- **WHEN** the developer runs the server generation command
- **THEN** generation updates RPC artifacts as needed
- **AND** does not emit `exports/types.ts`
