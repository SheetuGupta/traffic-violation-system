import { useState, useEffect } from "react";

/**
 * Triggers a short glitch pulse at random intervals.
 * Returns a boolean `glitching`.
 */
export function useGlitch(minMs = 4000, maxMs = 7000, duration = 200) {
  const [glitching, setGlitching] = useState(false);

  useEffect(() => {
    const schedule = () => {
      const delay = minMs + Math.random() * (maxMs - minMs);
      return setTimeout(() => {
        setGlitching(true);
        setTimeout(() => setGlitching(false), duration);
        schedule(); // re-schedule after each glitch
      }, delay);
    };
    const t = schedule();
    return () => clearTimeout(t);
  }, [minMs, maxMs, duration]);

  return glitching;
}
