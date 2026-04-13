import { useTheme } from "../../context/ThemeContext";
import { FILTER_OPTIONS } from "../../data/constants";

export default function FilterBar({ filter, setFilter }) {
  const { c } = useTheme();

  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {FILTER_OPTIONS.map(f => (
        <button key={f} onClick={() => setFilter(f)} style={{
          padding: "6px 11px", borderRadius: 8,
          border: `1px solid ${filter === f ? c.accent : c.border}`,
          background: filter === f ? c.accentDim : "transparent",
          color: filter === f ? c.accent : c.muted,
          cursor: "pointer", fontSize: 11,
          fontFamily: "inherit", fontWeight: 600, transition: "all 0.2s",
        }}>
          {f}
        </button>
      ))}
    </div>
  );
}
