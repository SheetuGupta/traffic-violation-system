import { useTheme }   from "../context/ThemeContext";
import { useReports } from "../context/ReportsContext";
import SpotlightCard  from "../components/ui/SpotlightCard";
import GlitchText     from "../components/ui/GlitchText";
import AnimCounter    from "../components/ui/AnimCounter";
import Chip           from "../components/ui/Chip";
import DonutChart     from "../components/analytics/DonutChart";
import BarChart       from "../components/analytics/BarChart";
import { ANALYTICS_DATA } from "../data/constants";
import { totalFines }     from "../utils/helpers";

export default function AnalyticsPage() {
  const { c }       = useTheme();
  const { reports } = useReports();

  const violations = [
    { label: "Red Light",  val: 38, color: c.red    },
    { label: "No Helmet",  val: 27, color: c.accent  },
    { label: "Speeding",   val: 19, color: c.yellow  },
    { label: "Wrong Side", val: 10, color: c.purple  },
    { label: "Others",     val:  6, color: c.green   },
  ];

  const kpis = [
    { l: "Total Reports", v: reports.length,          i: "📁", col: "accent"  },
    { l: "This Month",    v: 115,                     i: "📅", col: "green"   },
    { l: "Fines Issued",  v: totalFines(reports),     i: "💰", col: "purple"  },
    { l: "Avg Fine",      v: 1250,                    i: "📊", col: "yellow"  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="fade-up">
        <GlitchText text="Analytics Dashboard" color={c.text} size={21} />
        <div style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
          City-wide violation intelligence · Real-time insights
        </div>
      </div>

      {/* KPIs */}
      <div className="stats4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {kpis.map((s, i) => (
          <SpotlightCard key={i} style={{ padding: 18 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
            <AnimCounter value={s.v} color={c[s.col]} size={22} />
            <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{s.l}</div>
          </SpotlightCard>
        ))}
      </div>

      <div className="analytics2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        {/* Donut */}
        <SpotlightCard style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 16, letterSpacing: "0.06em" }}>
            VIOLATION BREAKDOWN
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
            <DonutChart data={violations} />
            <div style={{ display: "flex", flexDirection: "column", gap: 9, flex: 1, minWidth: 110 }}>
              {violations.map(d => (
                <div key={d.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color, flexShrink: 0 }} />
                  <div style={{ fontSize: 11, color: c.muted, flex: 1 }}>{d.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: c.text, fontFamily: "monospace" }}>{d.val}%</div>
                </div>
              ))}
            </div>
          </div>
        </SpotlightCard>

        {/* Bar Chart */}
        <SpotlightCard style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 8, letterSpacing: "0.06em" }}>
            MONTHLY TREND — 2024
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 14 }}>
            <AnimCounter value={ANALYTICS_DATA.monthly[ANALYTICS_DATA.monthly.length - 1]} color={c.accent} size={26} />
            <Chip label="+18.6% ↑" color={c.green} bg={c.greenDim} />
          </div>
          <BarChart data={ANALYTICS_DATA.monthly} months={ANALYTICS_DATA.months} />
        </SpotlightCard>
      </div>

      {/* Top zones */}
      <SpotlightCard style={{ padding: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 18, letterSpacing: "0.06em" }}>
          TOP VIOLATION ZONES
        </div>
        {ANALYTICS_DATA.areas.map((a, i) => (
          <div key={a.name} style={{ marginBottom: 13 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
              <span style={{ fontSize: 13, color: c.text, fontWeight: 600 }}>
                <span style={{ color: c.accent, fontFamily: "monospace", marginRight: 10 }}>#{i + 1}</span>
                {a.name}
              </span>
              <span style={{ fontSize: 12, fontFamily: "monospace", color: c.muted }}>{a.count} reports</span>
            </div>
            <div style={{ height: 7, background: "rgba(128,128,128,0.1)", borderRadius: 4, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 4,
                width: `${(a.count / ANALYTICS_DATA.areas[0].count) * 100}%`,
                background: `linear-gradient(90deg, ${c.accent}, ${c.purple})`,
                transition: "width 1.4s cubic-bezier(0.23,1,0.32,1)",
              }} />
            </div>
          </div>
        ))}
      </SpotlightCard>
    </div>
  );
}
