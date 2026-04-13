import { useTheme } from "../../context/ThemeContext";

export default function DonutChart({ data }) {
  const { dark, c } = useTheme();
  const total = data.reduce((s, d) => s + d.val, 0);
  let cum = 0;
  const R = 56, cx = 70, cy = 70, sw = 15;
  const circ = 2 * Math.PI * R;

  return (
    <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={R} fill="none"
        stroke={dark ? "#1A2840" : "#E8F0FF"} strokeWidth={sw} />
      {data.map((d, i) => {
        const off = circ - (d.val / total) * circ;
        const r2  = (cum / total) * 360 - 90;
        cum += d.val;
        return (
          <circle key={i} cx={cx} cy={cy} r={R} fill="none"
            stroke={d.color} strokeWidth={sw}
            strokeDasharray={circ} strokeDashoffset={off}
            strokeLinecap="round"
            transform={`rotate(${r2} ${cx} ${cy})`}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.23,1,0.32,1)" }}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle"
        fill={dark ? "#E4EFFF" : "#0C1A2E"}
        style={{ fontSize: 19, fontWeight: 900, fontFamily: "monospace" }}>
        {total}
      </text>
      <text x={cx} y={cy + 13} textAnchor="middle"
        fill={dark ? "#5E7A9E" : "#4A6280"}
        style={{ fontSize: 8, fontFamily: "monospace", letterSpacing: "0.1em" }}>
        REPORTS
      </text>
    </svg>
  );
}
