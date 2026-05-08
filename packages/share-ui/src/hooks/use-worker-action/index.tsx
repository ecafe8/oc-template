import {
  useCallback,
  // useLayoutEffect,
  useEffect,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";
import { type WorkerMessageResponseData, WorkerMessageStatusEnum } from "./type";

export const useWorkerAction = <ResultType = unknown>(actionPath: string) => {
  const [ready, setReady] = useState(false);
  const [result, setResult] = useState<ResultType | null>(null);
  const worker = useRef<Worker | null>(null);

  useEffect(() => {
    if (!worker.current) {
      worker.current = new Worker(new URL(`./worker.ts`, import.meta.url), {
        type: "module",
      });

      const onMessageReceived = (event: MessageEvent<WorkerMessageResponseData>) => {
        // console.log('event.data.status', event);
        switch (event.data.status as WorkerMessageStatusEnum) {
          case WorkerMessageStatusEnum.ready: {
            setReady(true);
            break;
          }
          case WorkerMessageStatusEnum.success: {
            setResult(event.data.result as ResultType);
            break;
          }
          case WorkerMessageStatusEnum.error: {
            console.error(event.data.error);
            toast.error(event.data.error);
            break;
          }
          default: {
            console.warn("unknown message status", event.data);
            return;
          }
        }
      };

      worker.current.addEventListener("message", onMessageReceived);

      worker.current.postMessage({ action: "load", actionPath });

      return () => {
        worker?.current?.removeEventListener("message", onMessageReceived);
        worker?.current?.terminate();
        worker.current = null;
      };
    }
  }, []);

  const handleExecute = useCallback((params: unknown) => {
    if (!worker.current) {
      return;
    }
    worker.current.postMessage({
      action: "execute",
      params,
      actionPath,
    });
  }, []);

  return {
    ready,
    result,
    setResult,
    handleExecute,
  };
};
