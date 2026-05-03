import { useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";

/**
 * Reactbits-style interactive particle grid.
 * Dots repel from the mouse cursor using physics.
 */
export default function ParticleGrid() {
  const { dark } = useTheme();
  const canvasRef = useRef(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let W = (canvas.width  = canvas.offsetWidth);
    let H = (canvas.height = canvas.offsetHeight);
    const COLS = Math.floor(W / 44);
    const ROWS = Math.floor(H / 44);

    const dots = [];
    for (let r = 0; r <= ROWS; r++)
      for (let c = 0; c <= COLS; c++)
        dots.push({ bx: c * 44, by: r * 44, x: c * 44, y: r * 44, vx: 0, vy: 0 });

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    canvas.addEventListener("mousemove", onMove);

    let af;
    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      const m = mouseRef.current;

      dots.forEach(d => {
        const dx   = d.x - m.x;
        const dy   = d.y - m.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const force = Math.max(0, (110 - dist) / 110);

        d.vx += (dx / (dist || 1)) * force * 2.5;
        d.vy += (dy / (dist || 1)) * force * 2.5;
        d.vx += (d.bx - d.x) * 0.09;
        d.vy += (d.by - d.y) * 0.09;
        d.vx *= 0.84;
        d.vy *= 0.84;
        d.x  += d.vx;
        d.y  += d.vy;

        const alpha = dark ? 0.1 + force * 0.45 : 0.07 + force * 0.3;
        ctx.beginPath();
        ctx.arc(d.x, d.y, 1.2 + force * 2, 0, Math.PI * 2);
        ctx.fillStyle = dark
          ? `rgba(0,207,255,${alpha})`
          : `rgba(0,100,220,${alpha})`;
        ctx.fill();
      });

      af = requestAnimationFrame(animate);
    };
    animate();

    const resize = () => {
      W = canvas.width  = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(af);
      canvas.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", resize);
    };
  }, [dark]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
