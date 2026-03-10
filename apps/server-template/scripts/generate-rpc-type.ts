import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import * as path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";
import fg from "fast-glob";
import { camel, pascal, snake } from "radash";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// scripts/ 的上级即 apps/server-template/
const ROOT = path.resolve(__dirname, "..");

dotenv.config({ path: path.join(ROOT, ".env") });

const exportsDir = path.join(ROOT, "exports");
if (!existsSync(exportsDir)) {
  console.log(`📁 exports 目录不存在,正在创建: ${exportsDir}`);
  mkdirSync(exportsDir, { recursive: true });
}

let files = fg.sync(["src/modules/*/routes/*.ts", "src/modules/*/route.ts"], { cwd: ROOT });

// 1. 收集模块信息
const modules = files
  .map((file) => {
    const name = file.match(/modules\/([^/]+)\//)?.[1];
    if (!name) return null;
    const pascalCaseName = camel(name);
    const typeName = `RPC${pascal(name)}RoutesType`;
    const snakeCaseName = snake(pascalCaseName);
    const importPath = `../src/${file.replace("src/", "")}`; // 相对于 exports/ 目录
    console.log(`✅ Found module: ${name} (${pascalCaseName}, ${typeName}, ${snakeCaseName}, ${importPath})`);
    return { name, pascalCaseName, snakeCaseName, typeName, importPath };
  })
  .filter(Boolean) as {
  name: string;
  pascalCaseName: string;
  snakeCaseName: string;
  typeName: string;
  importPath: string;
}[];

// 2. 生成导入与导出语句
const importLines = modules.map((m) => `import type { ${m.typeName} } from "${m.importPath}";`).join("\n");
const reExportLines = modules.map((m) => `export type { ${m.typeName} };`).join("\n");

// 3. 生成类型定义映射
const inferenceLines = modules
  .map((m) => `const _${m.pascalCaseName}Client = hc<${m.typeName}>(process.env.NEXT_PUBLIC_API_URL!);`)
  .join("\n");

const typeFields = modules
  .map((m) => `  ${m.pascalCaseName}: typeof _${m.pascalCaseName}Client.${m.snakeCaseName};`)
  .join("\n");

// 4. 组装最终内容
const content = `import { hc } from "hono/client";
import type { ClientResponse } from "hono/client";
export { type ClientRequest, type ClientResponse, hc } from "hono/client";
export type { StatusCode } from "hono/utils/http-status";
${importLines}

// --- Re-export RPC types for frontend use ---
${reExportLines}

// --- 类型推断辅助 ---
${inferenceLines}

// --- 类型定义 ---

export type AppRPC = {
${typeFields}
};

`;

writeFileSync(path.join(exportsDir, "rpc.ts"), content);
console.log("✅ Generated exports/rpc.ts (Proxy + React Query Support)");

// 处理 types.ts (保持不变)
files = fg.sync(["src/modules/*/type.ts"], { cwd: ROOT });
let exportsTypes =
  `export type { ApiResponse } from "../src/types/response";
` + files.map((file) => `export * from "../src/${file.replace("src/", "")}";`).join("\n");

const commonFiles = fg.sync(["src/modules/*/types/index.ts"], { cwd: ROOT });
exportsTypes += `\n` + commonFiles.map((file) => `export * from "../src/${file.replace("src/", "")}";`).join("\n");

writeFileSync(path.join(exportsDir, "types.ts"), `${exportsTypes}\n`);
console.log("✅ Generated exports/types.ts");
