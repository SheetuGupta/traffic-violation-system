import { useState, useEffect } from "react";
import { useTheme }            from "../../context/ThemeContext";
import { useAuth }             from "../../context/AuthContext";
import SpotlightCard           from "../../components/ui/SpotlightCard";
import GlitchText              from "../../components/ui/GlitchText";
import AnimCounter             from "../../components/ui/AnimCounter";
import api                     from "../../axiosConfig";

export default function UserSummaryPage() {
  const { c }    = useTheme();
  const { user } = useAuth();

  const [violations, setViolations] = useState([]);
  const [vehicles,   setVehicles]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      api.get(`/violations/user/${user.id}`),
      api.get(`/vehicles/user/${user.id}`),
    ]).then(([vRes, vehRes]) => {
      setViolations(vRes.data.map(v => ({
        ...v,
        status: v.status?.replace("_", " ") || "PENDING",
      })));
      setVehicles(vehRes.data.filter(v => v.vehicleNumber !== null));
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const confirmed = violations.filter(v => v.status === "APPROVED" || v.status === "FINE ISSUED");
  const totalFine = confirmed.reduce((s, v)  => s + (v.fineAmount || 0), 0);
  const paidFine  = violations.filter(v => v.status === "FINE ISSUED").reduce((s, v) => s + (v.fineAmount || 0), 0);
  const dueFine   = violations.filter(v => v.status === "APPROVED").reduce((s, v)    => s + (v.fineAmount || 0), 0);

  const typeCounts = {};
  violations.forEach(v => {
    if (v.violationType) typeCounts[v.violationType] = (typeCounts[v.violationType] || 0) + 1;
  });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  const vehicleCounts = {};
  violations.forEach(v => {
    if (v.vehicleNumber) vehicleCounts[v.vehicleNumber] = (vehicleCounts[v.vehicleNumber] || 0) + 1;
  });
  const topVehicle = Object.entries(vehicleCounts).sort((a, b) => b[1] - a[1])[0];

  if (loading) {
    return <div style={{ textAlign: "center", padding: 60, color: c.muted }}>⏳ Loading summary...</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      <div className="fade-up">
        <GlitchText text="My Summary" color={c.text} size={21} />
        <div style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
          Your complete traffic violation overview
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats4" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        {[
          { l: "Total Vehicles",   v: vehicles.length,  i: "🚗", col: "accent"  },
          { l: "Total Violations", v: confirmed.length, i: "⚠️", col: "red"     },
          { l: "Amount Due",       v: dueFine,          i: "💳", col: "yellow"  },
          { l: "Total Fine Paid",  v: paidFine,         i: "✅", col: "green"   },
        ].map((s, i) => (
          <SpotlightCard key={i} style={{ padding: 18 }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
            <AnimCounter value={s.v} color={c[s.col]} size={22} />
            <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>{s.l}</div>
          </SpotlightCard>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>

        {/* Fine Breakdown */}
        <SpotlightCard style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 16, letterSpacing: "0.06em" }}>
            FINE BREAKDOWN
          </div>
          {[
            { l: "Total Fine",  v: totalFine, color: c.red    },
            { l: "Amount Paid", v: paidFine,  color: c.green  },
            { l: "Amount Due",  v: dueFine,   color: c.yellow },
          ].map(s => (
            <div key={s.l} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 12, color: c.muted }}>{s.l}</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>
                  ₹{s.v.toLocaleString("en-IN")}
                </span>
              </div>
              <div style={{ height: 5, background: "rgba(128,128,128,0.1)", borderRadius: 4, overflow: "hidden" }}>
                <div style={{
                  height: "100%", borderRadius: 4,
                  width: totalFine > 0 ? `${(s.v / totalFine) * 100}%` : "0%",
                  background: s.color,
                  transition: "width 1.2s ease",
                }} />
              </div>
            </div>
          ))}
        </SpotlightCard>

        {/* Insights */}
        <SpotlightCard style={{ padding: 22 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 16, letterSpacing: "0.06em" }}>
            INSIGHTS
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>

            {topType ? (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: c.hi, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>MOST COMMON VIOLATION</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.red }}>{topType[0]}</div>
                <div style={{ fontSize: 11, color: c.muted }}>{topType[1]} times</div>
              </div>
            ) : (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: c.hi, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 13, color: c.green }}>✅ No violations recorded!</div>
              </div>
            )}

            {topVehicle && (
              <div style={{ padding: "12px 14px", borderRadius: 10, background: c.hi, border: `1px solid ${c.border}` }}>
                <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>MOST VIOLATED VEHICLE</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: c.accent, fontFamily: "monospace" }}>{topVehicle[0]}</div>
                <div style={{ fontSize: 11, color: c.muted }}>{topVehicle[1]} violations</div>
              </div>
            )}

            <div style={{ padding: "12px 14px", borderRadius: 10, background: c.hi, border: `1px solid ${c.border}` }}>
              <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>COMPLIANCE SCORE</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: confirmed.length === 0 ? c.green : dueFine > 0 ? c.red : c.yellow }}>
                {confirmed.length === 0 ? "🏆 Perfect" : dueFine > 0 ? "⚠️ Pay dues" : "✅ Paid"}
              </div>
            </div>

          </div>
        </SpotlightCard>
      </div>

      {/* Vehicles Summary */}
      <SpotlightCard style={{ padding: 22 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 16, letterSpacing: "0.06em" }}>
          VEHICLES SUMMARY
        </div>
        {vehicles.length === 0 ? (
          <div style={{ color: c.muted, fontSize: 13 }}>No vehicles registered.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {vehicles.map(v => {
              const vCount = violations.filter(viol => viol.vehicleNumber === v.vehicleNumber).length;
              const vFine  = violations
                .filter(viol => viol.vehicleNumber === v.vehicleNumber)
                .reduce((s, viol) => s + (viol.fineAmount || 0), 0);
              return (
                <div key={v.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "12px 14px", borderRadius: 10,
                  background: c.hi, border: `1px solid ${c.border}`,
                }}>
                  <div style={{ fontSize: 24 }}>
                    {v.vehicleType === "Bike" || v.vehicleType === "Scooter" ? "🏍️" :
                     v.vehicleType === "Bus"  || v.vehicleType === "Truck"   ? "🚌" : "🚗"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "monospace", fontWeight: 700, color: c.accent }}>{v.vehicleNumber}</div>
                    <div style={{ fontSize: 11, color: c.muted }}>{v.vehicleType} · {v.licenseNumber || "N/A"}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 12, color: vCount > 0 ? c.red : c.green, fontWeight: 700 }}>
                      {vCount} violations
                    </div>
                    <div style={{ fontSize: 11, color: c.muted }}>₹{vFine.toLocaleString("en-IN")} total</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </SpotlightCard>

    </div>
  );
}