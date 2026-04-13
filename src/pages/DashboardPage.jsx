import { useTheme }   from "../context/ThemeContext";
import { useAuth }    from "../context/AuthContext";
import { useReports } from "../context/ReportsContext";
import SpotlightCard  from "../components/ui/SpotlightCard";
import Globe3D        from "../components/ui/Globe3D";
import TypedText      from "../components/ui/TypedText";
import AnimCounter    from "../components/ui/AnimCounter";
import MagneticButton from "../components/ui/MagneticButton";
import Chip           from "../components/ui/Chip";
import ReportRow      from "../components/shared/ReportRow";
import { TYPED_WORDS, HERO_STRIP_STATS } from "../data/constants";
import { totalFines } from "../utils/helpers";

const STRIP_COLORS = ["accent", "green", "yellow", "purple"];

export default function DashboardPage({ setTab }) {
  const { c, dark } = useTheme();
  const { user }    = useAuth();
  const { reports, updateStatus } = useReports();

  const stats = [
    { l: "Total Reports",    v: reports.length,                                          col: "accent", i: "📁" },
    { l: "Pending Review",   v: reports.filter(r => r.status === "Pending").length,      col: "yellow", i: "⏳" },
    { l: "Approved",         v: reports.filter(r => r.status === "Approved").length,     col: "green",  i: "✓"  },
    { l: "Fines Collected",  v: totalFines(reports),                                     col: "purple", i: "₹"  },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {/* Hero */}
      <SpotlightCard style={{ overflow: "hidden" }}>
        <div className="hero-cols" style={{ display: "grid", gridTemplateColumns: "1fr 240px" }}>
          <div style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
            <div>
              <Chip label="🚦 LIVE ENFORCEMENT PLATFORM" color={c.accent} bg={c.accentDim} />
              <div style={{ marginTop: 14, fontSize: "clamp(20px,3.5vw,34px)", fontWeight: 900, lineHeight: 1.2, letterSpacing: "-0.5px" }}>
                Report Violations.<br />
                <TypedText words={TYPED_WORDS} color={c.accent} />
              </div>
              <div style={{ color: c.muted, fontSize: 13, marginTop: 10, lineHeight: 1.7, maxWidth: 420 }}>
                AI-powered enforcement with OCR plate detection, real-time admin workflow & city-wide analytics.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <MagneticButton onClick={() => setTab("report")} accent={c.accent} glow={c.accentGlow} style={{ padding: "11px 20px", fontSize: 12 }}>
                📸 Report Violation
              </MagneticButton>
              <button onClick={() => setTab(user?.role === "admin" ? "violations" : "myreports")} style={{
                padding: "11px 20px", borderRadius: 12,
                border: `1px solid ${c.border}`, background: "transparent",
                color: c.muted, cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600,
              }}>
                📋 {user?.role === "admin" ? "Violations" : "My Reports"} →
              </button>
            </div>
          </div>

          <div className="globe-col" style={{
            borderLeft: `1px solid ${c.border}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", padding: 20, gap: 6,
          }}>
            <Globe3D />
            <div style={{ fontSize: 10, color: c.dim, letterSpacing: "0.12em" }}>LIVE VIOLATION MAP</div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="strip4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", borderTop: `1px solid ${c.border}` }}>
          {HERO_STRIP_STATS.map((s, i) => (
            <div key={i} style={{ padding: "14px", textAlign: "center", borderRight: i < 3 ? `1px solid ${c.border}` : "none" }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: c[STRIP_COLORS[i]], fontFamily: "monospace" }}>{s.v}</div>
              <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </SpotlightCard>

      {/* Stat cards */}
      <div className="stats4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {stats.map((s, i) => (
          <SpotlightCard key={i} style={{ padding: 18, position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -20, right: -20, width: 70, height: 70, borderRadius: "50%", background: `${c[s.col]}12`, pointerEvents: "none" }} />
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
            <AnimCounter value={s.v} color={c[s.col]} size={24} />
            <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{s.l}</div>
          </SpotlightCard>
        ))}
      </div>

      {/* Recent activity */}
      <SpotlightCard style={{ padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.text, letterSpacing: "0.06em" }}>RECENT ACTIVITY</div>
          <button onClick={() => setTab(user?.role === "admin" ? "violations" : "myreports")}
            style={{ fontSize: 11, color: c.accent, background: "transparent", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            View all →
          </button>
        </div>
        {reports.slice(0, 5).map((r, i) => (
          <ReportRow key={r.id} r={r} admin={user?.role === "admin"} onAction={updateStatus} delay={i * 0.05} />
        ))}
      </SpotlightCard>
    </div>
  );
}
