#!/usr/bin/env bun
/**
 * RPC Hook Generator
 *
 * Reads backend route definitions from server-oc-api and generates:
 * - Typed RPC client instances per module
 * - React Query hooks (useQuery for GET, useMutation for POST/PUT/DELETE)
 * - Query key factories for cache management
 *
 * Usage: bun run generate:rpc --server=server-oc-api --package=@repo/server-oc-api
 *
 * ⚠️ Generated files go to: api/rpc/generated/
 *    DO NOT put generated code in this scripts directory.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { camel, dash, pascal } from "radash";

// ── Configuration ──────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DEFAULT_SERVER_NAME = "server-template";
const DEFAULT_PACKAGE_PREFIX = "@repo";
const OUTPUT_DIR = path.resolve(__dirname, "../app/api/rpc/generated");

function parseArgumentValue(argv: string[], flag: string): string | undefined {
  const arg = argv.find((a) => a.startsWith(`--${flag}=`));
  if (arg) {
    const value = arg.slice(`--${flag}=`.length).trim();
    if (value.length > 0) {
      return value;
    }
  }
  const flagIndex = argv.findIndex((a) => a === `--${flag}`);
  if (flagIndex >= 0) {
    const value = argv[flagIndex + 1]?.trim();
    if (value) {
      return value;
    }
  }
}

function parseServerName(argv: string[]): string {
  return parseArgumentValue(argv, "server") || DEFAULT_SERVER_NAME;
}

function parsePackageAlias(argv: string[], serverName: string): string {
  return parseArgumentValue(argv, "packageAlias") || `${DEFAULT_PACKAGE_PREFIX}/${serverName}`;
}

function parsePackageExportAlias(argv: string[], serverName: string): string {
  return parseArgumentValue(argv, "packageExportAlias") || `${DEFAULT_PACKAGE_PREFIX}/${serverName}-exports`;
}

// ── Types ──────────────────────────────────────────────────────

interface ModuleInfo {
  typeName: string;
  sourceFile: string;
  moduleName: string; // camelCase: projects, projectAssets
  moduleKey: string; // basePath segment: projects, project_assets
  fileName: string; // kebab-case: projects, project-assets
  basePath: string;
  endpoints: EndpointInfo[];
}

interface EndpointInfo {
  method: string;
  path: string;
  accessChain: string;
  typeChain: string;
  validators: ValidatorInfo[];
  actionName: string;
  functionName: string;
  hookName: string;
  isQuery: boolean;
  hasInput: boolean;
}

interface ValidatorInfo {
  type: string;
  schema: string;
}

// ── String Utilities ───────────────────────────────────────────

function toPascalCase(s: string): string {
  return pascal(s);
}

function toCamelCase(s: string): string {
  return camel(s);
}

function toKebabCase(s: string): string {
  return dash(s);
}

// ── Parsers ────────────────────────────────────────────────────

function parseRpcExports(content: string): Array<{ typeName: string; sourcePath: string }> {
  const results: Array<{ typeName: string; sourcePath: string }> = [];
  // Match both `import type` and `export type` re-export lines
  const regex = /(?:import|export)\s+type\s+\{\s*(\w+)\s*\}\s*from\s+["'](.+?)["']/g;
  // let match: RegExpExecArray | null;
  // while ((match = regex.exec(content)) !== null) {
  //   if (match[1] && match[2] && match[1].startsWith("RPC") && match[1].endsWith("Type")) {
  //     results.push({ typeName: match[1], sourcePath: match[2] });
  //   }
  // }
  for (const match of content.matchAll(regex)) {
    if (match[1] && match[2] && match[1].startsWith("RPC") && match[1].endsWith("Type")) {
      results.push({ typeName: match[1], sourcePath: match[2] });
    }
  }
  return results;
}

function parseRouteFile(content: string): {
  basePath: string;
  endpoints: EndpointInfo[];
} {
  // Extract basePath from the Hono chain
  const basePathMatch = content.match(/\.basePath\(\s*["']([^"']+)["']\s*\)/);
  const basePath = basePathMatch?.[1] ?? "/";

  const endpoints: EndpointInfo[] = [];

  // Match chained .method("path", ...) calls
  const methodRegex = /\.(get|post|put|delete|patch)\(\s*["']([^"']+)["']/g;
  for (const methodMatch of content.matchAll(methodRegex)) {
    const method = methodMatch[1];
    const routePath = methodMatch[2];

    // Skip if method or path is undefined
    if (!method || !routePath) continue;

    const startIdx = methodMatch.index;
    const restContent = content.slice(startIdx);

    // Find segment boundary (next chained method or end)
    let segmentEnd = restContent.length;
    const nextMatch = restContent.slice(methodMatch[0].length).search(/\)\s*\.\s*(get|post|put|delete|patch)\(/);
    if (nextMatch >= 0) {
      segmentEnd = methodMatch[0].length + nextMatch;
    }
    const segment = restContent.slice(0, segmentEnd);

    // Extract validators in this segment
    const validators: ValidatorInfo[] = [];
    const validatorRegex = /validator\(\s*["'](query|json|param)["']\s*,\s*(\w+)/g;
    for (const vMatch of segment.matchAll(validatorRegex)) {
      if (vMatch[1] && vMatch[2]) {
        validators.push({ type: vMatch[1], schema: vMatch[2] });
      }
    }

    // hasInput: true if there are validators OR route path contains params (e.g. /:id)
    // POST/PUT/PATCH always have a body — treat them as hasInput even without a validator() declaration
    const hasPathParams = routePath.includes(":");
    const isBodyMethod = ["post", "put", "patch"].includes(method);

    endpoints.push({
      method,
      path: routePath,
      accessChain: "",
      typeChain: "",
      validators,
      actionName: "",
      functionName: "",
      hookName: "",
      isQuery: method === "get",
      hasInput: validators.length > 0 || hasPathParams || isBodyMethod,
    });
  }

  return { basePath, endpoints };
}

// ── Name Generation ────────────────────────────────────────────

function buildAccessChain(routePath: string): string {
  const segments = routePath.split("/").filter(Boolean);
  if (segments.length === 0) return "";

  return segments
    .map((s) => {
      if (s.startsWith(":")) return `[":${s.slice(1)}"]`;
      if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(s)) return `.${s}`;
      return `["${s}"]`;
    })
    .join("");
}

function buildTypeChain(routePath: string, method: string): string {
  const segments = routePath.split("/").filter(Boolean);
  const chain = segments.map((s) => (s.startsWith(":") ? `[":${s.slice(1)}"]` : `["${s}"]`)).join("");
  return `${chain}["$${method}"]`;
}

function generateActionName(method: string, routePath: string): string {
  const segments = routePath.split("/").filter(Boolean);
  const staticSegments = segments.filter((s) => !s.startsWith(":"));
  const hasParams = segments.some((s) => s.startsWith(":"));

  if (staticSegments.length === 0) {
    switch (method) {
      case "get":
        return hasParams ? "Detail" : "List";
      case "post":
        return "Create";
      case "put":
        return "Update";
      case "delete":
        return "Delete";
      case "patch":
        return "Patch";
      default:
        return toPascalCase(method);
    }
  }

  // Has sub-paths
  const subName = staticSegments.map((s) => toPascalCase(s)).join("");
  switch (method) {
    case "get":
      return subName;
    case "post":
      return subName;
    case "put":
      return `Update${subName}`;
    case "delete":
      return `Remove${subName}`;
    default:
      return subName;
  }
}

function generateEndpointNames(action: string, moduleName: string): { functionName: string; hookName: string } {
  const modulePascal = toPascalCase(moduleName);
  const actionLower = action.toLowerCase();
  const moduleLower = modulePascal.toLowerCase();

  // Skip appending module name if action already contains it
  const needsModule = !actionLower.includes(moduleLower);
  const suffix = needsModule ? modulePascal : "";

  return {
    functionName: `${toCamelCase(action)}${suffix}Api`,
    hookName: `use${toPascalCase(action)}${suffix}`,
  };
}

function getCustomQueryFactoryName(actionName: string): string {
  const reservedNames = new Set(["all", "lists", "list", "details", "detail"]);
  const keyName = toCamelCase(actionName);
  return reservedNames.has(keyName) ? `${keyName}Query` : keyName;
}

// ── Code Generation ────────────────────────────────────────────

function generateModuleCode(module: ModuleInfo, packageAlias: string, packageExportAlias: string): string {
  const lines: string[] = [];
  const hasQueries = module.endpoints.some((e) => e.isQuery);
  const hasMutations = module.endpoints.some((e) => !e.isQuery);

  // ── Header ──
  lines.push("/**");
  lines.push(" * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT MANUALLY");
  lines.push(" * Re-generate with: bun run generate:rpc");
  lines.push(` * Module: ${module.moduleName} (basePath: ${module.basePath})`);
  lines.push(" */");
  lines.push("");

  // ── Imports ──
  lines.push('import type { InferRequestType, InferResponseType } from "hono/client";');
  lines.push('import { hc } from "hono/client";');

  const rqImports: string[] = [];
  if (hasQueries) rqImports.push("useQuery");
  if (hasMutations) rqImports.push("useMutation", "useQueryClient");
  lines.push(`import { ${rqImports.join(", ")} } from "@tanstack/react-query";`);
  lines.push('import { fetchOptions, getApiBaseUrl } from "../_base/client";');
  lines.push('import { unwrapResponse } from "../_base/fetcher";');

  const typeImports: string[] = [];
  if (hasQueries) typeImports.push("ApiQueryOptions");
  if (hasMutations) typeImports.push("ApiMutationOptions");
  typeImports.push("ExtractData");
  lines.push(`import type { ${typeImports.join(", ")} } from "../_base/types";`);

  // Import RPC type from backend exports
  lines.push("");
  lines.push(`import type { ${module.typeName} } from "${packageExportAlias}/rpc";`);
  lines.push("");

  // Import shared types from server modules (type-only import path)
  lines.push(`// 你可以在这里导入后端共享的类型，例如：`);
  lines.push(`// import type { ExampleType } from "@repo/server-template/modules/sites/types";`);
  lines.push("");
  lines.push("");

  // ── Client ──
  lines.push("// ═══════════════════════════════════════");
  lines.push("//  RPC Client");
  lines.push("// ═══════════════════════════════════════");
  lines.push("");
  lines.push(`const client = hc<${module.typeName}>(getApiBaseUrl(), fetchOptions);`);
  // Access the module sub-path. basePath "/projects" → client.projects
  const clientAccess = buildAccessChain(`/${module.moduleKey}`);
  lines.push(`const api = client${clientAccess};`);
  lines.push("");

  // ── Type Inference ──
  lines.push("// ═══════════════════════════════════════");
  lines.push("//  Type Inference");
  lines.push("// ═══════════════════════════════════════");
  lines.push("");

  // Track unique action names to avoid conflicts
  const actionCounts = new Map<string, number>();
  for (const ep of module.endpoints) {
    const count = actionCounts.get(ep.actionName) ?? 0;
    actionCounts.set(ep.actionName, count + 1);
  }

  const actionUsed = new Map<string, number>();
  for (const ep of module.endpoints) {
    const total = actionCounts.get(ep.actionName) ?? 1;
    const used = actionUsed.get(ep.actionName) ?? 0;
    if (total > 1) {
      ep.actionName = `${ep.actionName}${used + 1}`;
    }
    actionUsed.set(ep.actionName.replace(/\d+$/, ""), used + 1);
  }

  for (const ep of module.endpoints) {
    const typeAccess = `typeof api${ep.typeChain}`;
    lines.push(`export type ${ep.actionName}Input = InferRequestType<${typeAccess}>;`);
    lines.push(`export type ${ep.actionName}Output = ExtractData<InferResponseType<${typeAccess}, 200>>;`);
  }
  lines.push("");

  // ── Query Keys ──
  lines.push("// ═══════════════════════════════════════");
  lines.push("//  Query Keys");
  lines.push("// ═══════════════════════════════════════");
  lines.push("");
  lines.push(`export const ${module.moduleName}Keys = {`);
  lines.push(`  all: ["${module.moduleName}"] as const,`);

  if (hasQueries) {
    const hasList = module.endpoints.some((e) => e.isQuery && e.actionName === "List");
    const hasDetail = module.endpoints.some((e) => e.isQuery && e.actionName === "Detail");
    const customQueries = module.endpoints.filter((e) => e.isQuery && !["List", "Detail"].includes(e.actionName));

    if (hasList) {
      lines.push(`  lists: () => [...${module.moduleName}Keys.all, "list"] as const,`);
      lines.push(
        `  list: (params?: Record<string, unknown>) => [...${module.moduleName}Keys.lists(), params] as const,`,
      );
    }
    if (hasDetail) {
      lines.push(`  details: () => [...${module.moduleName}Keys.all, "detail"] as const,`);
      lines.push(`  detail: (id: string) => [...${module.moduleName}Keys.details(), id] as const,`);
    }
    for (const cq of customQueries) {
      const keyName = getCustomQueryFactoryName(cq.actionName);
      lines.push(
        `  ${keyName}: (params?: Record<string, unknown>) => [...${module.moduleName}Keys.all, "${keyName}", params] as const,`,
      );
    }
  }

  lines.push("};");
  lines.push("");

  // ── API Functions ──
  lines.push("// ═══════════════════════════════════════");
  lines.push("//  API Functions");
  lines.push("// ═══════════════════════════════════════");
  lines.push("");

  for (const ep of module.endpoints) {
    const access = `api${ep.accessChain}`;
    const inputParam = ep.hasInput ? `input: ${ep.actionName}Input` : `input?: ${ep.actionName}Input`;

    if (ep.isQuery) {
      // Query functions accept an optional AbortSignal for cancellation
      lines.push(
        `export async function ${ep.functionName}(${inputParam}, signal?: AbortSignal): Promise<${ep.actionName}Output> {`,
      );
      lines.push(
        `  const res = await ${access}.$${ep.method}(${ep.hasInput ? "input as never" : "undefined as never"}, signal ? { init: { signal } } : undefined);`,
      );
    } else {
      lines.push(`export async function ${ep.functionName}(${inputParam}): Promise<${ep.actionName}Output> {`);
      lines.push(
        `  const res = await ${access}.$${ep.method}(${ep.hasInput ? "input as never" : "undefined as never"});`,
      );
    }
    lines.push("  return unwrapResponse(res);");
    lines.push("}");
    lines.push("");
  }

  // ── React Query Hooks ──
  lines.push("// ═══════════════════════════════════════");
  lines.push("//  React Query Hooks");
  lines.push("// ═══════════════════════════════════════");
  lines.push("");

  for (const ep of module.endpoints) {
    if (ep.isQuery) {
      generateQueryHook(lines, ep, module);
    } else {
      generateMutationHook(lines, ep, module);
    }
  }

  return lines.join("\n");
}

