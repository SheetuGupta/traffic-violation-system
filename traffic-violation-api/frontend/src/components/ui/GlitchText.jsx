import { useGlitch } from "../../hooks/useGlitch";

/**
 * Reactbits-style Glitch Text.
 * Periodically shows RGB-split chromatic aberration effect.
 */
export default function GlitchText({ text, color, size = 28, as: Tag = "span" }) {
  const glitching = useGlitch();

  return (
    <Tag style={{
      position:    "relative",
      display:     "inline-block",
      fontSize:    size,
      fontWeight:  900,
      color,
      fontFamily:  "inherit",
      letterSpacing: "-0.5px",
    }}>
      {text}

      {glitching && (
        <>
          <span style={{
            position:   "absolute",
            left: 2, top: 0,
            color:      "rgba(255,50,80,0.7)",
            clipPath:   "polygon(0 20%,100% 20%,100% 40%,0 40%)",
            animation:  "glitch1 0.15s steps(1) infinite",
            pointerEvents: "none",
          }}>
            {text}
          </span>
          <span style={{
            position:   "absolute",
            left: -2, top: 0,
            color:      "rgba(0,207,255,0.7)",
            clipPath:   "polygon(0 62%,100% 62%,100% 80%,0 80%)",
            animation:  "glitch2 0.15s steps(1) infinite",
            pointerEvents: "none",
          }}>
            {text}
          </span>
        </>
      )}
    </Tag>
  );
}
