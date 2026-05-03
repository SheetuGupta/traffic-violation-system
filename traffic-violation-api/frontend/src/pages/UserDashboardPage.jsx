import { useState, useEffect } from "react";
import { Bike, Bus, Car } from "lucide-react/dist/cjs/lucide-react";
import { useTheme }            from "../../context/ThemeContext";
import { useAuth }             from "../../context/AuthContext";
import SpotlightCard           from "../../components/ui/SpotlightCard";
import GlitchText              from "../../components/ui/GlitchText";
import api                     from "../../axiosConfig";

export default function UserVehiclesPage() {
  const { c }    = useTheme();
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error,    setError]    = useState(null);
  const [success,  setSuccess]  = useState(false);

  const [form, setForm] = useState({
    vehicleNumber: "",
    vehicleType:   "Car",
    licenseNumber: "",
  });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const fetchVehicles = () => {
    api.get(`/vehicles/user/${user?.id}`)
      .then(res => setVehicles(res.data.filter(v => v.vehicleNumber !== null)))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchVehicles(); }, [user]);

  const handleAdd = async () => {
    if (!form.vehicleNumber || !form.licenseNumber) {
      setError("Vehicle number and license number are required.");
      return;
    }
    setError(null);
    try {
      await api.post("/vehicles", {
        vehicleNumber: form.vehicleNumber.toUpperCase().trim(),
        vehicleType:   form.vehicleType,
        licenseNumber: form.licenseNumber.toUpperCase().trim(),
        userId:        user?.id,
      });
      setSuccess(true);
      setShowForm(false);
      setForm({ vehicleNumber: "", vehicleType: "Car", licenseNumber: "" });
      fetchVehicles();
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || "Failed to add vehicle.");
    }
  };

  const inp = {
    width: "100%", padding: "12px 15px", borderRadius: 10, fontSize: 13,
    background: c.hi, border: `1px solid ${c.border}`,
    color: c.text, outline: "none", fontFamily: "inherit",
  };

  const vehicleIcon = (type) => {
    if (type === "Bike" || type === "Scooter") return <Bike size={20} />;
    if (type === "Bus"  || type === "Truck")   return <Bus size={20} />;
    if (type === "Auto") return <Car size={20} />;
    return <Car size={20} />;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div className="fade-up" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <GlitchText text="My Vehicles" color={c.text} size={21} />
          <div style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
            {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""} registered
          </div>
        </div>
        <button onClick={() => setShowForm(!showForm)} style={{
          padding: "10px 20px", borderRadius: 10, cursor: "pointer",
          background: showForm ? "transparent" : `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
          color: showForm ? c.muted : "#fff",
          border: showForm ? `1px solid ${c.border}` : "none",
          fontWeight: 700, fontSize: 13, fontFamily: "inherit",
        }}>
          {showForm ? "✕ Cancel" : "＋ Add Vehicle"}
        </button>
      </div>

      {/* Success */}
      {success && (
        <div style={{ padding: "12px 16px", borderRadius: 10, background: c.greenDim, color: c.green, fontSize: 13 }}>
          ✅ Vehicle added successfully!
        </div>
      )}

      {/* Add Vehicle Form */}
      {showForm && (
        <SpotlightCard style={{ padding: 24 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.text, marginBottom: 16, letterSpacing: "0.06em" }}>
            ADD NEW VEHICLE
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  VEHICLE NUMBER *
                </label>
                <input
                  style={{ ...inp, textTransform: "uppercase" }}
                  placeholder="e.g. DL01AB1234"
                  value={form.vehicleNumber}
                  onChange={set("vehicleNumber")}
                />
              </div>
              <div>
                <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                  VEHICLE TYPE
                </label>
                <select style={{ ...inp, cursor: "pointer" }} value={form.vehicleType} onChange={set("vehicleType")}>
                  {["Car", "Bike", "Scooter", "Bus", "Truck", "Auto"].map(t => (
                    <option key={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                LICENSE NUMBER *
              </label>
              <input
                style={{ ...inp, textTransform: "uppercase" }}
                placeholder="e.g. DL123456"
                value={form.licenseNumber}
                onChange={set("licenseNumber")}
              />
            </div>

            {error && (
              <div style={{ padding: "10px 14px", borderRadius: 8, background: c.redDim, color: c.red, fontSize: 12 }}>
                ⚠️ {error}
              </div>
            )}

            <button onClick={handleAdd} style={{
              padding: "12px", borderRadius: 10, cursor: "pointer",
              background: `linear-gradient(135deg, ${c.accent}, ${c.purple})`,
              color: "#fff", border: "none", fontWeight: 700,
              fontSize: 13, fontFamily: "inherit",
            }}>
              ✅ Add Vehicle
            </button>
          </div>
        </SpotlightCard>
      )}

      {/* Vehicles List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: c.muted }}>⏳ Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <SpotlightCard style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
          <div style={{ color: c.muted, fontSize: 13 }}>No vehicles registered yet.</div>
          <div style={{ color: c.muted, fontSize: 12, marginTop: 6 }}>
            Click "Add Vehicle" to register your first vehicle.
          </div>
        </SpotlightCard>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
          {vehicles.map(v => (
            <SpotlightCard key={v.id} style={{ padding: 22 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 12,
                  background: `linear-gradient(135deg, ${c.accent}22, ${c.purple}22)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 26, border: `1px solid ${c.accent}33`,
                }}>
                  {vehicleIcon(v.vehicleType)}
                </div>
                <div>
                  <div style={{ fontFamily: "monospace", fontWeight: 800, fontSize: 16, color: c.accent }}>
                    {v.vehicleNumber}
                  </div>
                  <div style={{ fontSize: 12, color: c.muted, marginTop: 3 }}>
                    {v.vehicleType}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { l: "License No.",  v: v.licenseNumber || "N/A" },
                  { l: "Vehicle ID",   v: `#${v.id}`               },
                ].map(item => (
                  <div key={item.l} style={{
                    display: "flex", justifyContent: "space-between",
                    padding: "7px 10px", borderRadius: 7,
                    background: c.bg, border: `1px solid ${c.border}`,
                  }}>
                    <span style={{ fontSize: 11, color: c.muted }}>{item.l}</span>
                    <span style={{ fontSize: 11, color: c.text, fontWeight: 600 }}>{item.v}</span>
                  </div>
                ))}
              </div>
            </SpotlightCard>
          ))}
        </div>
      )}
    </div>
  );
}
