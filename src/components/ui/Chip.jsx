/** Small badge / tag chip */
export default function Chip({ label, color, bg, border }) {
  return (
    <span style={{
      display:       "inline-flex",
      alignItems:    "center",
      gap:           5,
      padding:       "4px 12px",
      borderRadius:  20,
      fontSize:      11,
      fontWeight:    700,
      background:    bg || "transparent",
      color,
      border:        `1px solid ${border || color + "33"}`,
      letterSpacing: "0.03em",
      whiteSpace:    "nowrap",
    }}>
      {label}
    </span>
  );
}
