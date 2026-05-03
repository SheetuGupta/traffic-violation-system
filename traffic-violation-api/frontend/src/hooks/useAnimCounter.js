import { useState, useEffect } from "react";

/**
 * Animates a numeric value from 0 to `target` over `frames` steps.
 * Returns a formatted display string.
 */
export function useAnimCounter(target, frames = 50, delay = 22) {
  const num = parseFloat(String(target).replace(/[^0-9.]/g, "")) || 0;
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let f = 0;
    const step = num / frames;
    const timer = setInterval(() => {
      f++;
      setDisplay(Math.min(f * step, num));
      if (f >= frames) clearInterval(timer);
    }, delay);
    return () => clearInterval(timer);
  }, [num, frames, delay]);

  const isMoney = String(target).includes("₹");
  const isLakh  = num >= 100000;

  const formatted = isLakh
    ? `₹${(display / 100000).toFixed(1)}L`
    : isMoney
    ? `₹${Math.round(display).toLocaleString()}`
    : num >= 1000
    ? `${(display / 1000).toFixed(1)}K`
    : Math.round(display).toString();

  return formatted;
}
