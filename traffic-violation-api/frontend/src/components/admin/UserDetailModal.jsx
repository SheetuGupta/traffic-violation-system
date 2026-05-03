import { useEffect, useState } from "react";
import { useTheme }            from "../../context/ThemeContext";
import api                     from "../../axiosConfig";

export default function UserDetailModal({ userId, onClose }) {
  const { c } = useTheme();

  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    api.get(`/users/${userId}`)
      .then(res => setData(res.data))
      .catch(() => setError("Failed to load user details."))
      .finally(() => setLoading(false));
  }, [userId]);

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
    width: "100%", maxWidth: 460,
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    boxShadow: `0 0 40px ${c.accent}22`,
  };

  if (loading) return (
    <div style={overlayStyle}>
      <div style={{ ...boxStyle, alignItems: "center", justifyContent: "center", padding: 60 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div style={{ color: c.muted, fontSize: 13 }}>Loading user...</div>
      </div>
    </div>
  );

  if (error) return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={{ ...boxStyle, alignItems: "center", justifyContent: "center", padding: 60 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>❌</div>
        <div style={{ color: c.red, fontSize: 13 }}>{error}</div>
      </div>
    </div>
  );

  if (!data) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={boxStyle} onClick={e => e.stopPropagation()}>
        <div style={{
          padding: "20px 22px 16px",
          borderBottom: `1px solid ${c.border}`,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <div style={{ fontSize: 10, color: c.muted, letterSpacing: "0.1em", marginBottom: 4 }}>
              USER DETAILS
            </div>
            <div style={{
              fontSize: 22, fontWeight: 900, color: c.text,
              letterSpacing: 1,
            }}>
              👤 {data.name}
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

        <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>EMAIL</div>
            <div style={{ fontSize: 14, color: c.text, fontWeight: 600 }}>{data.email}</div>
          </div>
          
          <div>
            <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>PHONE NUMBER</div>
            <div style={{ fontSize: 14, color: c.text, fontWeight: 600 }}>{data.phoneNumber || "Not Provided"}</div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>ROLE</div>
            <div style={{ 
              display: "inline-block", padding: "4px 10px", borderRadius: 8,
              background: data.role === "ADMIN" ? c.purpleDim : c.accentDim,
              color: data.role === "ADMIN" ? c.purple : c.accent,
              border: `1px solid ${data.role === "ADMIN" ? c.purple : c.accent}44`,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.08em"
            }}>
              {data.role}
            </div>
          </div>

          <div>
            <div style={{ fontSize: 10, color: c.muted, marginBottom: 4 }}>SYSTEM ID</div>
            <div style={{ fontSize: 14, color: c.accent, fontFamily: "monospace", fontWeight: 700 }}>
              #{data.id}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