function generateQueryHook(lines: string[], ep: EndpointInfo, module: ModuleInfo): void {
  const inputParam = ep.hasInput ? `input: ${ep.actionName}Input` : `input?: ${ep.actionName}Input`;
  const queryKeyCall = getQueryKeyCall(ep, module);

  lines.push(`export function ${ep.hookName}(`);
  lines.push(`  ${inputParam},`);
  lines.push(`  options?: ApiQueryOptions<${ep.actionName}Output>,`);
  lines.push(") {");
  lines.push("  const { silent, successMessage, ...queryOptions } = options ?? {};");
  lines.push("  return useQuery({");
  lines.push(`    queryKey: ${queryKeyCall},`);
  lines.push(
    `    queryFn: ({ signal }) => ${ep.functionName}(input${ep.hasInput ? "" : " ?? ({} as never)"}, signal),`,
  );
  lines.push("    ...queryOptions,");
  lines.push("    meta: { ...queryOptions.meta, silent, successMessage },");
  lines.push("  });");
  lines.push("}");
  lines.push("");
}

function generateMutationHook(lines: string[], ep: EndpointInfo, module: ModuleInfo): void {
  lines.push(`export function ${ep.hookName}(`);
  lines.push(`  options?: ApiMutationOptions<${ep.actionName}Output, ${ep.actionName}Input>,`);
  lines.push(") {");
  lines.push("  const queryClient = useQueryClient();");
  lines.push("  const { silent, successMessage, onSuccess, ...mutationOptions } = options ?? {};");
  lines.push("  return useMutation({");
  lines.push(`    mutationFn: ${ep.functionName},`);
  lines.push("    onSuccess: (data, variables, onMutateResult, context) => {");
  lines.push(`      queryClient.invalidateQueries({ queryKey: ${module.moduleName}Keys.all });`);
  lines.push("      onSuccess?.(data, variables, onMutateResult, context);");
  lines.push("    },");
  lines.push("    ...mutationOptions,");
  lines.push("    meta: { ...mutationOptions.meta, silent, successMessage },");
  lines.push("  });");
  lines.push("}");
  lines.push("");
}

