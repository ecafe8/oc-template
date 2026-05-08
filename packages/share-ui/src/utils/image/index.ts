/**
 * 将 WEBP 格式的 File/Blob 转换为 PNG 格式
 *
 * @param webpFile - 待转换的 WEBP 文件或 Blob 对象
 * @returns 转换后的 PNG File 对象
 *
 * @example
 * ```ts
 * const input = document.querySelector<HTMLInputElement>('input[type="file"]');
 * const file = input.files?.[0];
 * if (file) {
 *   const pngFile = await webpToPng(file);
 *   console.log(pngFile.name); // 'photo.png'
 * }
 * ```
 */
export function webpToPng(webpFile: File | Blob): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(webpFile);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error("Failed to get canvas 2D context"));
        return;
      }
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        if (!blob) {
          reject(new Error("Failed to convert canvas to blob"));
          return;
        }
        const fileName = webpFile instanceof File ? webpFile.name.replace(/\.webp$/, ".png") : "image.png";
        const convertedFile = new File([blob], fileName, { type: "image/png" });
        resolve(convertedFile);
      }, "image/png");
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load WEBP image"));
    };

    img.src = url;
  });
}

/**
 * 对图像数据的 Alpha 通道进行归一化处理，以获得更好的透明度效果
 *
 * @param imageData - 待处理的 ImageData 对象
 * @returns 处理后的 ImageData 对象（原地修改并返回）
 *
 * @example
 * ```ts
 * const canvas = document.createElement('canvas');
 * const ctx = canvas.getContext('2d')!;
 * ctx.drawImage(img, 0, 0);
 * const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
 * const normalized = normalizeAlphaPixels(imageData);
 * ctx.putImageData(normalized, 0, 0);
 * ```
 */
export function normalizeAlphaPixels(imageData: ImageData): ImageData {
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3] ?? 0;
    let v = ((alpha - 127) * 255) / 59;
    v = Math.round(v);
    data[i + 3] = Math.max(0, Math.min(255, v));
  }
  return imageData;
}

/**
 * 根据处理结果生成可下载的 PNG 图片 Data URL
 *
 * @param result - 图像处理结果数组，每项包含像素数据、宽度和高度
 * @returns PNG 格式的 Data URL 字符串
 *
 * @example
 * ```ts
 * const result = [{ data: new Uint8ClampedArray(width * height * 4), width: 100, height: 100 }];
 * const dataURL = createDownloadableImage(result);
 * const img = document.createElement('img');
 * img.src = dataURL;
 * ```
 */
export function createDownloadableImage(
  result: Array<{ data: Uint8ClampedArray<ArrayBuffer>; width: number; height: number }>,
): string {
  const item = result[0];
  if (!item) throw new Error("Result is empty");
  const imageData = item.data;
  const imageWidth = item.width;
  const imageHeight = item.height;

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imageWidth;
  canvas.height = imageHeight;

  let imageDataObj = new ImageData(imageData, imageWidth, imageHeight);
  imageDataObj = normalizeAlphaPixels(imageDataObj);

  if (!ctx) throw new Error("Failed to get canvas 2D context");
  ctx.putImageData(imageDataObj, 0, 0);

  return canvas.toDataURL("image/png");
}

/**
 * 将处理结果导出并触发浏览器下载为 PNG 图片
 *
 * @param result - 图像处理结果数组，每项包含像素数据、宽度和高度
 * @param originalName - 原始文件名，用于生成下载文件名，默认为 'image-download.png'
 *
 * @example
 * ```ts
 * // 下载的图片，文件名自动附加时间戳
 * downloadImage(result, 'avatar.png');
 * // 生成的文件名如 'avatar-download-1746691200000.png'
 *
 * downloadImage(result);
 * // 使用默认文件名如 'image-download-1746691200000.png'
 * ```
 */
export function downloadImage(
  result: Array<{ data: Uint8ClampedArray<ArrayBuffer>; width: number; height: number }>,
  originalName = "image-download.png",
): void {
  const imgURL = createDownloadableImage(result);

  const a = document.createElement("a");
  a.href = imgURL;

  const timestamp = Date.now();
  const baseName = originalName.includes(".")
    ? originalName.replace(/\.(jpg|jpeg|webp|png)$/i, `-download-${timestamp}.png`)
    : `image-download-${timestamp}.png`;

  a.download = baseName;
  a.click();
}

/**
 * 将文件大小（字节数）格式化为人类可读的字符串
 *
 * @param bytes - 文件大小，单位为字节
 * @returns 格式化后的大小字符串，如 '1.23 MB'
 *
 * @example
 * ```ts
 * formatFileSize(0);       // '0 Bytes'
 * formatFileSize(1024);    // '1 KB'
 * formatFileSize(1048576); // '1 MB'
 * formatFileSize(file.size); // '2.34 MB'
 * ```
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
}
