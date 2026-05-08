import type { ExecutePipelineParams } from "./type";

/**
 * 将数据依次经过多个处理函数（支持同步/异步），返回最终结果。
 *
 * @example
 * ```ts
 * import { executePipeline } from '@/lib/pipeline';
 *
 * // 每个步骤接收上一步的输出作为输入
 * const result = await executePipeline<string>({
 *   input: '你好世界',
 *   pipeline: [
 *     (text) => text.trim(),                        // 同步步骤
 *     async (text) => await translate(text),        // 异步步骤
 *     (text) => text.toUpperCase(),
 *   ],
 * });
 * ```
 */
export async function executePipeline<Output>({ input, pipeline }: ExecutePipelineParams): Promise<Output> {
  return pipeline.reduce(
    (prevPromise, currentFunc) => prevPromise.then(currentFunc),
    Promise.resolve(input),
  ) as Promise<Output>;
}
