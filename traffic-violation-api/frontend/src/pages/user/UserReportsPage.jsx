import { useState, useEffect } from "react";
import { useTheme }            from "../../context/ThemeContext";
import { useAuth }             from "../../context/AuthContext";
import SpotlightCard           from "../../components/ui/SpotlightCard";
import GlitchText              from "../../components/ui/GlitchText";
import AnimCounter             from "../../components/ui/AnimCounter";
import api                     from "../../axiosConfig";

const statusColor = (status, c) => {
  if (status === "FINE ISSUED" || status === "FINE_ISSUED") return c.purple;
  if (status === "APPROVED")   return c.green;
  if (status === "REJECTED")   return c.red;
  return c.yellow;
};

const statusLabel = (status) => {
  if (status === "FINE_ISSUED" || status === "FINE ISSUED") return "Fine Issued";
  if (status === "APPROVED")   return "Approved";
  if (status === "REJECTED")   return "Rejected";
  return "Pending";
};

export default function UserReportsPage() {
  const { c }    = useTheme();
  const { user } = useAuth();

  const [activeTab,  setActiveTab]  = useState("violations");
  const [violations, setViolations] = useState([]);
  const [filed,      setFiled]      = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [expanded,   setExpanded]   = useState(null);

  useEffect(() => {
    if (!user?.id) return;

    api.get(`/violations/user/${user.id}`)
      .then(res => {
        const confirmed = res.data.map(v => ({
            id:            v.id,
            vehicleNumber: v.vehicleNumber || "N/A",
            type:          v.violationType,
            fine:          v.fineAmount || 0,
            status:        v.status,
            date:          v.violationDate
              ? new Date(v.violationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
              : "N/A",
            location: v.location?.split(",")[0] || "N/A",
            imageUrl: v.imageUrl || null,
          }));
        setViolations(confirmed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    const filedUrl = user.email
      ? `/violations/filed-by-email?email=${encodeURIComponent(user.email)}`
      : `/violations/filed-by/${user.id}`;

    api.get(filedUrl)
      .then(res => {
        setFiled(res.data.map(v => ({
          id:            v.id,
          vehicleNumber: v.vehicleNumber || "N/A",
          type:          v.violationType,
          fine:          v.fineAmount || 0,
          status:        v.status,
          date:          v.violationDate
            ? new Date(v.violationDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
            : "N/A",
          location: v.location?.split(",")[0] || "N/A",
          imageUrl: v.imageUrl || null,
        })));
      })
      .catch(() => setFiled([]));

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
        padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
        background: activeTab === id ? c.accent : c.hi,
        color: activeTab === id ? "#fff" : c.muted,
        border: `1px solid ${activeTab === id ? "transparent" : c.border}`,
      }}>{count}</span>
    </button>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div className="fade-up">
        <GlitchText text="Reports" color={c.text} size={21} />
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14 }}>
        {[
          { l: "Total Violations",     v: violations.length, col: "red"    },
          { l: "Reports Filed",        v: filed.length,      col: "accent" },
          { l: "Total Fine",           v: totalFine,         col: "purple" },
        ].map((s, i) => (
          <SpotlightCard key={i} style={{ padding: 18 }}>
            <AnimCounter value={s.v} color={c[s.col]} size={22} />
            <div style={{ fontSize: 11, color: c.muted, marginTop: 6 }}>{s.l}</div>
          </SpotlightCard>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 10 }}>
        {tabBtn("violations", "My Violations",  violations.length)}
        {tabBtn("filed",      "Reports I Filed", filed.length)}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: c.muted, fontSize: 13 }}>Loading...</div>
      ) : data.length === 0 ? (
        <SpotlightCard style={{ padding: 44, textAlign: "center" }}>
          <div style={{ color: c.muted, fontSize: 13 }}>
            {activeTab === "violations" ? "No violations found." : "No reports filed yet."}
          </div>
        </SpotlightCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.map(v => (
            <div key={v.id}>
              {/* Row */}
              <div
                onClick={() => setExpanded(expanded === v.id ? null : v.id)}
                style={{
                  display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12,
                  padding: "14px 18px", cursor: "pointer",
                  border: `1px solid ${expanded === v.id ? c.accent : c.border}`,
                  borderRadius: expanded === v.id ? "12px 12px 0 0" : 12,
                  background: expanded === v.id ? c.accentDim : c.hi,
                  transition: "all 0.2s",
                }}>

                <div style={{ fontFamily: "monospace", fontSize: 11, color: c.accent, minWidth: 24 }}>
                  #{v.id}
                </div>

                <div style={{ flex: "2 1 140px" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: c.text, fontFamily: "monospace" }}>
                    {v.vehicleNumber}
                  </div>
                  <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>{v.type}</div>
                </div>

                <div style={{ fontSize: 13, fontWeight: 800, color: c.red, fontFamily: "monospace" }}>
                  ₹{v.fine.toLocaleString("en-IN")}
                </div>

                {/* Status pill */}
                <div style={{
                  padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: statusColor(v.status, c) + "22",
                  color: statusColor(v.status, c),
                  border: `1px solid ${statusColor(v.status, c)}44`,
                }}>
                  {statusLabel(v.status)}
                </div>

                <div style={{ fontSize: 11, color: c.dim, marginLeft: "auto" }}>{v.date}</div>
              </div>

              {/* Expanded Detail */}
              {expanded === v.id && (
                <div style={{
                  border: `1px solid ${c.accent}`,
                  borderTop: "none", borderRadius: "0 0 12px 12px",
                  background: c.hi, overflow: "hidden",
                }}>

                  {/* Image full width */}
                  {v.imageUrl && (
                    <img
                      src={v.imageUrl} alt="evidence"
                      onClick={() => window.open(v.imageUrl, "_blank")}
                      style={{
                        width: "100%", maxHeight: 220,
                        objectFit: "cover", display: "block",
                        cursor: "pointer", borderBottom: `1px solid ${c.border}`,
                      }}
                    />
                  )}

                  <div style={{ padding: 18 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
                      {[
                        { l: "VEHICLE NUMBER", v: v.vehicleNumber },
                        { l: "VIOLATION TYPE", v: v.type          },
                        { l: "FINE AMOUNT",    v: `₹${v.fine.toLocaleString("en-IN")}` },
                        { l: "DATE",           v: v.date          },
                        { l: "AREA",           v: v.location      },
                        { l: "PAYMENT STATUS", v: null, status: v.status },
                      ].map(item => (
                        <div key={item.l}>
                          <div style={{ fontSize: 10, color: c.muted, marginBottom: 5, letterSpacing: "0.06em" }}>{item.l}</div>
                          {item.status ? (
                            <div style={{
                              display: "inline-block", padding: "4px 12px", borderRadius: 20,
                              fontSize: 11, fontWeight: 700,
                              background: statusColor(item.status, c) + "22",
                              color: statusColor(item.status, c),
                              border: `1px solid ${statusColor(item.status, c)}44`,
                            }}>
                              {item.status === "FINE_ISSUED" || item.status === "FINE ISSUED" ? "Paid" : "Unpaid"}
                            </div>
                          ) : (
                            <div style={{ fontSize: 13, color: c.text, fontWeight: 600 }}>{item.v}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
