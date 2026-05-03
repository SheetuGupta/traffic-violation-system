import { useState, useMemo }  from "react";
import { ClipboardList, Hourglass, CheckCircle2, IndianRupee } from "lucide-react/dist/cjs/lucide-react";
import { useTheme }           from "../context/ThemeContext";
import { useAuth }            from "../context/AuthContext";
import { useReports }         from "../context/ReportsContext";
import SpotlightCard          from "../components/ui/SpotlightCard";
import Globe3D                from "../components/ui/Globe3D";
import TypedText              from "../components/ui/TypedText";
import AnimCounter            from "../components/ui/AnimCounter";
import MagneticButton         from "../components/ui/MagneticButton";
import Chip                   from "../components/ui/Chip";
import StatusBadge            from "../components/ui/StatusBadge";
import ViolationMap           from "../components/admin/ViolationMap";
import { TYPED_WORDS }        from "../data/constants";

const STRIP_COLORS = ["accent", "green", "yellow", "purple"];

export default function DashboardPage({ setTab }) {
  const { c }                         = useTheme();
  const { user }                      = useAuth();
  const { reports } = useReports();

  const isAdmin = user?.role?.toUpperCase() === "ADMIN";

  // ✅ Real stats from reports
  const today = new Date().toDateString();

  const todayReports   = reports.filter(r => {
    if (!r.time || r.time === "N/A" || r.time === "Just now") return false;
    try { return new Date(r.time).toDateString() === today; } catch { return false; }
  });

  const pendingCount   = reports.filter(r => r.status === "PENDING").length;
  const approvedCount  = reports.filter(r => r.status === "APPROVED").length;
  const fineIssued     = reports.filter(r => r.status === "FINE ISSUED").length;
  const rejectedCount  = reports.filter(r => r.status === "REJECTED").length;
  const totalFine      = reports.reduce((s, r) => s + (r.fine || 0), 0);
  const totalFineIssued = reports
    .filter(r => r.status === "FINE ISSUED")
    .reduce((s, r) => s + (r.fine || 0), 0);

  // Approval rate
  const reviewed       = approvedCount + rejectedCount;
  const approvalRate   = reviewed > 0 ? Math.round((approvedCount / reviewed) * 100) : 0;

  // Top violation types
  const typeCounts = useMemo(() => {
    const map = {};
    reports.forEach(r => { if (r.type) map[r.type] = (map[r.type] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 4);
  }, [reports]);

  // Top areas
  const areaCounts = useMemo(() => {
    const map = {};
    reports.forEach(r => {
      const area = r.location?.split(",")[0]?.trim();
      if (area && area !== "N/A") map[area] = (map[area] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [reports]);

  // ✅ CSV Export
  const exportCSV = () => {
    if (!reports.length) return;
    const headers = ["ID", "Vehicle Number", "Violation Type", "Fine (Rs)", "Status", "Location", "Date"];
    const rows    = reports.map(r => [
      r.id,
      r.vehicleNumber || "N/A",
      r.type          || "N/A",
      r.fine          || 0,
      r.status        || "N/A",
      (r.location     || "N/A").replace(/,/g, ";"),
      r.time          || "N/A",
    ]);
    const csv  = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `violations_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ═══════════════════════════════════════════
  // ADMIN DASHBOARD
  // ═══════════════════════════════════════════
  if (isAdmin) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* ── Top Action Bar ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 20, fontWeight: 900, color: c.text }}>
              Admin Dashboard
            </div>
            <div style={{ fontSize: 12, color: c.muted, marginTop: 3 }}>
              Welcome back, {user?.name?.split(" ")[0]} — {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "2-digit", month: "long" })}
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button onClick={() => setTab("violations")} style={{
              padding: "9px 18px", borderRadius: 9, cursor: "pointer",
              background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
              color: "#fff", border: "none", fontWeight: 700,
              fontSize: 12, fontFamily: "inherit",
            }}>
              Review Queue ({pendingCount})
            </button>
            <button onClick={exportCSV} style={{
              padding: "9px 18px", borderRadius: 9, cursor: "pointer",
              border: `1px solid ${c.green}55`, background: c.greenDim,
              color: c.green, fontWeight: 700, fontSize: 12, fontFamily: "inherit",
            }}>
              Export CSV
            </button>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
          {[
            { l: "Total Reports",    v: reports.length,   col: "accent",  sub: `${todayReports.length} today`, icon: <ClipboardList size={20} color={c.accent} /> },
            { l: "Pending Review",   v: pendingCount,     col: "yellow",  sub: "Requires action", icon: <Hourglass size={20} color={c.yellow} /> },
            { l: "Fine Collected",   v: totalFineIssued,  col: "purple",  sub: `₹${totalFine.toLocaleString("en-IN")} total`, icon: <IndianRupee size={20} color={c.purple} /> },
            { l: "Approval Rate",    v: approvalRate,     col: "green",   sub: `${reviewed} reviewed`, suffix: "%", icon: <CheckCircle2 size={20} color={c.green} /> },
          ].map((s, i) => (
            <SpotlightCard key={i} style={{ padding: 20, position: "relative", overflow: "hidden" }}>
              <div style={{
                position: "absolute", top: -16, right: -16,
                width: 60, height: 60, borderRadius: "50%",
                background: c[s.col] + "12", pointerEvents: "none",
              }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                {s.icon}
                <AnimCounter value={s.v} color={c[s.col]} size={24} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 11, color: c.text, fontWeight: 600, marginTop: 6 }}>{s.l}</div>
              <div style={{ fontSize: 10, color: c.muted, marginTop: 2 }}>{s.sub}</div>
            </SpotlightCard>
          ))}
        </div>

        {/* ── Fine Collection Progress ── */}
        <SpotlightCard style={{ padding: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: c.text, letterSpacing: "0.06em" }}>
              FINE COLLECTION OVERVIEW
            </div>
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { l: "Total Fine",    v: totalFine,       col: c.accent  },
                { l: "Fine Issued",   v: totalFineIssued, col: c.purple  },
                { l: "Pending Fine",  v: reports.filter(r => r.status === "PENDING").reduce((s, r) => s + (r.fine || 0), 0), col: c.yellow },
              ].map(s => (
                <div key={s.l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: s.col, fontFamily: "monospace" }}>
                    ₹{s.v.toLocaleString("en-IN")}
                  </div>
                  <div style={{ fontSize: 10, color: c.muted }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Status breakdown bars */}
          {[
            { l: "Pending",     v: pendingCount,  color: c.yellow, total: reports.length },
            { l: "Approved",    v: approvedCount, color: c.green,  total: reports.length },
            { l: "Rejected",    v: rejectedCount, color: c.red,    total: reports.length },
            { l: "Fine Issued", v: fineIssued,    color: c.purple, total: reports.length },
          ].map(s => (
            <div key={s.l} style={{ marginBottom: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: c.muted }}>{s.l}</span>
                <span style={{ fontSize: 12, color: c.text, fontFamily: "monospace" }}>
                  {s.v} ({s.total > 0 ? Math.round((s.v / s.total) * 100) : 0}%)
                </span>
              </div>
              <div style={{ height: 5, background: "rgba(128,128,128,0.1)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: s.total > 0 ? `${(s.v / s.total) * 100}%` : "0%",
                  background: s.color,
                  transition: "width 1.2s ease",
                }} />
              </div>
            </div>
          ))}
        </SpotlightCard>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

          {/* ── Top Violation Types ── */}
          <SpotlightCard style={{ padding: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 16, letterSpacing: "0.06em" }}>
              TOP VIOLATION TYPES
            </div>
            {typeCounts.length === 0 ? (
              <div style={{ color: c.muted, fontSize: 13 }}>No data yet.</div>
            ) : (
              typeCounts.map(([type, count], i) => (
                <div key={type} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, color: c.text, fontWeight: 600 }}>{type}</span>
                    <span style={{ fontSize: 12, color: c.muted, fontFamily: "monospace" }}>{count}</span>
                  </div>
                  <div style={{ height: 5, background: "rgba(128,128,128,0.1)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%", borderRadius: 4,
                      width: `${(count / (typeCounts[0]?.[1] || 1)) * 100}%`,
                      background: [c.red, c.accent, c.yellow, c.purple][i] || c.muted,
                      transition: "width 1.2s ease",
                    }} />
                  </div>
                </div>
              ))
            )}
          </SpotlightCard>

          {/* ── Top Hotspot Areas ── */}
          <SpotlightCard style={{ padding: 22 }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 16, letterSpacing: "0.06em" }}>
              HOTSPOT AREAS
            </div>
            {areaCounts.length === 0 ? (
              <div style={{ color: c.muted, fontSize: 13 }}>No location data yet.</div>
            ) : (
              areaCounts.map(([area, count], i) => (
                <div key={area} style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "8px 12px", borderRadius: 8, marginBottom: 8,
                  background: c.hi, border: `1px solid ${c.border}`,
                }}>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    background: i === 0 ? c.yellow : i === 1 ? c.muted : c.hi,
                    border: `1px solid ${c.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 800, color: i < 2 ? "#000" : c.muted,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1, fontSize: 12, color: c.text, fontWeight: 600 }}>{area}</div>
                  <div style={{ fontSize: 12, color: c.muted, fontFamily: "monospace" }}>{count} reports</div>
                </div>
              ))
            )}
          </SpotlightCard>
        </div>

        {/* ── Violation Map ── */}
        <SpotlightCard style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 16, letterSpacing: "0.06em" }}>
            LIVE VIOLATION HOTSPOTS
          </div>
          <ViolationMap />
        </SpotlightCard>



      </div>
    );
  }

  // ═══════════════════════════════════════════
  // USER DASHBOARD (fallback — profile pe redirect karo)
  // ═══════════════════════════════════════════
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* Hero */}
      <SpotlightCard style={{ overflow: "hidden" }}>
        <div className="hero-cols" style={{ display: "grid", gridTemplateColumns: "1fr 240px" }}>
          <div style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
            <div>
              <Chip label="LIVE ENFORCEMENT PLATFORM" color={c.accent} bg={c.accentDim} />
              <div style={{ marginTop: 14, fontSize: "clamp(20px,3.5vw,34px)", fontWeight: 900, lineHeight: 1.2 }}>
                Report Violations.<br />
                <TypedText words={TYPED_WORDS} color={c.accent} />
              </div>
              <div style={{ color: c.muted, fontSize: 13, marginTop: 10, lineHeight: 1.7, maxWidth: 420 }}>
                AI-powered enforcement with OCR plate detection, real-time workflow & city-wide analytics.
              </div>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <MagneticButton onClick={() => setTab("report")} accent={c.accent} glow={c.accentGlow} style={{ padding: "11px 20px", fontSize: 12 }}>
                Report Violation
              </MagneticButton>
              <button onClick={() => setTab("reports")} style={{
                padding: "11px 20px", borderRadius: 12,
                border: `1px solid ${c.border}`, background: "transparent",
                color: c.muted, cursor: "pointer", fontSize: 12, fontFamily: "inherit", fontWeight: 600,
              }}>
                My Reports
              </button>
            </div>
          </div>
          <div className="globe-col" style={{
            borderLeft: `1px solid ${c.border}`,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            padding: 20, gap: 6,
          }}>
            <Globe3D />
            <div style={{ fontSize: 10, color: c.dim, letterSpacing: "0.12em" }}>LIVE VIOLATION MAP</div>
          </div>
        </div>
      </SpotlightCard>

    </div>
  );
}