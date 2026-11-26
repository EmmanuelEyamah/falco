import { useEffect, useRef, useState } from "react";

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

/** Runs a number from its current value to `target`, restarting whenever the target changes. */
export const useCountUp = (target: number, duration = 900, delay = 0) => {
  const [value, setValue] = useState(0);
  const from = useRef(0);

  useEffect(() => {
    let frame = 0;
    let start = 0;
    const begin = from.current;
    const timer = setTimeout(() => {
      const tick = (now: number) => {
        if (!start) start = now;
        const t = Math.min(1, (now - start) / duration);
        const next = begin + (target - begin) * easeOut(t);
        from.current = next;
        setValue(next);
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [target, duration, delay]);

  return value;
};
