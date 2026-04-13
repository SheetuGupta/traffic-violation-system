import { useRef, useCallback } from "react";

/**
 * Reactbits-style Magnetic Button.
 * The button slightly moves toward the cursor on hover.
 */
export default function MagneticButton({
  children,
  onClick,
  style = {},
  accent,
  glow,
  disabled = false,
}) {
  const ref = useRef(null);

  const onMove = useCallback((e) => {
    const btn = ref.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width  / 2;
    const y = e.clientY - r.top  - r.height / 2;
    btn.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px) scale(1.04)`;
  }, []);

  const onLeave = useCallback(() => {
    if (ref.current) ref.current.style.transform = "translate(0,0) scale(1)";
  }, []);

  return (
    <button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      disabled={disabled}
      style={{
        padding:      "13px 26px",
        borderRadius: 13,
        border:       "none",
        cursor:       disabled ? "not-allowed" : "pointer",
        background:   `linear-gradient(135deg, ${accent}, ${accent}BB)`,
        color:        "#fff",
        fontWeight:   800,
        fontSize:     13,
        letterSpacing:"0.06em",
        boxShadow:    `0 4px 24px ${glow}`,
        fontFamily:   "inherit",
        opacity:      disabled ? 0.6 : 1,
        transition:   "transform 0.2s cubic-bezier(0.23,1,0.32,1), box-shadow 0.2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
}
