import * as fs from "fs";
import * as path from "path";
import { describe, expect, it } from "vitest";
import FileConverter from "./index.js";

// 这个测试文件用于集成测试，不使用 Mock，直接读取真实文件
// 请确保在 __fixtures__ 目录下放入了相应的测试文件

describe("FileConverter Integration Tests", () => {
  const converter = new FileConverter();
  const fixturesDir = path.join(__dirname, "__fixtures__");

  it("should convert a real .txt file", async () => {
    const filePath = path.join(fixturesDir, "test.txt");

    // 测试 TXT 文件
    if (!fs.existsSync(filePath)) {
      console.warn("Skipping test: test.txt not found in __fixtures__");
      return;
    }

    const result = await converter.convertFile(filePath);
    expect(result).toBe("Hello World from Fixture!");
  });

  // 测试 PDF 文件
  it("should convert a real .pdf file", async () => {
    const filePath = path.join(fixturesDir, "test.pdf");

    if (!fs.existsSync(filePath)) {
      console.warn("Skipping test: test.pdf not found in __fixtures__");
      return;
    }

    const result = await converter.convertFile(filePath);
    console.log("PDF Conversion Result:", result);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toContain("[object Object]");
  });

  // 测试 Word 文档
  it.skip("should convert a real .docx file", async () => {
    const filePath = path.join(fixturesDir, "test.docx");
    if (!fs.existsSync(filePath)) {
      console.warn("Skipping test: test.docx not found in __fixtures__");
      return;
    }

    const result = await converter.convertFile(filePath);
    console.log("DOCX Conversion Result:", result);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });

  // 测试 Excel 文件
  it("should convert a real .xlsx file", async () => {
    const filePath = path.join(fixturesDir, "test.xlsx");
    if (!fs.existsSync(filePath)) {
      console.warn("Skipping test: test.xlsx not found in __fixtures__");
      return;
    }

    const result = await converter.convertFile(filePath);
    console.log("XLSX Conversion Result:", result);
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
  });
});
