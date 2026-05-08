import type { WorkerMethodParams } from "../../interface";
import { text2pinyin } from "./action";

const ACTION_MAP: Record<string, (p: unknown) => unknown | Promise<unknown>> = {
  text2pinyin: (p) => text2pinyin(p as string),
};

self.addEventListener("message", async (event) => {
  // 没有 method 字段认为是初始化探测消息，回复 ready（不会占据正常消息的 resolve）
  if (!event.data?.method) {
    self.postMessage({ status: "ready" });
    return;
  }

  const { method, params }: WorkerMethodParams = event.data;

  try {
    const func = ACTION_MAP[method];
    if (typeof func !== "function") {
      throw new Error(`函数 ${method} 未定义`);
    }
    const result = await func(params);
    self.postMessage({ result });
  } catch (error: unknown) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
});
