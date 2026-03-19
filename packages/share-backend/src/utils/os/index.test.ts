import * as fs from "node:fs/promises";
import * as path from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { checkCreateDir } from "./index.js";

const TEST_DIR = path.join(__dirname, "test-temp");

describe("checkCreateDir", () => {
  beforeEach(async () => {
    // Ensure test directory is clean before each test
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    // Cleanup after tests
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch (e) {
      // ignore
    }
  });

  it("should return the path if it is an existing directory", async () => {
    const dirPath = path.join(TEST_DIR, "existing-dir");
    await fs.mkdir(dirPath);

    const result = await checkCreateDir(dirPath);
    expect(result).toBe(dirPath);
  });

  it("should return the parent directory if the path is an existing file", async () => {
    const dirPath = path.join(TEST_DIR, "parent-dir");
    await fs.mkdir(dirPath);
    const filePath = path.join(dirPath, "file.txt");
    await fs.writeFile(filePath, "content");

    const result = await checkCreateDir(filePath);
    expect(result).toBe(dirPath);
  });

  it("should create the directory if it does not exist (no extension)", async () => {
    const dirPath = path.join(TEST_DIR, "new-dir");

    const result = await checkCreateDir(dirPath);

    expect(result).toBe(dirPath);
    const stats = await fs.stat(dirPath);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should create the parent directory if the path does not exist and has an extension", async () => {
    const dirPath = path.join(TEST_DIR, "new-parent-dir");
    const filePath = path.join(dirPath, "new-file.txt");

    const result = await checkCreateDir(filePath);

    expect(result).toBe(dirPath);
    const stats = await fs.stat(dirPath);
    expect(stats.isDirectory()).toBe(true);
  });

  it("should create nested directories recursively", async () => {
    const nestedDir = path.join(TEST_DIR, "level1", "level2", "level3");

    const result = await checkCreateDir(nestedDir);

    expect(result).toBe(nestedDir);
    const stats = await fs.stat(nestedDir);
    expect(stats.isDirectory()).toBe(true);
  });
});
