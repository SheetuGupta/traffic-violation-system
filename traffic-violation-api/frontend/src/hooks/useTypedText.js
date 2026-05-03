import { useState, useEffect } from "react";

/**
 * Cycles through an array of words with a typewriter effect.
 * Returns { display, done } — `done` is true when word is fully typed.
 */
export function useTypedText(words, typeSpeed = 80, deleteSpeed = 45, pauseMs = 1800) {
  const [idx, setIdx]     = useState(0);
  const [chars, setChars] = useState(0);
  const [del, setDel]     = useState(false);

  useEffect(() => {
    const word = words[idx];

    if (!del && chars < word.length) {
      const t = setTimeout(() => setChars(c => c + 1), typeSpeed);
      return () => clearTimeout(t);
    }
    if (!del && chars === word.length) {
      const t = setTimeout(() => setDel(true), pauseMs);
      return () => clearTimeout(t);
    }
    if (del && chars > 0) {
      const t = setTimeout(() => setChars(c => c - 1), deleteSpeed);
      return () => clearTimeout(t);
    }
    if (del && chars === 0) {
      setDel(false);
      setIdx(i => (i + 1) % words.length);
    }
  }, [chars, del, idx, words, typeSpeed, deleteSpeed, pauseMs]);

  return {
    display: words[idx].slice(0, chars),
    done: !del && chars === words[idx].length,
  };
}
