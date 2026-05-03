import { useTheme } from "../../context/ThemeContext";
import { STATUS_CONFIG } from "../../data/constants";

export default function StatusBadge({ status }) {
  const { c } = useTheme();

  // ✅ "FINE_ISSUED" → "Fine Issued", "APPROVED" → "Approved"
  const normalize = (s) => {
    if (!s) return "Pending";
    return s
      .toLowerCase()
      .replace("_", " ")
      .replace(/\b\w/g, l => l.toUpperCase()); // capitalize each word
  };

  const normalized = normalize(status); // "APPROVED" → "Approved"
  const cfg = STATUS_CONFIG[normalized] || STATUS_CONFIG.Pending;

  return (
    <span style={{
      display:      "inline-flex",
      alignItems:   "center",
      gap:          5,
      padding:      "3px 10px",
      borderRadius: 20,
      fontSize:     11,
      fontWeight:   700,
      background:   c[cfg.col + "Dim"],
      color:        c[cfg.col],
      border:       `1px solid ${c[cfg.col]}33`,
    }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}