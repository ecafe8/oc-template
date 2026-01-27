#!/usr/bin/env node

/**
 * Sync AI Elements components from resource directory to share-ui package
 *
 * This script:
 * 1. Copies components from resource/ai-elements/packages/elements/src to packages/share-ui/src/components/ai-elements
 * 2. Replaces import paths:
 *    - @repo/shadcn-ui/components/ui/* -> @repo/share-ui/components/reui/*
 *    - @repo/shadcn-ui/lib/utils -> @repo/share-ui/utils
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const SOURCE_DIR = path.join(__dirname, "../resource/ai-elements/packages/elements/src");
const TARGET_DIR = path.join(__dirname, "../packages/share-ui/src/components/ai-elements");

// UI path exceptions - maps component names to their target directories
const UI_PATHS = {
  shadcn: ["button-group", "input-group", "empty", "field", "input-otp", "item", "kbd", "sidebar", "spinner"],
  business: [],
  // Add more categories as needed
};

// Generate exception replacements from UI_PATHS
const EXCEPTION_REPLACEMENTS = Object.entries(UI_PATHS).flatMap(([targetDir, components]) =>
  components.map((component) => ({
    from: new RegExp(`@repo/shadcn-ui/components/ui/${component}`, "g"),
    to: `@repo/share-ui/components/${targetDir}/${component}`,
  })),
);

// General import path replacements (processed after exceptions)
const PATH_REPLACEMENTS = [
  {
    from: /@repo\/shadcn-ui\/components\/ui\//g,
    to: "@repo/share-ui/components/reui/",
  },
  {
    from: /@repo\/shadcn-ui\/lib\/utils/g,
    to: "@repo/share-ui/utils",
  },
];

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * Replace import paths in content
 */
function replaceImportPaths(content) {
  let result = content;

  // Process exceptions first (higher priority)
  for (const replacement of EXCEPTION_REPLACEMENTS) {
    result = result.replace(replacement.from, replacement.to);
  }

  // Then process general replacements
  for (const replacement of PATH_REPLACEMENTS) {
    result = result.replace(replacement.from, replacement.to);
  }

  return result;
}

/**
 * Copy file and replace import paths
 */
function copyFileWithReplacements(sourcePath, targetPath) {
  const content = fs.readFileSync(sourcePath, "utf8");
  const modifiedContent = replaceImportPaths(content);
  fs.writeFileSync(targetPath, modifiedContent, "utf8");
  console.log(`✓ Synced: ${path.relative(process.cwd(), targetPath)}`);
}

/**
 * Recursively sync directory
 */
function syncDirectory(sourceDir, targetDir) {
  ensureDir(targetDir);

  const entries = fs.readdirSync(sourceDir, { withFileTypes: true });

  for (const entry of entries) {
    const sourcePath = path.join(sourceDir, entry.name);
    const targetPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      syncDirectory(sourcePath, targetPath);
    } else if (entry.isFile() && (entry.name.endsWith(".tsx") || entry.name.endsWith(".ts"))) {
      copyFileWithReplacements(sourcePath, targetPath);
    } else if (entry.isFile()) {
      // Copy other files as-is
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✓ Copied: ${path.relative(process.cwd(), targetPath)}`);
    }
  }
}

/**
 * Main execution
 */
function main() {
  console.log("🚀 Starting AI Elements sync...\n");

  // Check if source directory exists
  if (!fs.existsSync(SOURCE_DIR)) {
    console.error(`❌ Source directory not found: ${SOURCE_DIR}`);
    process.exit(1);
  }

  // Sync files
  try {
    syncDirectory(SOURCE_DIR, TARGET_DIR);
    console.log("\n✅ AI Elements sync completed successfully!");
  } catch (error) {
    console.error("\n❌ Sync failed:", error.message);
    process.exit(1);
  }
}

// Run the script
main();
