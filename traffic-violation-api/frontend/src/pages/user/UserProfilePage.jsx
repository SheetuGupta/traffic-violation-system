import { useState, useEffect } from "react";
import { Bike, Bus, Car } from "lucide-react/dist/cjs/lucide-react";
import { useTheme }            from "../../context/ThemeContext";
import { useAuth }             from "../../context/AuthContext";
import SpotlightCard           from "../../components/ui/SpotlightCard";
import GlitchText              from "../../components/ui/GlitchText";
import AnimCounter             from "../../components/ui/AnimCounter";
import api                     from "../../axiosConfig";

export default function UserProfilePage() {
  const { c }       = useTheme();
  const { user }    = useAuth();

  const [editing,    setEditing]    = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [success,    setSuccess]    = useState(false);
  const [error,      setError]      = useState(null);
  const [vehicles,   setVehicles]   = useState([]);
  const [violations, setViolations] = useState([]);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vForm, setVForm] = useState({ vehicleNumber: "", vehicleType: "Car", licenseNumber: "" });
  const [vError, setVError] = useState(null);
  const [vSuccess, setVSuccess] = useState(false);

  const [form, setForm] = useState({
    name:        user?.name        || "",
    email:       user?.email       || "",
    phoneNumber: user?.phoneNumber || "",
    password:    "",
  });

  const set  = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const setV = (key) => (e) => setVForm(f => ({ ...f, [key]: e.target.value }));

  const fetchData = () => {
    if (!user?.id) return;
    api.get(`/vehicles/user/${user.id}`)
      .then(res => setVehicles(res.data.filter(v => v.vehicleNumber !== null)))
      .catch(console.error);
    api.get(`/violations/user/${user.id}`)
      .then(res => setViolations(res.data))
      .catch(console.error);
  };

  useEffect(() => { fetchData(); }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await api.put(`/users/${user.id}`, {
        name:        form.name,
        email:       form.email,
        phoneNumber: form.phoneNumber,
        password:    form.password || user.password,
        role:        user.role,
      });
      setSuccess(true);
      setEditing(false);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    if (!vForm.vehicleNumber || !vForm.licenseNumber) {
      setVError("Vehicle number and license number are required.");
      return;
    }
    setVError(null);
    try {
      await api.post("/vehicles", {
        vehicleNumber: vForm.vehicleNumber.toUpperCase().trim(),
        vehicleType:   vForm.vehicleType,
        licenseNumber: vForm.licenseNumber.toUpperCase().trim(),
        userId:        user?.id,
      });
      setVSuccess(true);
      setShowAddVehicle(false);
      setVForm({ vehicleNumber: "", vehicleType: "Car", licenseNumber: "" });
      fetchData();
      setTimeout(() => setVSuccess(false), 3000);
    } catch (err) {
      setVError(err.response?.data?.message || err.response?.data?.error || "Failed to add vehicle.");
    }
  };

  const vehicleIcon = (type) => {
    if (type === "Bike" || type === "Scooter") return <Bike size={20} />;
    if (type === "Bus"  || type === "Truck")   return <Bus size={20} />;
    if (type === "Auto") return <Car size={20} />;
    return <Car size={20} />;
  };

  // Stats
  const confirmed = violations.filter(v => v.status === "APPROVED" || v.status === "FINE_ISSUED");
  const dueFine   = violations.filter(v => v.status === "APPROVED").reduce((s, v)    => s + (v.fineAmount || 0), 0);
  const paidFine  = violations.filter(v => v.status === "FINE_ISSUED").reduce((s, v) => s + (v.fineAmount || 0), 0);

  const typeCounts = {};
  violations.forEach(v => {
    if (v.violationType) typeCounts[v.violationType] = (typeCounts[v.violationType] || 0) + 1;
  });
  const topType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  const inp = {
    width: "100%", padding: "12px 15px", borderRadius: 10, fontSize: 13,
    background: c.hi, border: `1px solid ${c.border}`,
    color: c.text, outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

      {/* ═══ HERO PROFILE CARD ═══ */}
      <SpotlightCard style={{ padding: 0, overflow: "hidden" }}>

        {/* Cover Banner */}
        <div style={{
          height: 90,
          background: `linear-gradient(135deg, ${c.accent}33, ${c.purple}33, ${c.accent}11)`,
          borderBottom: `1px solid ${c.border}`,
          position: "relative",
        }}>
          <div style={{
            position: "absolute", inset: 0,
            backgroundImage: "radial-gradient(circle at 20% 50%, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }} />
        </div>

        <div style={{ padding: "0 28px 28px" }}>
          {/* Avatar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: -36, marginBottom: 20 }}>
            <div style={{
              width: 72, height: 72, borderRadius: "50%",
              background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 28, fontWeight: 900, color: "#fff",
              border: `3px solid ${c.bg}`,
              boxShadow: `0 4px 20px ${c.accentGlow}`,
            }}>
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>

            {/* Edit / Save buttons */}
            <div style={{ display: "flex", gap: 8 }}>
              {!editing ? (
                <button onClick={() => setEditing(true)} style={{
                  padding: "8px 18px", borderRadius: 9, cursor: "pointer",
                  border: `1px solid ${c.border}`, background: "transparent",
                  color: c.muted, fontWeight: 600, fontSize: 12, fontFamily: "inherit",
                }}>Edit Profile</button>
              ) : (
                <>
                  <button onClick={() => { setEditing(false); setError(null); }} style={{
                    padding: "8px 16px", borderRadius: 9, cursor: "pointer",
                    border: `1px solid ${c.border}`, background: "transparent",
                    color: c.muted, fontWeight: 600, fontSize: 12, fontFamily: "inherit",
                  }}>Cancel</button>
                  <button onClick={handleSave} disabled={loading} style={{
                    padding: "8px 18px", borderRadius: 9, cursor: "pointer",
                    background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
                    color: "#fff", border: "none", fontWeight: 700, fontSize: 12, fontFamily: "inherit",
                  }}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Name + Role */}
          {!editing && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 20, fontWeight: 900, color: c.text }}>{user?.name}</div>
              <div style={{ fontSize: 12, color: c.muted, marginTop: 3 }}>{user?.email}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                <span style={{
                  padding: "3px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  background: c.accentDim, color: c.accent, border: `1px solid ${c.accent}33`,
                }}>{user?.role}</span>
                <span style={{
                  padding: "3px 12px", borderRadius: 20, fontSize: 11,
                  background: c.hi, color: c.muted, border: `1px solid ${c.border}`,
                }}>ID #{user?.id}</span>
                <span style={{
                  padding: "3px 12px", borderRadius: 20, fontSize: 11,
                  background: c.hi, color: c.muted, border: `1px solid ${c.border}`,
                }}>{user?.phoneNumber}</span>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editing && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
                {[
                  { label: "FULL NAME",    key: "name",        type: "text"     },
                  { label: "PHONE NUMBER", key: "phoneNumber", type: "tel"      },
                  { label: "EMAIL",        key: "email",       type: "email"    },
                  { label: "NEW PASSWORD", key: "password",    type: "password", ph: "Leave blank to keep current" },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                      {f.label}
                    </label>
                    <input
                      type={f.type}
                      value={form[f.key]}
                      onChange={set(f.key)}
                      placeholder={f.ph || ""}
                      style={{ ...inp }}
                    />
                  </div>
                ))}
              </div>
              {error   && <div style={{ padding: "10px 14px", borderRadius: 8, background: c.redDim,   color: c.red,   fontSize: 12 }}>⚠ {error}</div>}
              {success && <div style={{ padding: "10px 14px", borderRadius: 8, background: c.greenDim, color: c.green, fontSize: 12 }}>Profile updated!</div>}
            </div>
          )}

          {/* Quick Stats Row */}
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(4,1fr)",
            gap: 12, paddingTop: 16,
            borderTop: `1px solid ${c.border}`,
          }}>
            {[
              { l: "Vehicles",   v: vehicles.length,  col: c.accent  },
              { l: "Violations", v: confirmed.length, col: c.red     },
              { l: "Amount Due", v: `₹${dueFine.toLocaleString("en-IN")}`,  col: c.yellow, isStr: true },
              { l: "Fine Paid",  v: `₹${paidFine.toLocaleString("en-IN")}`, col: c.green,  isStr: true },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: "center" }}>
                <div style={{ fontSize: s.isStr ? 14 : 20, fontWeight: 800, color: s.col, fontFamily: "monospace" }}>
                  {s.isStr ? s.v : <AnimCounter value={s.v} color={s.col} size={20} />}
                </div>
                <div style={{ fontSize: 10, color: c.muted, marginTop: 3 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </SpotlightCard>

      {/* ═══ INSIGHTS ═══ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 }}>
        <SpotlightCard style={{ padding: 18 }}>
          <div style={{ fontSize: 10, color: c.muted, marginBottom: 8, letterSpacing: "0.08em" }}>COMPLIANCE</div>
          <div style={{ fontSize: 18, fontWeight: 800, color: confirmed.length === 0 ? c.green : dueFine > 0 ? c.red : c.yellow }}>
            {confirmed.length === 0 ? "Perfect" : dueFine > 0 ? "Pay dues" : "Paid"}
          </div>
          <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>
            {confirmed.length === 0 ? "No violations" : `${confirmed.length} confirmed`}
          </div>
        </SpotlightCard>

        <SpotlightCard style={{ padding: 18 }}>
          <div style={{ fontSize: 10, color: c.muted, marginBottom: 8, letterSpacing: "0.08em" }}>TOP VIOLATION</div>
          <div style={{ fontSize: 14, fontWeight: 800, color: c.red }}>
            {topType ? topType[0] : "None"}
          </div>
          <div style={{ fontSize: 11, color: c.muted, marginTop: 4 }}>
            {topType ? `${topType[1]} times` : "Clean record"}
          </div>
        </SpotlightCard>

        <SpotlightCard style={{ padding: 18 }}>
          <div style={{ fontSize: 10, color: c.muted, marginBottom: 8, letterSpacing: "0.08em" }}>FINE BREAKDOWN</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 4 }}>
            {[
              { l: "Paid", v: paidFine, color: c.green  },
              { l: "Due",  v: dueFine,  color: c.yellow },
            ].map(s => (
              <div key={s.l} style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontSize: 11, color: c.muted }}>{s.l}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>
                  ₹{s.v.toLocaleString("en-IN")}
                </span>
              </div>
            ))}
          </div>
        </SpotlightCard>
      </div>

      {/* ═══ MY VEHICLES ═══ */}
      <SpotlightCard style={{ padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: c.text, letterSpacing: "0.06em" }}>MY VEHICLES</div>
            <div style={{ fontSize: 11, color: c.muted, marginTop: 3 }}>{vehicles.length} registered</div>
          </div>
          <button onClick={() => { setShowAddVehicle(!showAddVehicle); setVError(null); }} style={{
            padding: "8px 16px", borderRadius: 9, cursor: "pointer",
            background: showAddVehicle ? "transparent" : `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
            color: showAddVehicle ? c.muted : "#fff",
            border: showAddVehicle ? `1px solid ${c.border}` : "none",
            fontWeight: 700, fontSize: 12, fontFamily: "inherit",
          }}>
            {showAddVehicle ? "Cancel" : "+ Add Vehicle"}
          </button>
        </div>

        {/* Add Vehicle Form */}
        {showAddVehicle && (
          <div style={{
            padding: 18, borderRadius: 12, marginBottom: 16,
            background: c.bg, border: `1px solid ${c.border}`,
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  VEHICLE NUMBER *
                </label>
                <input
                  style={{ ...inp, textTransform: "uppercase" }}
                  placeholder="DL01AB1234"
                  value={vForm.vehicleNumber}
                  onChange={setV("vehicleNumber")}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  VEHICLE TYPE
                </label>
                <select style={{ ...inp, cursor: "pointer" }} value={vForm.vehicleType} onChange={setV("vehicleType")}>
                  {["Car", "Bike", "Scooter", "Bus", "Truck", "Auto"].map(t => <option key={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  LICENSE NUMBER *
                </label>
                <input
                  style={{ ...inp, textTransform: "uppercase" }}
                  placeholder="DL123456"
                  value={vForm.licenseNumber}
                  onChange={setV("licenseNumber")}
                />
              </div>
            </div>
            {vError && <div style={{ padding: "8px 12px", borderRadius: 8, background: c.redDim, color: c.red, fontSize: 12, marginBottom: 10 }}>⚠ {vError}</div>}
            <button onClick={handleAddVehicle} style={{
              padding: "10px 24px", borderRadius: 9, cursor: "pointer",
              background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
              color: "#fff", border: "none", fontWeight: 700, fontSize: 12, fontFamily: "inherit",
            }}>Register Vehicle</button>
          </div>
        )}

        {vSuccess && (
          <div style={{ padding: "10px 14px", borderRadius: 8, background: c.greenDim, color: c.green, fontSize: 12, marginBottom: 12 }}>
            Vehicle added successfully!
          </div>
        )}

        {vehicles.length === 0 ? (
          <div style={{ textAlign: "center", padding: "28px 0", color: c.muted, fontSize: 13 }}>
            No vehicles registered. Add your first vehicle above.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {vehicles.map(v => {
              const vCount = violations.filter(viol => viol.vehicleNumber === v.vehicleNumber).length;
              const vFine  = violations.filter(viol => viol.vehicleNumber === v.vehicleNumber)
                .reduce((s, viol) => s + (viol.fineAmount || 0), 0);
              return (
                <div key={v.id} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "14px 16px", borderRadius: 12,
                  background: c.bg, border: `1px solid ${c.border}`,
                  transition: "border-color 0.2s",
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                    background: `linear-gradient(135deg, ${c.accent}18, ${c.purple}18)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 22, border: `1px solid ${c.accent}22`,
                  }}>
                    {vehicleIcon(v.vehicleType)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 15, color: c.accent }}>
                      {v.vehicleNumber}
                    </div>
                    <div style={{ fontSize: 11, color: c.muted, marginTop: 2 }}>
                      {v.vehicleType} · License: {v.licenseNumber || "N/A"}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: vCount > 0 ? c.red : c.green }}>
                      {vCount} violation{vCount !== 1 ? "s" : ""}
                    </div>
                    <div style={{ fontSize: 11, color: c.muted, fontFamily: "monospace" }}>
                      ₹{vFine.toLocaleString("en-IN")} total
                    </div>
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
