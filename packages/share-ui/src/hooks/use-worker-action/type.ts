/**
 * Worker 消息状态枚举
//  * 部分状态沿用自 { pipeline } from '@xenova/transformers';
//  * initiate: Model file start load: add a new progress item to the list.
//  * ready: Pipeline ready: the worker is ready to accept messages.
//  * progress: Model file progress: update one of the progress items.
//  * done: Model file loaded: remove the progress item from the list.
 */
export enum WorkerMessageStatusEnum {
  ready = "ready", // worker 准备就绪，可以接收任务消息
  success = "success", // worker 方法执行成功
  error = "error", // worker 方法执行出错
  // TODO 模型加载状态未完成
  // initiate = 'initiate', // worker 初始化, 用于加载模型
  // progress = 'progress', // 模型加载进度
  // done = 'done', // 模型加载完成
  // update = 'update', // worker 方法执行时，可更新数据
}

/**
 * Worker 请求消息体
 */
export type WorkerMessageRequestData = {
  action: "load" | "execute";
  params: unknown;
  actionPath: string;
};
/**
 * Worker 回复消息体
 */
export type WorkerMessageResponseData = {
  status: WorkerMessageStatusEnum;
  result?: unknown;
  error?: string;
};

export type ExecuteFunction = ((params: unknown) => Promise<unknown>) | null;