function getQueryKeyCall(ep: EndpointInfo, module: ModuleInfo): string {
  if (ep.actionName === "List") {
    return `${module.moduleName}Keys.list(input as unknown as Record<string, unknown>)`;
  }
  if (ep.actionName === "Detail") {
    return `${module.moduleName}Keys.detail((input as { param?: { id?: string } })?.param?.id ?? "")`;
  }
  const keyName = getCustomQueryFactoryName(ep.actionName);
  const hasCustomKey = module.endpoints.some(
    (endpoint) =>
      endpoint.isQuery &&
      !["List", "Detail"].includes(endpoint.actionName) &&
      getCustomQueryFactoryName(endpoint.actionName) === keyName,
  );
  if (hasCustomKey) {
    return `${module.moduleName}Keys.${keyName}(input as unknown as Record<string, unknown>)`;
  }
  // Fallback: use action name as key
  return `[...${module.moduleName}Keys.all, "${keyName}", input] as const`;
}

// ── Infer module name when basePath is "/" ─────────────────────

/**
 * When routes don't use .basePath(), basePath defaults to "/".
 * Try to infer the module name from the typeName (e.g. RPCSitesRoutesType → sites),
 * falling back to the common first path segment of all endpoints.
 */
function inferModuleName(typeName: string, endpoints: EndpointInfo[]): string {
  // RPCSitesRoutesType → "Sites" → "sites"
  const match = typeName.match(/^RPC(.+?)(?:Routes)?Type$/);
  if (match?.[1]) {
    return toCamelCase(match[1]);
  }
  // Fallback: use the first non-param segment shared across all endpoints
  const firstSegments = endpoints
    .map((e) =>
      e.path
        .split("/")
        .filter(Boolean)
        .find((s) => !s.startsWith(":")),
    )
    .filter((s): s is string => !!s);
  const unique = [...new Set(firstSegments)];
  return unique.length === 1 ? (unique[0] ?? "") : "";
}

