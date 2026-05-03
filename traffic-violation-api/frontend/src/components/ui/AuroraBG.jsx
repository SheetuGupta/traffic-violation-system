import { useTheme } from "../../context/ThemeContext";

/**
 * Reactbits-style Aurora Background
 * Animated radial gradient blobs that drift slowly.
 */
export default function AuroraBG() {
  const { dark } = useTheme();

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* Base gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: dark
          ? "radial-gradient(ellipse 80% 50% at 20% -10%,rgba(0,180,255,0.12) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 110%,rgba(100,40,255,0.10) 0%,transparent 60%)"
          : "radial-gradient(ellipse 80% 50% at 20% -10%,rgba(0,120,220,0.09) 0%,transparent 60%),radial-gradient(ellipse 60% 40% at 80% 110%,rgba(80,0,200,0.06) 0%,transparent 60%)",
      }} />

      {/* Animated blobs */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position:     "absolute",
          width:        ["600px", "400px", "500px"][i],
          height:       ["600px", "400px", "500px"][i],
          borderRadius: "50%",
          background:   dark
            ? ["rgba(0,180,255,0.06)", "rgba(120,60,255,0.05)", "rgba(0,255,150,0.03)"][i]
            : ["rgba(0,100,220,0.05)", "rgba(100,40,200,0.04)", "rgba(0,180,120,0.03)"][i],
          filter:       "blur(60px)",
          animation:    `blob${i} ${[18, 22, 16][i]}s ease-in-out infinite alternate`,
          top:          ["-10%", "40%", "60%"][i],
          left:         ["-5%", "60%", "10%"][i],
        }} />
      ))}
    </div>
  );
}
