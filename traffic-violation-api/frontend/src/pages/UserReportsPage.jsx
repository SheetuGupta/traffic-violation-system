import { useState, useEffect } from "react";
import { useTheme }            from "../../context/ThemeContext";
import { useAuth }             from "../../context/AuthContext";
import SpotlightCard           from "../../components/ui/SpotlightCard";
import GlitchText              from "../../components/ui/GlitchText";
import StatusBadge             from "../../components/ui/StatusBadge";
import AnimCounter             from "../../components/ui/AnimCounter";
import api                     from "../../axiosConfig";

export default function UserReportsPage() {
  const { c }    = useTheme();
  const { user } = useAuth();

  const [activeTab,   setActiveTab]   = useState("violations");  // "violations" | "filed"
  const [violations,  setViolations]  = useState([]);  // violations ON user's vehicles
  const [filed,       setFiled]       = useState([]);  // violations filed BY user
  const [loading,     setLoading]     = useState(true);
  const [expanded,    setExpanded]    = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    // ✅ Violations on user's vehicles — APPROVED or FINE ISSUED only
    api.get(`/violations/user/${user.id}`)
      .then(res => {
        const confirmed = res.data
          .filter(v => v.status === "APPROVED" || v.status === "FINE_ISSUED")
          .map(v => ({
            id:            v.id,
            vehicleNumber: v.vehicleNumber || "N/A",
            type:          v.violationType,
            fine:          v.fineAmount || 0,
            status:        v.status?.replace("_", " ") || "N/A",
            date:          v.violationDate
              ? new Date(v.violationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : "N/A",
            location: v.location || "N/A",
            imageUrl: v.imageUrl || null,
          }));
        setViolations(confirmed);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    // ✅ Reports filed BY this user — all statuses
    const filedUrl = user.email
      ? `/violations/filed-by-email?email=${encodeURIComponent(user.email)}`
      : `/violations/filed-by/${user.id}`;

    api.get(filedUrl)
      .then(res => {
        const formatted = res.data.map(v => ({
          id:            v.id,
          vehicleNumber: v.vehicleNumber || "N/A",
          type:          v.violationType,
          fine:          v.fineAmount || 0,
          status:        v.status?.replace("_", " ") || "PENDING",
          date:          v.violationDate
            ? new Date(v.violationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : "N/A",
          location: v.location || "N/A",
          imageUrl: v.imageUrl || null,
        }));
        setFiled(formatted);
      })
      .catch(err => console.error(err));

  }, [user]);

  const totalFine = violations.reduce((s, v) => s + (v.fine || 0), 0);
  const data      = activeTab === "violations" ? violations : filed;

  const tabBtn = (id, label, count) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: "9px 20px", borderRadius: 10, cursor: "pointer", fontSize: 13,
      border: `1px solid ${activeTab === id ? c.accent : c.border}`,
      background: activeTab === id ? c.accentDim : "transparent",
      color: activeTab === id ? c.accent : c.muted,
      fontWeight: activeTab === id ? 700 : 400,
      fontFamily: "inherit", transition: "all 0.2s",
      display: "flex", alignItems: "center", gap: 8,
    }}>
      {label}
      <span style={{
        padding: "2px 7px", borderRadius: 10, fontSize: 11, fontWeight: 700,
        background: activeTab === id ? c.accent : c.border,
        color: activeTab === id ? "#fff" : c.muted,
      }}>{count}</span>
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div className="fade-up">
        <GlitchText text="Reports" color={c.text} size={21} />
        <div style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
          Your violations and filed reports
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { l: "Confirmed Violations", v: violations.length,                                    i: "⚠️", col: "red"    },
          { l: "Reports Filed",        v: filed.length,                                         i: "📝", col: "accent" },
          { l: "Total Fine Due",       v: totalFine,                                            i: "₹",  col: "purple" },
        ].map((s, i) => (
          <SpotlightCard key={i} style={{ padding: 18 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
            <AnimCounter value={s.v} color={c[s.col]} size={22} />
            <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{s.l}</div>
          </SpotlightCard>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10 }}>
        {tabBtn("violations", "⚠️ My Violations",  violations.length)}
        {tabBtn("filed",      "📝 Reports I Filed", filed.length)}
      </div>

      {/* Tab Description */}
      <div style={{
        padding: "10px 16px", borderRadius: 10,
        background: c.hi, border: `1px solid ${c.border}`,
        fontSize: 12, color: c.muted,
      }}>
        {activeTab === "violations"
          ? "⚠️ These are confirmed violations on your registered vehicles (Approved & Fine Issued only — Pending violations are hidden until reviewed)"
          : "📝 These are violation reports you have filed against other vehicles"}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: c.muted }}>⏳ Loading...</div>
      ) : data.length === 0 ? (
        <SpotlightCard style={{ padding: 44, textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>
            {activeTab === "violations" ? "✅" : "📝"}
          </div>
          <div style={{ color: c.muted, fontSize: 13 }}>
            {activeTab === "violations"
              ? "No confirmed violations. Drive safe!"
              : "You haven't filed any reports yet."}
          </div>
        </SpotlightCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.map((v, i) => (
            <div key={v.id}>
              {/* Row */}
              <div
                onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                style={{
                  display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10,
                  padding: "14px 16px", cursor: "pointer",
                  border: `1px solid ${expanded === v.id ? c.accent : c.border}`,
                  borderRadius: expanded === v.id ? "12px 12px 0 0" : 12,
                  background: expanded === v.id ? c.accentDim : c.hi,
                  transition: "all 0.2s",
                }} className="slide-in">

                <div style={{ fontFamily: "monospace", fontSize: 11, color: c.accent, minWidth: 28 }}>
                  #{v.id}
                </div>

                <div style={{ flex: "2 1 130px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>{v.vehicleNumber}</div>
                  <div style={{ fontSize: 11, color: c.muted, marginTop: 1 }}>{v.type}</div>
                </div>

                <div style={{ fontSize: 13, color: c.red, fontFamily: "monospace", fontWeight: 700 }}>
                  ₹{v.fine.toLocaleString("en-IN")}
                </div>

                <StatusBadge status={v.status} />

                <div style={{ fontSize: 11, color: c.dim, marginLeft: "auto" }}>{v.date}</div>
              </div>

              {/* Expanded Detail */}
              {expanded === v.id && (
                <div style={{
                  padding: "18px", border: `1px solid ${c.accent}`,
                  borderTop: "none", borderRadius: "0 0 12px 12px",
                  background: c.hi,
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
                    {[
                      { l: "VEHICLE",    v: v.vehicleNumber },
                      { l: "TYPE",       v: v.type          },
                      { l: "FINE",       v: `₹${v.fine.toLocaleString("en-IN")}` },
                      { l: "DATE",       v: v.date          },
                      { l: "STATUS",     v: null, badge: v.status },
                      // ✅ Location sirf admin ko dikhao — user ko area only
                      { l: "AREA",       v: v.location?.split(",")[0] || "N/A" },
                    ].map(item => (
                      <div key={item.l}>
                        <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>{item.l}</div>
                        {item.badge
                          ? <StatusBadge status={item.badge} />
                          : <div style={{ fontSize: 12, color: c.text, fontWeight: 600 }}>{item.v}</div>
                        }
                      </div>
                    ))}
                  </div>

                  {/* Evidence Photo */}
                  {v.imageUrl && (
                    <div>
                      <div style={{ fontSize: 10, color: c.muted, marginBottom: 6 }}>EVIDENCE PHOTO</div>
                      <img
                        src={v.imageUrl} alt="evidence"
                        style={{ maxHeight: 160, maxWidth: "100%", borderRadius: 8, objectFit: "cover", border: `1px solid ${c.border}` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
