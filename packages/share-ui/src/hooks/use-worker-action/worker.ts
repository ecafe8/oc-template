import type { ExecuteFunction, WorkerMessageRequestData } from "./type";

const ActionCacheMap: Map<string, unknown> = new Map();

const loadActionModule = async (actionPath: string) => {
  let actionModule = ActionCacheMap.get(actionPath);
  if (!actionModule) {
    /**
     * 移植指南：修改下方 import() 的模板字符串前缀/后缀以适配目标项目目录结构。
     * 当前约定：前缀 `@repo/share-ui/`，后缀 `/action`
     * 注意：必须保留静态前缀/后缀字面量，webpack 依赖此进行静态分析和打包。
     * action 模块须导出：`export const execute = async (params: any) => any`
     */
    actionModule = await import(`@repo/share-ui/${actionPath}/action`);
    ActionCacheMap.set(actionPath, actionModule);
  }
  return actionModule;
};

self.onmessage = async (event: MessageEvent<WorkerMessageRequestData>) => {
  const { params, action, actionPath } = event.data;
  switch (action) {
    case "load": {
      await loadActionModule(actionPath);
      self.postMessage({
        status: "ready",
      });
      break;
    }
    case "execute": {
      try {
        // 暂时约定所有的 action 模块必须导出一个 execute 方法，用于执行调用。
        const actionModule = await loadActionModule(actionPath);
        const execute: ExecuteFunction = (actionModule as { execute?: ExecuteFunction }).execute ?? null;
        if (execute && typeof execute === "function") {
          const result = await execute?.(params);
          self.postMessage({ status: "success", result });
        } else {
          throw new Error("Worker not ready or execute is not a function.");
        }
      } catch (error: unknown) {
        console.error(error);
        self.postMessage({ status: "error", error: error instanceof Error ? error.message : String(error) });
      }
      break;
    }
    default:
      self.postMessage({
        status: "error",
        error: `Action ${action} not defined.`,
      });
      return;
  }
};
