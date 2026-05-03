import { useEffect, useState } from "react";
import { useTheme }            from "../../context/ThemeContext";
import { useReports }          from "../../context/ReportsContext";

export default function VehicleDetailModal({ vehicleNumber, onClose }) {
  const { c }                  = useTheme();
  const { fetchVehicleDetail } = useReports();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    setLoading(true);
    fetchVehicleDetail(vehicleNumber)
      .then(setData)
      .catch(() => setError("Violations load nahi ho sake."))
      .finally(() => setLoading(false));
  }, [vehicleNumber]);

  // ── status color helper ──
  const statusColor = (status = "") => {
    if (status.includes("APPROVED")) return c.green;
    if (status.includes("REJECTED")) return c.red;
    return c.accent; // PENDING
  };

  const overlayStyle = {
    position: "fixed", inset: 0, zIndex: 999,
    background: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(6px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
  };

  const boxStyle = {
    background: c.bg,
    border: `1px solid ${c.border}`,
    borderRadius: 18,
    width: "100%", maxWidth: 560,
    maxHeight: "85vh",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    boxShadow: `0 0 40px ${c.accent}22`,
  };

  // ── Loading ──
  if (loading) return (
    <div style={overlayStyle}>
      <div style={{ ...boxStyle, alignItems: "center", justifyContent: "center", padding: 60 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ color: c.muted, fontSize: 13 }}>Loading violations...</div>
      </div>
    </div>
  );

  // ── Error ──
  if (error) return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...boxStyle, alignItems: "center", justifyContent: "center", padding: 60 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
        <div style={{ color: c.red, fontSize: 13 }}>{error}</div>
      </div>
    </div>
  );

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={boxStyle} onClick={e => e.stopPropagation()}>

        {/* ── Header ── */}
        <div style={{
          padding: "20px 22px 16px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 10, color: c.muted, letterSpacing: "0.1em", marginBottom: 4 }}>
              VEHICLE VIOLATIONS
            </div>
            <div style={{
              fontSize: 22, fontWeight: 900, color: c.text,
              fontFamily: "monospace", letterSpacing: 2,
            }}>
              🚗 {data.vehicleNumber}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: c.hi, border: `1px solid ${c.border}`,
              color: c.muted, borderRadius: 10,
              width: 36, height: 36, cursor: "pointer",
              fontSize: 16, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}
          >✕</button>
        </div>

        {/* ── Summary Bar ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: 12, padding: "14px 22px",
          borderBottom: `1px solid ${c.border}`,
          background: c.hi,
        }}>
          <div style={{
            padding: "12px 16px", borderRadius: 12,
            background: c.bg, border: `1px solid ${c.border}`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: c.text }}>
              {data.totalViolations}
            </div>
            <div style={{ fontSize: 10, color: c.muted, marginTop: 2, letterSpacing: "0.08em" }}>
              TOTAL VIOLATIONS
            </div>
          </div>
          <div style={{
            padding: "12px 16px", borderRadius: 12,
            background: c.redDim, border: `1px solid ${c.red}33`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: c.red }}>
              ₹{data.totalFine?.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: 10, color: c.red, marginTop: 2, letterSpacing: "0.08em", opacity: 0.7 }}>
              TOTAL FINE
            </div>
          </div>
        </div>

        {/* ── Violations List ── */}
        <div style={{ overflowY: "auto", padding: "14px 22px", display: "flex", flexDirection: "column", gap: 12 }}>
          {data.violations.length === 0 ? (
            <div style={{ textAlign: "center", color: c.muted, padding: 40, fontSize: 13 }}>
              Koi violation nahi mila.
            </div>
          ) : (
            data.violations.map((v, i) => (
              <div key={v.id} style={{
                padding: "14px 16px", borderRadius: 14,
                background: c.hi, border: `1px solid ${c.border}`,
              }}>
                {/* card header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, color: c.text }}>
                    #{i + 1} — {v.violationType}
                  </div>
                  <div style={{
                    fontSize: 10, fontWeight: 700, padding: "4px 10px",
                    borderRadius: 20, letterSpacing: "0.08em",
                    background: `${statusColor(v.status)}22`,
                    color: statusColor(v.status),
                    border: `1px solid ${statusColor(v.status)}44`,
                  }}>
                    {v.status}
                  </div>
                </div>

                {/* card details */}
                <div style={{
                  display: "grid", gridTemplateColumns: "1fr 1fr",
                  gap: "6px 16px", fontSize: 12,
                }}>
                  <div style={{ color: c.muted }}>
                    📍 <span style={{ color: c.text }}>{v.location || "N/A"}</span>
                  </div>
                  <div style={{ color: c.muted }}>
                    💸 <span style={{ color: c.red, fontWeight: 700 }}>
                      ₹{v.fineAmount?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div style={{ color: c.muted }}>
                    📅 <span style={{ color: c.text }}>
                      {v.violationDate
                        ? new Date(v.violationDate).toLocaleString("en-IN", {
                            day: "2-digit", month: "short", year: "numeric",
                            hour: "2-digit", minute: "2-digit"
                          })
                        : "N/A"}
                    </span>
                  </div>
                </div>

                {/* image proof */}
                {v.imageUrl && (
                  <img
                    src={v.imageUrl}
                    alt="violation proof"
                    style={{
                      marginTop: 10, width: "100%", maxHeight: 160,
                      objectFit: "cover", borderRadius: 10,
                      border: `1px solid ${c.border}`,
                    }}
                  />
                )}
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}