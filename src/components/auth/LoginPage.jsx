import { useState } from "react";
import { useTheme }  from "../../context/ThemeContext";
import { useAuth }   from "../../context/AuthContext";
import AuroraBG      from "../ui/AuroraBG";
import NoiseOverlay  from "../ui/NoiseOverlay";
import ParticleGrid  from "../ui/ParticleGrid";
import SpotlightCard from "../ui/SpotlightCard";
import MagneticButton from "../ui/MagneticButton";
import GlitchText    from "../ui/GlitchText";
import Chip          from "../ui/Chip";
import { isValidEmail } from "../../utils/helpers";

export default function LoginPage() {
  const { c, dark, toggle } = useTheme();
  const { login }           = useAuth();
  const [role, setRole]     = useState("citizen");
  const [email, setEmail]   = useState("");
  const [pass,  setPass]    = useState("");
  const [err,   setErr]     = useState(false);

  const handleLogin = () => {
    if (email && pass) {
      login(email, role);
      setErr(false);
    } else {
      setErr(true);
    }
  };

  const inp = {
    width: "100%", padding: "12px 16px", borderRadius: 10, fontSize: 13,
    background: c.hi, border: `1px solid ${c.border}`,
    color: c.text, outline: "none", fontFamily: "inherit",
  };

  return (
    <div style={{ minHeight: "100vh", background: c.bg, position: "relative", fontFamily: "inherit" }}>
      <AuroraBG />
      <NoiseOverlay />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <ParticleGrid />
      </div>

      <div style={{
        position: "relative", zIndex: 10,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        minHeight: "100vh", padding: 20,
      }}>
        {/* Logo */}
        <div className="fade-up" style={{ animationDelay: "0s", textAlign: "center", marginBottom: 36 }}>
          <div style={{
            width: 68, height: 68, borderRadius: 18,
            background: `linear-gradient(135deg,${c.accent},${c.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 34, margin: "0 auto 14px",
            boxShadow: `0 8px 32px ${c.accentGlow}`,
          }}>🚦</div>
          <GlitchText text="TrafficWatch" color={c.text} size={26} />
          <div style={{ color: c.muted, fontSize: 12, marginTop: 5 }}>
            Smart Violation Enforcement Platform
          </div>
        </div>

        {/* Role & theme toggles */}
        <div className="fade-up" style={{ animationDelay: "0.08s", display: "flex", gap: 8, marginBottom: 20 }}>
          {["citizen", "admin"].map(r => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: "8px 18px", borderRadius: 10,
              border: `1px solid ${role === r ? c.accent : c.border}`,
              background: role === r ? c.accentDim : "transparent",
              color: role === r ? c.accent : c.muted,
              cursor: "pointer", fontSize: 12, fontFamily: "inherit",
              fontWeight: 600, transition: "all 0.2s",
            }}>
              {r === "admin" ? "🛡 Admin" : "👤 Citizen"}
            </button>
          ))}
          <button onClick={toggle} style={{
            padding: "8px 13px", borderRadius: 10,
            border: `1px solid ${c.border}`, background: "transparent",
            color: c.muted, cursor: "pointer", fontSize: 14, fontFamily: "inherit",
          }}>{dark ? "☀" : "🌙"}</button>
        </div>

        {/* Card */}
        <div className="fade-up" style={{ animationDelay: "0.16s", width: "100%", maxWidth: 400 }}>
          <SpotlightCard style={{ padding: 32 }}>
            {/* Scanline */}
            <div style={{
              position: "absolute", left: 0, right: 0, height: 2, zIndex: 2,
              pointerEvents: "none",
              background: `linear-gradient(90deg,transparent,${c.accent}44,transparent)`,
              animation: "scanline 3s linear infinite",
            }} />

            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 17, fontWeight: 800, color: c.text }}>
                {role === "admin" ? "Admin Control Panel" : "Citizen Portal Login"}
              </div>
              <div style={{ fontSize: 11, color: c.muted, marginTop: 3 }}>
                Secured · JWT · Role-based Access
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                { label: "EMAIL ADDRESS", type: "email",    val: email, set: setEmail, ph: "officer@trafficwatch.in" },
                { label: "PASSWORD",      type: "password", val: pass,  set: setPass,  ph: "••••••••" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ fontSize: 10, color: c.muted, display: "block", marginBottom: 5, letterSpacing: "0.08em" }}>
                    {f.label}
                  </label>
                  <input
                    type={f.type} value={f.val} placeholder={f.ph}
                    onChange={e => f.set(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleLogin()}
                    style={inp}
                  />
                </div>
              ))}

              {err && (
                <div style={{
                  padding: "9px 13px", background: c.redDim, borderRadius: 8,
                  color: c.red, fontSize: 12, border: `1px solid ${c.red}33`,
                }}>
                  ⚠ Please enter both email and password
                </div>
              )}

              <MagneticButton
                onClick={handleLogin}
                accent={c.accent}
                glow={c.accentGlow}
                style={{ width: "100%", marginTop: 4 }}
              >
                {role === "admin" ? "🛡 LOGIN AS ADMIN" : "🚀 LOGIN AS CITIZEN"}
              </MagneticButton>

              <div style={{ textAlign: "center", fontSize: 11, color: c.dim }}>
                No account?{" "}
                <span style={{ color: c.accent, cursor: "pointer" }}>Register →</span>
              </div>
            </div>
          </SpotlightCard>
        </div>

        {/* Tags */}
        <div className="fade-up" style={{ animationDelay: "0.3s", marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {["🔒 JWT Secured", "🔎 OCR Detection", "📍 GPS Tagging", "🤖 AI Classify"].map(t => (
            <Chip key={t} label={t} color={c.muted}
              bg={dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"} />
          ))}
        </div>
      </div>
    </div>
  );
}
