import { useTheme } from "../../context/ThemeContext";

export default function BarChart({ data, months }) {
  const { dark, c } = useTheme();
  const maxV = Math.max(...data);

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 76 }}>
        {data.map((v, i) => (
          <div key={i}
            style={{
              flex: 1, borderRadius: "4px 4px 0 0", minHeight: 4,
              height: `${(v / maxV) * 100}%`,
              background: i === data.length - 1
                ? `linear-gradient(to top, ${c.accent}, ${c.accent}77)`
                : dark ? "rgba(0,207,255,0.18)" : "rgba(0,112,216,0.14)",
              transition: "height 1s ease", cursor: "default",
            }}
            title={`${months[i]}: ${v}`}
          />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
        {months.map(m => (
          <span key={m} style={{ fontSize: 9, color: c.dim }}>{m}</span>
        ))}
      </div>
    </>
  );
}
