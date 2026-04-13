import { useTheme } from "../../context/ThemeContext";
import { STATUS_CONFIG } from "../../data/constants";

/** Colored status badge for report rows */
export default function StatusBadge({ status }) {
  const { c } = useTheme();
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Pending;

  return (
    <span style={{
      display:       "inline-flex",
      alignItems:    "center",
      gap:           5,
      padding:       "3px 10px",
      borderRadius:  20,
      fontSize:      11,
      fontWeight:    700,
      background:    c[cfg.col + "Dim"],
      color:         c[cfg.col],
      border:        `1px solid ${c[cfg.col]}33`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}
