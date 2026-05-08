import { pipeline } from "@huggingface/transformers";
import type { WorkerMethodParams } from "../../interface";
import type { RemoveBgParams } from "./type";

/**
 * 模型单例管理。
 * @huggingface/transformers 在浏览器端会将模型文件缓存到 Cache Storage / IndexedDB，
 * 刷新页面后无需重复下载；同一 Worker 进程内通过模块级变量避免重复初始化。
 */
let segmenterInstance: Awaited<ReturnType<typeof pipeline>> | null = null;

const getSegmenterInstance = async (progress_callback?: (x: unknown) => void) => {
  if (segmenterInstance === null) {
    // 模型来自 https://huggingface.co/onnx-community/ormbg-ONNX
    segmenterInstance = await pipeline(
      "background-removal",
      // briaai/RMBG-2.0 效果更好但体积较大，加载慢，且目前浏览器端 ONNX 运行时兼容性不如 onnxruntime-web 好（尤其是 Safari），后续可根据实际情况替换
      "onnx-community/ormbg-ONNX",
      {
        // webgpu 会调用 Apple Silicon 的 GPU 核心。
        // 如果不加这个参数，它可能会退回到 wasm 模式，使用 CPU 运行。
        device: "webgpu",
        progress_callback,
      },
    );
  }
  return segmenterInstance;
};

let isReady = false;

self.addEventListener("message", async (event) => {
  try {
    // 加载模型（首次会触发下载并发送 progress 事件，后续使用缓存实例）
    const segmenter = await getSegmenterInstance((x) => {
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

    if (method === "removeBackground") {
      const { file } = params as RemoveBgParams;
      const fileURL = URL.createObjectURL(file);
      try {
        const outputs = await (segmenter as (input: string) => Promise<{ toBlob: () => Promise<Blob> }[]>)(fileURL);
        const output = outputs[0];
        if (!output) throw new Error("removeBackground: no output returned");
        // 转为 PNG Blob（保留透明通道），取底层 ArrayBuffer 做零拷贝 transfer
        // 相比 base64：无 33% 膨胀，不占用 JS 堆字符串空间
        // 相比直接传 RawImage：transfer 后 Worker 侧自动释放，主线程无需维护双份数据
        const blob = await output.toBlob();
        const arrayBuffer = await blob.arrayBuffer();
        self.postMessage({ result: arrayBuffer, mimeType: blob.type }, { transfer: [arrayBuffer] });
      } finally {
        URL.revokeObjectURL(fileURL);
      }
    } else {
      throw new Error(`方法 ${method} 未定义`);
    }
  } catch (error: unknown) {
    self.postMessage({ error: error instanceof Error ? error.message : String(error) });
  }
});
