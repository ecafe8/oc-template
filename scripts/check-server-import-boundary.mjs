#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import fg from "fast-glob";

const ROOT = process.cwd();
const TARGET_GLOBS = ["apps/web-template/**/*.{ts,tsx,mts,cts}", "packages/share-ui/**/*.{ts,tsx,mts,cts}"];
const IGNORE_GLOBS = ["**/node_modules/**", "**/.next/**", "**/dist/**", "**/build/**"];

const SERVER_PREFIX = "@repo/server-template/";
const ALLOWED_TYPE_PATH = /^@repo\/server-template\/modules\/[^/]+\/types(?:\/.*)?$/;
const importRegex = /^\s*import\s+([\s\S]*?)\s+from\s+["']([^"']+)["']/gm;

const violations = [];
const files = fg.sync(TARGET_GLOBS, { cwd: ROOT, absolute: true, ignore: IGNORE_GLOBS });

for (const filePath of files) {
  const content = readFileSync(filePath, "utf8");

  for (const match of content.matchAll(importRegex)) {
    const importClause = (match[1] ?? "").trim();
    const source = (match[2] ?? "").trim();
    if (!source.startsWith(SERVER_PREFIX)) {
      continue;
    }

    const isTypeOnlyImport = importClause.startsWith("type ");
    const isAllowedTypePath = ALLOWED_TYPE_PATH.test(source);

    if (!isAllowedTypePath) {
      violations.push({
        file: path.relative(ROOT, filePath),
        source,
        reason:
          "禁止从 @repo/server-template 导入非 modules/*/types 路径。请改为导入模块类型路径或使用 @repo/server-template-exports/rpc。",
      });
      continue;
    }

    if (!isTypeOnlyImport) {
      violations.push({
        file: path.relative(ROOT, filePath),
        source,
        reason: "允许的 server 类型路径必须使用 `import type`。",
      });
    }
  }
}

if (violations.length > 0) {
  console.error("❌ 检测到 server 导入边界违规：\n");
  for (const item of violations) {
    console.error(`- ${item.file}`);
    console.error(`  source: ${item.source}`);
    console.error(`  reason: ${item.reason}`);
  }
  process.exit(1);
}

console.log("✅ Server 导入边界检查通过");
