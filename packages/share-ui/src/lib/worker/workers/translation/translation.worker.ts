import { pipeline } from "@huggingface/transformers";
import type { WorkerMethodParams } from "../../interface";

/**
 * 模型单例管理。
 * @huggingface/transformers 在浏览器端会将模型文件缓存到 Cache Storage / IndexedDB，
 * 刷新页面后无需重复下载；同一 Worker 进程内通过模块级变量避免重复初始化。
 */
let modelInstance: Awaited<ReturnType<typeof pipeline>> | null = null;

const getModelInstance = async (progress_callback?: (x: unknown) => void) => {
  if (modelInstance === null) {
    modelInstance = await pipeline("translation", "Xenova/nllb-200-distilled-600M", { progress_callback });
  }
  return modelInstance;
};

let isReady = false;

self.addEventListener("message", async (event) => {
  try {
    // 加载模型（首次会触发下载并发送 progress 事件，后续使用缓存实例）
    const executor = await getModelInstance((x) => {
      // 转发 initiate / progress / done 进度消息到主线程
      self.postMessage(x);
    });

    // 模型首次加载完成后发送 ready（只发一次）
    if (!isReady) {
      isReady = true;
      self.postMessage({ status: "ready" });
    }

    // 没有 method 字段视为初始化探测消息，模型加载完即可返回
    if (!event.data?.method) return;

    const { method, params }: WorkerMethodParams = event.data;

    if (method === "translate") {
      const { text, src_lang, tgt_lang } = params as { text: string; src_lang: string; tgt_lang: string };
      const output = (await executor(text, {
        tgt_lang,
        src_lang,
        // 流式输出回调（可选）
        callback_function: (x: unknown) => {
          self.postMessage({
            status: "update",
            output: (
              executor as unknown as { tokenizer: { decode: (ids: unknown, opts: unknown) => string } }
            ).tokenizer.decode((x as { output_token_ids: unknown[] }[])[0].output_token_ids, {
              skip_special_tokens: true,
            }),
          });
        },
      })) as { translation_text: string }[];
      self.postMessage({ result: output[0].translation_text });
    } else {
      throw new Error(`方法 ${method} 未定义`);
    }
  } catch (error: unknown) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
});
