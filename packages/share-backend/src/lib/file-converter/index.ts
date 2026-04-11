import * as fs from "node:fs";
import { gfm } from "@joplin/turndown-plugin-gfm";
import * as mammoth from "mammoth";
import * as path from "path";
// --- 外部库导入 ---
import { PDFParse } from "pdf-parse";
import TurndownService from "turndown";
import * as XLSX from "xlsx";

// const { checkCreateDir } = os;

/**
 * 核心文件转换器类
 * 负责识别文件类型并调用对应的转换方法，最终输出 Markdown 文本。
 */
class FileConverter {
  private turndownService: TurndownService;

  private readonly pdfTextKeys = ["text", "content", "rawText"] as const;

  constructor() {
    // 配置 TurndownService 实例
    this.turndownService = new TurndownService({
      headingStyle: "atx", // 使用 # 风格的标题
      codeBlockStyle: "fenced", // 使用 ``` 风格的代码块
      emDelimiter: "*", // 使用 * 进行强调
    });
    // 允许转换过程中保留图片标签，但需要进一步处理图片的路径
    this.turndownService.keep(["img"]);
    // 支持表格等扩展语法
    this.turndownService.use(gfm);
  }

  /**
   * 主转换方法：根据文件路径处理文件
   * @param filePath 文件的绝对或相对路径
   * @returns 转换后的 Markdown 文本
   */
  public async convertFile(filePath: string): Promise<string> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件未找到: ${filePath}`);
    }

    const ext = path.extname(filePath).toLowerCase();
    console.log(`正在处理文件: ${path.basename(filePath)}, 类型: ${ext}`);

    try {
      switch (ext) {
        case ".txt":
          return this.convertTxtToMd(filePath);
        case ".pdf":
          return await this.convertPdfToMd(filePath);
        case ".docx":
          return await this.convertDocxToMd(filePath);
        case ".html":
        case ".htm":
          return this.convertHtmlToMd(filePath);
        case ".xlsx":
        case ".xls":
          return this.convertXlsxToMd(filePath);
        // 默认处理，如果遇到不支持的格式
        default:
          throw new Error(`不支持的文件格式: ${ext}`);
      }
    } catch (error) {
      console.error(`转换 ${path.basename(filePath)} 时发生错误:`, error);
      // 抛出更具体的错误信息
      throw new Error(
        `文件转换失败: ${error instanceof Error ? error.message : "未知错误"}`,
      );
    }
  }

  // --- 转换实现方法 ---

  /** 纯文本 (.txt) 转换 */
  private convertTxtToMd(filePath: string): string {
    const content = fs.readFileSync(filePath, "utf-8");
    return content;
  }

  /** PDF 文档 (.pdf) 转换 (包含表格处理) */
  private async convertPdfToMd(filePath: string): Promise<string> {
    const dataBuffer = fs.readFileSync(filePath);
    let markdownOutput = "";

    // 1. 初始化解析器
    const parser = new PDFParse({ data: dataBuffer });

    // 2. 提取表格数据
    const tableResult = await parser.getTable();

    // 3. 提取基础文本

    const basicText = this.normalizePdfTextResult(await parser.getText());
    markdownOutput += basicText;

    await parser.destroy(); // 释放资源

    // --- 处理提取到的表格 ---
    if (tableResult && tableResult.pages.length > 0) {
      markdownOutput += "\n\n## 结构化表格内容\n";

      tableResult.pages.forEach((page: { tables?: string[][][] }, pageIndex: number) => {
        if (page.tables && page.tables.length > 0) {
          markdownOutput += `\n### 页面 ${pageIndex + 1} 中的表格\n`;

