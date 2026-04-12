import { useEffect } from "react";

/**
 * 观察DOM变化的hook
 */
function useMutateObserver(
  targets: HTMLElement[],
  callback: (mutations: MutationRecord[]) => void,
  options: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  },
): void {
  useEffect(() => {
    if (!targets.length) {
      return;
    }

    const observer = new MutationObserver(callback);

    targets.forEach((target) => {
      if (target) {
        observer.observe(target, options);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [targets, callback, options]);
}

export default useMutateObserver;
