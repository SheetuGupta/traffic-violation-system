import { useTheme } from "../../context/ThemeContext";

/** Shimmer skeleton placeholder block */
export default function Shimmer({ w = "100%", h = 16, r = 8 }) {
  const { dark } = useTheme();
  return (
    <div style={{
      width:    w,
      height:   h,
      borderRadius: r,
      background:   dark ? "#1A2840" : "#E8F0FF",
      position: "relative",
      overflow: "hidden",
      flexShrink: 0,
    }}>
      <div style={{
        position:   "absolute",
        inset:      0,
        background: dark
          ? "linear-gradient(90deg,transparent,rgba(0,207,255,0.08),transparent)"
          : "linear-gradient(90deg,transparent,rgba(255,255,255,0.6),transparent)",
        animation:  "shimmer 1.6s infinite",
      }} />
    </div>
  );
}
