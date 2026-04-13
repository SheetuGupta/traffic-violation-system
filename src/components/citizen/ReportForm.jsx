import { useState } from "react";
import { useTheme }   from "../../context/ThemeContext";
import { useReports }  from "../../context/ReportsContext";
import SpotlightCard   from "../ui/SpotlightCard";
import MagneticButton  from "../ui/MagneticButton";
import UploadZone      from "./UploadZone";
import { VIOLATION_TYPES } from "../../data/constants";

export default function ReportForm({ onSuccess }) {
  const { c }       = useTheme();
  const { addReport, reports } = useReports();

  const [form,      setForm]      = useState({ vehicle: "", type: "", location: "", desc: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [newId,     setNewId]     = useState("");

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const handleSubmit = () => {
    if (!form.vehicle || !form.type) return;
    setLoading(true);
    setTimeout(() => {
      const id = addReport({ vehicle: form.vehicle, type: form.type, area: form.location || "Unknown Area" });
      setNewId(id);
      setLoading(false);
      setSubmitted(true);
      setTimeout(() => { setSubmitted(false); onSuccess?.(); }, 2500);
    }, 1500);
  };

  const inp = {
    width: "100%", padding: "12px 15px", borderRadius: 10, fontSize: 13,
    background: c.hi, border: `1px solid ${c.border}`,
    color: c.text, outline: "none", fontFamily: "inherit",
  };

  return (
    <SpotlightCard style={{ padding: 26 }}>
      {submitted ? (
        <div className="fade-up" style={{ textAlign: "center", padding: "40px 20px" }}>
          <div style={{ fontSize: 60, marginBottom: 14, animation: "pulse 1.5s infinite" }}>✅</div>
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
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
          <UploadZone onOCR={(plate) => setForm(f => ({ ...f, vehicle: plate }))} />

          <div className="form2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 13 }}>
            <div>
              <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                VEHICLE NUMBER
              </label>
              <input style={inp} placeholder="e.g. MH12AB1234" value={form.vehicle} onChange={set("vehicle")} />
            </div>
            <div>
              <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                VIOLATION TYPE
              </label>
              <select style={{ ...inp, cursor: "pointer" }} value={form.type} onChange={set("type")}>
                <option value="">Select type...</option>
                {VIOLATION_TYPES.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
              LOCATION
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inp, flex: 1 }} placeholder="Street / Area / Landmark"
                value={form.location} onChange={set("location")} />
              <button style={{
                padding: "12px 14px", borderRadius: 10,
                border: `1px solid ${c.accent}44`, background: c.accentDim,
                color: c.accent, cursor: "pointer", fontSize: 12,
                fontFamily: "inherit", fontWeight: 600, whiteSpace: "nowrap",
              }}>📍 GPS</button>
            </div>
          </div>

          <div>
            <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
              DESCRIPTION (OPTIONAL)
            </label>
            <textarea style={{ ...inp, height: 76, resize: "vertical" }}
              placeholder="Describe what you witnessed..."
              value={form.desc} onChange={set("desc")} />
          </div>

          <MagneticButton onClick={handleSubmit} accent={c.accent} glow={c.accentGlow}
            style={{ width: "100%", padding: "14px", fontSize: 13 }}>
            {loading ? "⏳ SUBMITTING..." : "🚨 SUBMIT VIOLATION REPORT"}
          </MagneticButton>
        </div>
      )}
    </SpotlightCard>
  );
}
