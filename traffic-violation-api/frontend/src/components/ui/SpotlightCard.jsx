import { useRef, useState } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Reactbits-style Spotlight Card.
 * A radial light follows the mouse inside the card.
 */
export default function SpotlightCard({ children, style = {}, className = "" }) {
  const { dark, c } = useTheme();
  const ref = useRef(null);
  const [spot, setSpot] = useState({ x: "50%", y: "50%", op: 0 });

  const onMove = (e) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setSpot({ x: `${e.clientX - r.left}px`, y: `${e.clientY - r.top}px`, op: 1 });
  };
  const onLeave = () => setSpot(s => ({ ...s, op: 0 }));

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      style={{
        position:  "relative",
        overflow:  "hidden",
        background: c.surface,
        border:    `1px solid ${c.border}`,
        borderRadius: 16,
        boxShadow: c.shadow,
        ...style,
      }}
    >
      {/* Spotlight layer */}
      <div style={{
        position:   "absolute",
        inset:      0,
        pointerEvents: "none",
        zIndex:     0,
        background: `radial-gradient(280px circle at ${spot.x} ${spot.y}, ${
          dark ? "rgba(0,207,255,0.06)" : "rgba(0,112,216,0.05)"
        }, transparent 70%)`,
        opacity:    spot.op,
        transition: "opacity 0.4s",
      }} />

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