function buildModuleIndexExportLines(module: ModuleInfo): string[] {
  const lines: string[] = [];
  const modulePrefix = toPascalCase(module.moduleName);

  const valueExports = new Set<string>([`${module.moduleName}Keys`]);
  const typeExports: string[] = [];

  for (const ep of module.endpoints) {
    valueExports.add(ep.functionName);
    valueExports.add(ep.hookName);
    typeExports.push(`type ${ep.actionName}Input as ${modulePrefix}${ep.actionName}Input`);
    typeExports.push(`type ${ep.actionName}Output as ${modulePrefix}${ep.actionName}Output`);
  }

  const exportSpecifiers = [...valueExports, ...typeExports];

  lines.push(`export {`);
  for (const specifier of exportSpecifiers) {
    lines.push(`  ${specifier},`);
  }
  lines.push(`} from "./${module.fileName}";`);

  return lines;
}

// ── Main ───────────────────────────────────────────────────────

function main(): void {
  const argv = process.argv.slice(2);
  const serverName = parseServerName(argv);
  const packageAlias = parsePackageAlias(argv, serverName);
  const packageExportAlias = parsePackageExportAlias(argv, serverName);
  const serverApiDir = path.resolve(__dirname, `../../${serverName}`);
  const rpcExportsFile = path.join(serverApiDir, "exports/rpc.ts");

  console.log("🚀 Generating RPC hooks...\n");
  console.log(`🔧 Target server: ${serverName}`);
  console.log(`📦 Package import: ${packageAlias}/exports/rpc`);

  if (!existsSync(serverApiDir)) {
    console.error(`❌ server directory not found: ${serverApiDir}`);
    process.exit(1);
  }

  // 1. Read exports/rpc.ts
  if (!existsSync(rpcExportsFile)) {
    console.error(`❌ RPC exports file not found: ${rpcExportsFile}`);
    console.error('   Run "bun export" in server-oc-api first.');
    process.exit(1);
  }

  const rpcContent = readFileSync(rpcExportsFile, "utf-8");
  const rpcModules = parseRpcExports(rpcContent);

  if (rpcModules.length === 0) {
    console.error("❌ No RPC types found in exports/rpc.ts");
    process.exit(1);
  }

  console.log(`📦 Found ${rpcModules.length} RPC modules:\n`);

  // 2. Process each module
  const modules: ModuleInfo[] = [];

  for (const { typeName, sourcePath } of rpcModules) {
    const sourceFile = path.resolve(path.dirname(rpcExportsFile), sourcePath);

    if (!existsSync(sourceFile)) {
      console.warn(`  ⚠️  ${typeName}: source not found (${sourcePath}), skipping`);
      continue;
    }

    const routeContent = readFileSync(sourceFile, "utf-8");
    const { basePath, endpoints } = parseRouteFile(routeContent);

    // Derive names from basePath; when "/" infer from typeName or path prefix
    let cleanBasePath = basePath.replace(/^\//, "");
    if (!cleanBasePath) {
      cleanBasePath = inferModuleName(typeName, endpoints);
    }

    const moduleName = toCamelCase(cleanBasePath.replace(/_/g, "-"));
    const moduleKey = cleanBasePath;
    const fileName = toKebabCase(moduleName);

    // When basePath was "/", strip the virtual base prefix from each endpoint path
    // so that action names and access chains are relative to the module root.
    const virtualBase = basePath === "/" && cleanBasePath ? `/${cleanBasePath}` : "";

    // Populate endpoint names
    for (const ep of endpoints) {
      const relPath =
        virtualBase && ep.path.startsWith(virtualBase) ? ep.path.slice(virtualBase.length) || "/" : ep.path;
      ep.accessChain = buildAccessChain(relPath);
      ep.typeChain = buildTypeChain(relPath, ep.method);
      ep.actionName = generateActionName(ep.method, relPath);
      const { functionName, hookName } = generateEndpointNames(ep.actionName, moduleName);
      ep.functionName = functionName;
      ep.hookName = hookName;
    }

    modules.push({
      typeName,
      sourceFile,
      moduleName,
      moduleKey,
      fileName,
      basePath,
      endpoints,
    });

    console.log(`  ✅ ${typeName} → ${moduleName} (${endpoints.length} endpoints)`);
    for (const ep of endpoints) {
      console.log(`     ${ep.method.toUpperCase().padEnd(7)} ${ep.path.padEnd(28)} → ${ep.hookName}`);
    }
  }

  // 3. Clean & create output directory
  if (existsSync(OUTPUT_DIR)) {
    // Remove old generated files
    for (const file of readdirSync(OUTPUT_DIR)) {
      if (file.endsWith(".ts")) {
        unlinkSync(path.join(OUTPUT_DIR, file));
      }
    }
  } else {
    mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // 4. Generate module files
  console.log("\n📝 Generating files:\n");

  for (const module of modules) {
    const code = generateModuleCode(module, packageAlias, packageExportAlias);
    const filePath = path.join(OUTPUT_DIR, `${module.fileName}.ts`);
    writeFileSync(filePath, code);
    console.log(`  ✅ ${module.fileName}.ts`);
  }

  // 5. Generate index
  const indexLines = [
    "/**",
    " * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT MANUALLY",
    " * Re-generate with: bun run generate:rpc",
    " */",
    "",
    ...modules.flatMap((m) => [...buildModuleIndexExportLines(m), ""]),
    "",
  ];
  writeFileSync(path.join(OUTPUT_DIR, "index.ts"), indexLines.join("\n"));
  console.log("  ✅ index.ts");

  console.log(`\n✅ Done! Generated ${modules.length + 1} files in api/rpc/generated/`);
}

main();
