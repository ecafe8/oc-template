import { useCallback, useRef } from "react";

/**
 * 使用 requestAnimationFrame 进行防抖
 */
function useRafDebounce<T extends (...args: unknown[]) => unknown>(fn: T): T {
  const rafRef = useRef<number | undefined>(undefined);

  const cancel = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = undefined;
    }
  }, []);

  const wrapperFn = useCallback(
    (...args: Parameters<T>) => {
      cancel();
      rafRef.current = requestAnimationFrame(() => {
        fn(...args);
      });
    },
    [fn, cancel],
  ) as T;

  return wrapperFn;
}

export default useRafDebounce;
