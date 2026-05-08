/** removeBackground 方法的入参 */
export type RemoveBgParams = {
  /** 需要去除背景的图片文件 */
  file: File;
};

/**
 * removeBackground 方法的返回值。
 * Worker 内部将 RawImage 转为 PNG Blob 的 ArrayBuffer（零拷贝 transfer），
 * 主线程通过 mimeType 重建 Blob，再用 URL.createObjectURL() 得到可直接渲染的 URL。
 */
export type RemoveBgResult = {
  result: ArrayBuffer;
  mimeType: string;
};
