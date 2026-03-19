import * as fs from "node:fs/promises";
import * as path from "node:path";

/**
 * 检查路径（如果是文件路径则提取其目录），然后确保该目录存在。
 * @param {string} fullPath - 可能是目录路径或文件路径。
 * @returns {Promise<string>} 最终确保存在的目录的绝对路径。
 */
export const checkCreateDir = async (fullPath: string): Promise<string> => {
  const absolutePath = path.resolve(fullPath);
  let targetDir = absolutePath;

  try {
    // 1. 尝试获取路径信息
    const stats = await fs.stat(absolutePath);

    if (stats.isDirectory()) {
      // 路径是一个目录，不需要进一步处理
      console.log(`Path ${absolutePath} is already a directory.`);
      return absolutePath;
    } else if (stats.isFile()) {
      // 路径是一个文件，提取其父目录
      targetDir = path.dirname(absolutePath);
      console.log(
        `Path ${absolutePath} is a file. Targeting directory: ${targetDir}`,
      );
    }
    // else: 可能是 pipe, socket, 或其他类型，我们将其视为需要创建目录
  } catch (error) {
    // 捕获 ENOENT 错误 (文件或目录不存在)
    if (
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      // 路径不存在，我们假定它是一个新文件或新目录的路径，
      // 尝试创建其父目录。
      // 注意：如果 fullPath 没有扩展名，如 'tmp/test'，它会被 path.dirname() 返回自身。
      // 我们需要判断它是否看起来像个文件路径。
      // 更安全的方法是，如果路径不以 '/' 或 '\' 结尾，且不是一个已知目录，就按文件路径处理。
      // 但最简单的处理方式是：如果原始路径包含扩展名，就取其父目录。
      // 这里的处理逻辑依赖于外部调用者。在 getScreenshot 场景下，fullPath 是 'tmp/screenshot.png'
      if (path.extname(fullPath).length > 0) {
        targetDir = path.dirname(absolutePath);
      }

      console.log(
        `Path ${absolutePath} does not exist. Attempting to create directory: ${targetDir}`,
      );
    } else {
      // 遇到其他错误（如权限问题），直接抛出
      throw new Error(
        `Unexpected error: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  // 2. 确保目标目录存在
  try {
    // 异步递归创建目录
    await fs.mkdir(targetDir, { recursive: true });
    return targetDir;
  } catch (error) {
    console.error(`Failed to create directory: ${targetDir}`, error);
    throw error;
  }
};
