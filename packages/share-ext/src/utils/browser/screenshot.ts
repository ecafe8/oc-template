import { getCurrentTab } from "@repo/share-ext/utils/browser/tabs";

/**
 * 截取当前活动标签页的可见区域
 */
export async function screenshot(
  params: { keepBase64Prefix?: boolean; tab?: browser.tabs.Tab; window?: browser.windows.Window } = {
    keepBase64Prefix: true,
  },
): Promise<{
  imageBase64: string;
  width: number;
  height: number;
}> {
  const { keepBase64Prefix, tab, window } = params;
  try {
    // 获取当前活动窗口
    const currentWindow = window || (await browser.windows.getCurrent());

    if (!currentWindow.id) {
      throw new Error("无法获取当前窗口 ID");
    }

    // 截取可见区域
    const dataUrl = await browser.tabs.captureVisibleTab(currentWindow.id, {
      format: "png",
    });
    // 获取可视区尺寸
    const currentTab = tab || (await getCurrentTab());
    const width = currentTab.width || 0;
    const height = currentTab.height || 0;

    if (keepBase64Prefix) {
      return {
        imageBase64: dataUrl,
        width,
        height,
      };
    } else {
      // 去掉 dataUrl 的前缀，只保留 base64 部分
      // 例如 "data:image/png;base64,xxxxx"
      // 提取 "xxxxx"
      const base64Prefix = "base64,";
      const base64Index = dataUrl.indexOf(base64Prefix);
      if (base64Index === -1) {
        throw new Error("Invalid dataUrl format");
      }
      const imageBase64 = dataUrl.substring(base64Index + base64Prefix.length);
      return {
        imageBase64,
        width,
        height,
      };
    }
  } catch (error) {
    console.error("截图失败:", error);
    throw error; // 重要：抛出错误而不是吞掉它
  }
}
