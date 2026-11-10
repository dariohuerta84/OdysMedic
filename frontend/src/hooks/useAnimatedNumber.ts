import { useEffect, useRef, useState } from 'react';

/**
 * Smoothly animates a numeric value from its previous state (or initialFrom on mount)
 * to `target` using cubic ease-out via requestAnimationFrame.
 */
export function useAnimatedNumber(
  target: number,
  durationMs: number = 800,
  initialFrom: number = 0
): number {
  const [displayValue, setDisplayValue] = useState<number>(initialFrom);
  const currentRef = useRef<number>(initialFrom);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      currentRef.current = target;
      setDisplayValue(target);
      return;
    }

    const startValue = currentRef.current;
    const delta = target - startValue;
    if (Math.abs(delta) < 0.01 || durationMs <= 0) {
      currentRef.current = target;
      setDisplayValue(target);
      return;
    }

    let rafId = 0;
    const startTime = performance.now();

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextVal = startValue + delta * eased;
      currentRef.current = nextVal;
      setDisplayValue(nextVal);

      if (progress < 1) {
        rafId = window.requestAnimationFrame(tick);
      } else {
        currentRef.current = target;
        setDisplayValue(target);
      }
    };

    rafId = window.requestAnimationFrame(tick);
    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [target, durationMs]);

  return displayValue;
}

export default useAnimatedNumber;
