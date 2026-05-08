export enum WorkerEnum {
  translation = "translation",
  pinyin = "pinyin",
  tiktoken = "tiktoken",
  removebg = "removebg",
}

export type WorkerParams = {
  workerName: WorkerEnum;
  method: string;
  prevResult?: unknown; // TODO: 暂未使用，上一个方法的执行结果会追加到这个字段传入给下一个方法
  params?: unknown;
};

export type WorkerMethodParams = Omit<WorkerParams, "workerName">;

/**
 * Worker 消息状态枚举
 * 部分状态沿用自 { pipeline } from '@xenova/transformers';
 * initiate: Model file start load: add a new progress item to the list.
 * ready: Pipeline ready: the worker is ready to accept messages.
 * progress: Model file progress: update one of the progress items.
 * done: Model file loaded: remove the progress item from the list.
 */
export enum WorkerMessageStatusEnum {
  initiate = "initiate", // worker 初始化, 用于加载模型
  ready = "ready", // worker 准备就绪，可以接收任务消息
  progress = "progress", // 模型加载进度
  done = "done", // 模型加载完成
  complete = "complete", // worker 方法执行完成
  update = "update", // worker 方法执行时，可更新数据
}