          page.tables.forEach((tableData: string[][], tableIndex: number) => {
            if (tableData.length === 0) return;

            // 确保表格有足够的行来区分表头和内容
            if (tableData.length < 2) {
              markdownOutput += `\n**注意：** 页面 ${pageIndex + 1} 中的表格 ${tableIndex + 1} 内容不足，无法转换为标准 Markdown 表格。\n`;
              // 转换成列表或简单文本，防止崩溃
              markdownOutput += tableData.flat().join(" | ") + "\n";
              return;
            }

            // 假设第一行是表头
            const [header, ...rows] = tableData;

            markdownOutput += `\n#### 表格 ${tableIndex + 1}\n\n`;

            // A. 创建表头
            markdownOutput += "| " + header?.join(" | ") + " |\n";

            // B. 创建分隔线
            markdownOutput += "|" + " --- |".repeat(header?.length || 0) + "\n";

            // C. 创建行数据 (处理内容中的管道符 | )
            rows.forEach((row) => {
              const rowData = row.map((cell) =>
                (cell || "").toString().trim().replace(/\|/g, "\\|"),
              );

              // 确保行有足够的单元格，用空字符串填充
              const paddedRow = new Array(header?.length || 0).fill("");
              rowData.forEach((cell, i) => {
                paddedRow[i] = cell;
              });

              markdownOutput += "| " + paddedRow.join(" | ") + " |\n";
            });
            markdownOutput += "\n"; // 表格后空一行
          });
        }
      });
    }

    return markdownOutput.trim();
  }

  private normalizePdfTextResult(result: unknown): string {
    if (typeof result === "string") {
      return result;
    }

    if (!result || typeof result !== "object") {
      return "";
    }

    const resultRecord = result as Record<string, unknown>;

    for (const key of this.pdfTextKeys) {
      const value = resultRecord[key];

      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }

    const pages = resultRecord.pages;
    if (Array.isArray(pages)) {
      const pageText = pages
        .map((page) => {
          if (!page || typeof page !== "object") {
            return "";
          }

          const pageRecord = page as Record<string, unknown>;

          for (const key of this.pdfTextKeys) {
            const value = pageRecord[key];
            if (typeof value === "string" && value.trim()) {
              return value;
            }
          }

          return "";
        })
        .filter(Boolean)
        .join("\n\n");

      if (pageText.trim()) {
        return pageText;
      }
    }

    return "";
  }

  /** DOCX 文档 (.docx) 转换 */
  private async convertDocxToMd(filePath: string): Promise<string> {
    // 先转 HTML，再用 Turndown 优化
    const { value: htmlContent } = await mammoth.convertToHtml({
      path: filePath,
    });
    return this.turndownService.turndown(htmlContent);
  }

  /** HTML 文档 (.html/.htm) 转换 */
  private convertHtmlToMd(filePath: string): string {
    const htmlContent = fs.readFileSync(filePath, "utf-8");
    return this.turndownService.turndown(htmlContent);
  }

  /** XLSX 文档 (.xlsx) 转换 */
  private convertXlsxToMd(filePath: string, maxColIndex = 19): string {
    const workbook = XLSX.readFile(filePath);
    let htmlOutput = "";

    workbook.SheetNames.forEach((sheetName: string) => {
      const worksheet = workbook.Sheets[sheetName];

      if (!worksheet) {
        return;
      }

      // 1. 获取工作表的有效范围 (例如 "A1:G100")
      const ref = worksheet["!ref"];
      if (ref) {
        // 解析当前的范围
        const range = XLSX.utils.decode_range(ref);

        // 假设最多需要包含到第 20 列 (索引 19)
        // const maxColIndex = 19; // 例如：到 T 列

        // 强制将范围的结束列设置为 maxColIndex（例如：从 G 扩展到 T）
        if (range.e.c < maxColIndex) {
          range.e.c = maxColIndex;
        }

        // 重新编码范围字符串 (例如 "A1:G100" 变为 "A1:T100")
        worksheet["!ref"] = XLSX.utils.encode_range(range);
      }

      // --- 调用 sheet_to_html ---
      const tableHtml = XLSX.utils.sheet_to_html(worksheet, {
        id: `table-${sheetName}`,
        header: '<H3>$SheetName</H3><table id="$id">',
        footer: "</table>",
      });

      htmlOutput += `<div id="table-${sheetName}">${tableHtml}</div>\n`;

      console.log(`已处理工作表: ${sheetName}`);
      console.log(htmlOutput);
    });

    // 2. 将所有的 HTML 内容（包含所有表格）交给 TurndownService 处理
    const markdownContent = this.turndownService.turndown(
      `<html><body>${htmlOutput}</body></html>`,
    );

    return markdownContent.trim();
  }
}
export default FileConverter;
