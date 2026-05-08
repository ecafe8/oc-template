import type { WorkerEnum } from '../interface';

// 使用工厂函数延迟创建 worker，避免模块加载时立即实例化所有 Worker
export const WORKER_FACTORIES: Record<WorkerEnum, () => Worker> = {
  pinyin: () =>
    new Worker(new URL('./pinyin/pinyin.worker.ts', import.meta.url), {
      type: 'module',
    }),
  tiktoken: () =>
    new Worker(new URL('./tiktoken/tiktoken.worker.ts', import.meta.url), {
      type: 'module',
    }),
  translation: () =>
    new Worker(
      new URL('./translation/translation.worker.ts', import.meta.url),
      {
        type: 'module',
      },
    ),
  removebg: () =>
    new Worker(new URL('./removebg/removebg.worker.ts', import.meta.url), {
      type: 'module',
    }),
};
