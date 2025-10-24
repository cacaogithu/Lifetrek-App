import { useEffect, useState } from 'react';

/**
 * Hook to defer execution until browser is idle
 * Improves Time to Interactive by deferring non-critical work
 */
export const useIdleCallback = (callback: () => void, timeout: number = 2000) => {
  const [isIdle, setIsIdle] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use requestIdleCallback if available, otherwise use setTimeout
    const requestIdleCallback = window.requestIdleCallback || ((cb: IdleRequestCallback) => {
      const start = Date.now();
      return setTimeout(() => {
        cb({
          didTimeout: false,
          timeRemaining: () => Math.max(0, 50 - (Date.now() - start)),
        } as IdleDeadline);
      }, 1) as unknown as number;
    });

    const cancelIdleCallback = window.cancelIdleCallback || ((id: number) => clearTimeout(id as any));

    const id = requestIdleCallback(() => {
      setIsIdle(true);
      callback();
    }, { timeout });

    return () => cancelIdleCallback(id);
  }, [callback, timeout]);

  return isIdle;
};
