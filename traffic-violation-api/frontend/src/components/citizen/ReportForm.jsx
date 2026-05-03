import { useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, MapPin, Zap } from "lucide-react/dist/cjs/lucide-react";
import { useTheme }            from "../../context/ThemeContext";
import { useReports }          from "../../context/ReportsContext";
import { useAuth }             from "../../context/AuthContext";
import SpotlightCard           from "../ui/SpotlightCard";
import MagneticButton          from "../ui/MagneticButton";
import UploadZone              from "./UploadZone";
import { VIOLATION_TYPES, VIOLATION_FINES } from "../../data/constants";

export default function ReportForm({ onSuccess }) {
  const { c }         = useTheme();
  const { addReport } = useReports();
  const { user }      = useAuth();

  const [form, setForm] = useState({
    vehicleNumber: "",
    type:          "",
    location:      "",
    desc:          "",
    file:          null,
    fine:          "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [newId,     setNewId]     = useState("");

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  // ✅ Violation type change hone pe fine auto-fill
  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    const autoFine     = VIOLATION_FINES[selectedType] || "";
    setForm(f => ({ ...f, type: selectedType, fine: autoFine }));
  };

  const handleSubmit = async () => {
    if (!form.vehicleNumber || !form.type) {
      setError("Please enter vehicle number and select violation type.");
      return;
    }
    if (!form.file) {
      setError("Please upload an evidence photo.");
      return;
    }
    if (!form.fine || isNaN(form.fine) || parseFloat(form.fine) <= 0) {
      setError("Please enter a valid fine amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addReport({
        file:          form.file,
        type:          form.type,
        fine:          parseFloat(form.fine),
        vehicleNumber: form.vehicleNumber.toUpperCase().trim(),
        location:      form.location || "",
        reporterId:    user?.id,
        reporterName:  user?.name,
        reporterEmail: user?.email,
      });

      setNewId(`RPT-${Date.now()}`);
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onSuccess?.();
      }, 2500);

    } catch (err) {
      console.error(err);
      setError("Submission failed. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    width: "100%", padding: "12px 15px", borderRadius: 10, fontSize: 13,
    background: c.hi, border: `1px solid ${c.border}`,
    color: c.text, outline: "none", fontFamily: "inherit",
  };

  // Success Screen
  if (submitted) {
    return (
      <SpotlightCard style={{ padding: 26 }}>
        <div className="fade-up" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 60, marginBottom: 14, animation: "pulse 1.5s infinite" }}><CheckCircle2 size={60} color={c.green} /></div>
          <div style={{ fontSize: 22, fontWeight: 900, color: c.green }}>Report Submitted!</div>
          <div style={{ color: c.muted, fontSize: 13, marginTop: 8, lineHeight: 1.7 }}>
            Complaint registered and assigned to a traffic officer for review.
          </div>
          <div style={{
            marginTop: 14, padding: "11px 22px",
            background: c.greenDim, borderRadius: 12,
            color: c.green, fontFamily: "monospace", fontSize: 15,
            letterSpacing: 2, display: "inline-block",
          }}>
            {newId} · PENDING ⏳
          </div>
        </div>
      </SpotlightCard>
    );
  }

  return (
    <SpotlightCard style={{ padding: 26 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>

        {/* Image Upload */}
        <UploadZone
          onOCR={(plate) => {
            setForm(f => ({ ...f, vehicleNumber: plate }));
            setError(null);
          }}
          onFileSelect={(file) => setForm(f => ({ ...f, file }))}
        />

        <div className="form2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>

          {/* Vehicle Number */}
          <div>
            <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
              VEHICLE NUMBER
            </label>
            <input
              style={{ ...inp, textTransform: "uppercase" }}
              placeholder="e.g. DL01AB1234"
              value={form.vehicleNumber}
              onChange={set("vehicleNumber")}
            />
          </div>

          {/* Violation Type — fine auto fill */}
          <div>
            <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
              VIOLATION TYPE
            </label>
            <select
              style={{ ...inp, cursor: "pointer" }}
              value={form.type}
              onChange={handleTypeChange}  // ✅ handleTypeChange use karo
            >
              <option value="">Select type...</option>
              {VIOLATION_TYPES.map(v => <option key={v}>{v}</option>)}
            </select>
          </div>
        </div>

        {/* Fine Amount — auto filled + editable */}
        <div>
          <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
            FINE AMOUNT (₹)
            {form.type && VIOLATION_FINES[form.type] && (
              <span style={{ color: c.green, marginLeft: 8, fontSize: 10 }}>
                ✅ Auto-filled — you can edit
              </span>
            )}
          </label>
          <input
            style={{
              ...inp,
              border: form.fine ? `1px solid ${c.green}55` : `1px solid ${c.border}`,
            }}
            type="number"
            placeholder="e.g. 500"
            value={form.fine}
            onChange={set("fine")}
          />
          {/* ✅ Fine info box */}
          {form.type && VIOLATION_FINES[form.type] && (
            <div style={{
              marginTop: 6, padding: "6px 12px",
              background: c.greenDim, borderRadius: 8,
              color: c.green, fontSize: 11,
              display: "flex", justifyContent: "space-between"
            }}>
              <span>Standard fine for "{form.type}"</span>
              <span style={{ fontWeight: 700, fontFamily: "monospace" }}>
                ₹{VIOLATION_FINES[form.type].toLocaleString("en-IN")}
              </span>
            </div>
          )}
        </div>

        {/* Location */}
        <div>
          <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
            LOCATION
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              style={{ ...inp, flex: 1 }}
              placeholder="Street / Area / Landmark"
              value={form.location}
              onChange={set("location")}
            />
            <button
              onClick={() => {
                if (!navigator.geolocation) {
                  setError("GPS not supported in this browser.");
                  return;
                }
                navigator.geolocation.getCurrentPosition(
                  (pos) => {
                    const coords = `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`;
                    setForm(f => ({ ...f, location: coords }));
                  },
                  () => setError("Could not fetch GPS location. Please allow location access.")
                );
              }}
              style={{
                padding: "12px 14px", borderRadius: 10,
                border: `1px solid ${c.accent}44`, background: c.accentDim,
                color: c.accent, cursor: "pointer", fontSize: 12,
                fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
              <MapPin size={14} /> GPS
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
            DESCRIPTION (OPTIONAL)
          </label>
          <textarea
            style={{ ...inp, height: 76, resize: "vertical" }}
            placeholder="Describe what you witnessed..."
            value={form.desc}
            onChange={set("desc")}
          />
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            padding: "10px 15px", borderRadius: 10,
            background: c.redDim, border: `1px solid ${c.red}44`,
            color: c.red, fontSize: 12,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <AlertTriangle size={14} /> {error}
          </div>
        )}

        {/* Submit Button */}
        <MagneticButton
          onClick={handleSubmit}
          accent={c.accent}
          glow={c.accentGlow}
          style={{ width: "100%", padding: "14px", fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          disabled={loading}
        >
          {loading ? <><Loader2 size={16} className="spin" /> SUBMITTING...</> : <><Zap size={16} /> SUBMIT VIOLATION REPORT</>}
        </MagneticButton>

      </div>
    </SpotlightCard>
  );
}
