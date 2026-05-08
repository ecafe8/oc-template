"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { WorkerEnum, WorkerMethodParams } from "../interface";
import { WORKER_FACTORIES } from "../workers";

// 模块级单例 Map，跨组件实例共享同一个 Worker（按需惰性创建）
const workerInstanceMap: Map<WorkerEnum, Worker> = new Map();

export const useWorker = (workerName: WorkerEnum) => {
  const [workerReadyStateMap, setWorkerReadyStateMap] = useState<Map<WorkerEnum, boolean>>(new Map());

  // 用 ref 追踪当前 workerName 对应的 ready 监听器，便于 cleanup 时精确移除
  const readyListenerRef = useRef<((e: MessageEvent) => void) | null>(null);

  // 获取或创建 worker 实例（修复：去掉内层变量遮蔽，改用 WORKER_FACTORIES 惰性创建）
  const getWorkerInstance = useCallback((): Worker => {
    let workerInstance = workerInstanceMap.get(workerName);
    if (!workerInstance) {
      workerInstance = WORKER_FACTORIES[workerName]();
      workerInstanceMap.set(workerName, workerInstance);

      const onReadyReceived = (event: MessageEvent) => {
        if (event.data?.status === "ready") {
          setWorkerReadyStateMap((prev) => {
            const next = new Map(prev);
            next.set(workerName, true);
            return next;
          });
          // ready 只需监听一次，收到后移除
          if (workerInstance) {
            workerInstance.removeEventListener("message", onReadyReceived);
            readyListenerRef.current = null;
          }
        }
      };

      readyListenerRef.current = onReadyReceived;
      workerInstance.addEventListener("message", onReadyReceived);
      // 发送初始化探测消息，触发 worker 回复 ready
      workerInstance.postMessage("run");
    }
    return workerInstance;
  }, [workerName]);

  useEffect(() => {
    getWorkerInstance();

    return () => {
      // 组件卸载时终止 Worker 并清理状态
      const instance = workerInstanceMap.get(workerName);
      if (instance) {
        if (readyListenerRef.current) {
          instance.removeEventListener("message", readyListenerRef.current);
          readyListenerRef.current = null;
        }
        instance.terminate();
        workerInstanceMap.delete(workerName);
        setWorkerReadyStateMap((prev) => {
          const next = new Map(prev);
          next.delete(workerName);
          return next;
        });
      }
    };
  }, [workerName, getWorkerInstance]);

  // 执行单个 worker 方法（修复：补 return、过滤非结果消息、deps 包含 workerName）
  const executeWorkerMethod = useCallback(
    async ({ method, params }: WorkerMethodParams): Promise<unknown> => {
      if (!workerReadyStateMap.get(workerName)) {
        return Promise.reject(new Error("worker 没有准备就绪"));
      }

      const worker = getWorkerInstance();

      return new Promise((resolve, reject) => {
        const messageHandler = (event: MessageEvent) => {
          const data = event.data;
          // 只处理最终结果消息，忽略 ready/progress 等中间状态
          if (!data || (!("result" in data) && !("error" in data))) return;
          worker.removeEventListener("message", messageHandler);
          worker.removeEventListener("error", errorHandler);
          if ("error" in data) reject(new Error(data.error));
          else resolve(data.result);
        };

        const errorHandler = (error: ErrorEvent) => {
          worker.removeEventListener("message", messageHandler);
          worker.removeEventListener("error", errorHandler);
          reject(error);
        };

        worker.addEventListener("message", messageHandler);
        worker.addEventListener("error", errorHandler);

        worker.postMessage({ method, params } as WorkerMethodParams);
      });
    },
    [workerName, workerReadyStateMap, getWorkerInstance],
  );

  const workerReady = useMemo(() => workerReadyStateMap.get(workerName) ?? false, [workerReadyStateMap, workerName]);

  return {
    workerReady,
    executeWorkerMethod,
  };
};
