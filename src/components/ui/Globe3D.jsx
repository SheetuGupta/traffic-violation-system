import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

/** Rotating 3D dot-globe rendered on a Canvas */
export default function Globe3D({ size = 180 }) {
  const { dark } = useTheme();
  const ref = useRef(null);
  const rot = useRef(0);
  const af  = useRef(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    const W = cv.width = size, H = cv.height = size;
    const cx = W / 2, cy = H / 2, R = size * 0.4;

    const dots = [];
    for (let lat = -80; lat <= 80; lat += 18)
      for (let lon = 0; lon < 360; lon += 18)
        dots.push({ lat: (lat * Math.PI) / 180, lon: (lon * Math.PI) / 180 });

    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      rot.current += 0.007;

      // Glow
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
      g.addColorStop(0, dark ? "rgba(0,100,180,0.22)" : "rgba(180,210,255,0.35)");
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();

      // Outline
      ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = dark ? "rgba(0,207,255,0.12)" : "rgba(0,112,216,0.12)";
      ctx.lineWidth = 1; ctx.stroke();

      // Latitude rings
      for (let lat = -60; lat <= 60; lat += 30) {
        const lr = (lat * Math.PI) / 180;
        ctx.beginPath();
        ctx.ellipse(cx, cy + R * Math.sin(lr), R * Math.cos(lr), R * Math.cos(lr) * 0.16, 0, 0, Math.PI * 2);
        ctx.strokeStyle = dark ? "rgba(0,207,255,0.05)" : "rgba(0,112,216,0.07)";
        ctx.stroke();
      }

      // Dots
      dots.forEach(({ lat, lon }) => {
        const al = lon + rot.current;
        const x3 = R * Math.cos(lat) * Math.sin(al);
        const y3 = R * Math.sin(lat);
        const z3 = R * Math.cos(lat) * Math.cos(al);
        if (z3 > -5) {
          const a = (z3 / R) * 0.6 + 0.08;
          ctx.beginPath(); ctx.arc(cx + x3, cy - y3, 1.2, 0, Math.PI * 2);
          ctx.fillStyle = dark ? `rgba(0,207,255,${a})` : `rgba(0,112,216,${a})`;
          ctx.fill();
        }
      });

      // Hotspot pins
      [[0.5, 1.4], [0.2, 2.3], [-0.1, 0.8]].forEach(([lat, lon]) => {
        const l  = lon + rot.current;
        const z3 = R * Math.cos(lat) * Math.cos(l);
        if (z3 > 0) {
          const px = cx + R * Math.cos(lat) * Math.sin(l);
          const py = cy - R * Math.sin(lat);
          ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fillStyle = dark ? "#FF3355" : "#D8003A"; ctx.fill();
          ctx.beginPath();
          ctx.arc(px, py, 5 + Math.sin(Date.now() / 280) * 2, 0, Math.PI * 2);
          ctx.strokeStyle = dark ? "rgba(255,51,85,0.4)" : "rgba(216,0,58,0.3)";
          ctx.lineWidth = 1; ctx.stroke();
        }
      });

      af.current = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(af.current);
  }, [dark, size]);

  return <canvas ref={ref} style={{ display: "block" }} />;
}
