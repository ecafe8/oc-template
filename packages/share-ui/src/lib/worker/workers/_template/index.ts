import type { WorkerMethodParams } from '../../interface';

// worker 示例
self.addEventListener('message', async (event) => {
  const { method, params }: WorkerMethodParams = event.data;
  // if (params?.prevResult) {
  //   const { prevResult, ...rest } = params; // 获取上一个任务的结果
  // }

  // 使用 prevResult 进行处理
  // ...
  // result = someFunction(prevResult, ...rest);

  // self.postMessage(result);
});
