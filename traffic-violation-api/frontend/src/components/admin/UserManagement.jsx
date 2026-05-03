import { useState, useEffect } from "react";
import { useTheme }            from "../../context/ThemeContext";
import SpotlightCard           from "../ui/SpotlightCard";
import api                     from "../../axiosConfig";

export default function UserManagement() {
  const { c } = useTheme();

  const [users,   setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);
  const [search,  setSearch]  = useState("");

  useEffect(() => {
    api.get("/users")
      .then(res => setUsers(res.data))
      .catch(() => setError("Users load nahi ho sake."))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await api.delete("/users/" + id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch {
      alert("Delete failed.");
    }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      await api.put("/users/" + id, {
        ...users.find(u => u.id === id),
        role: newRole,
      });
      setUsers(prev =>
        prev.map(u => u.id === id ? { ...u, role: newRole } : u)
      );
    } catch {
      alert("Role update failed.");
    }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const inp = {
    padding: "8px 12px", borderRadius: 8, fontSize: 12,
    background: c.hi, border: "1px solid " + c.border,
    color: c.text, outline: "none", fontFamily: "inherit",
  };

  return (
    <SpotlightCard style={{ padding: 22 }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10,
      }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 800, color: c.text, letterSpacing: "0.06em" }}>
            👥 USER MANAGEMENT
          </div>
          <div style={{ fontSize: 11, color: c.muted, marginTop: 3 }}>
            {users.length} total users
          </div>
        </div>
        <input
          style={{ ...inp, width: 220 }}
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        {[
          { l: "Total Users", v: users.length,                                     col: c.accent  },
          { l: "Admins",      v: users.filter(u => u.role === "ADMIN").length,     col: c.purple  },
          { l: "Users",       v: users.filter(u => u.role === "USER").length,      col: c.green   },
        ].map(s => (
          <div key={s.l} style={{
            padding: "10px 18px", borderRadius: 10,
            background: c.hi, border: "1px solid " + c.border,
            minWidth: 110, textAlign: "center",
          }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.col, fontFamily: "monospace" }}>
              {s.v}
            </div>
            <div style={{ fontSize: 10, color: c.muted, marginTop: 2 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: c.muted }}>
          Loading users...
        </div>
      ) : error ? (
        <div style={{ textAlign: "center", padding: 40, color: c.red }}>
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: c.muted }}>
          No users found.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((u, i) => (
            <div key={u.id} style={{
              display: "flex", alignItems: "center",
              flexWrap: "wrap", gap: 10,
              padding: "12px 14px", borderRadius: 10,
              border: "1px solid " + c.border, background: c.hi,
              animationDelay: (i * 0.04) + "s",
            }} className="slide-in">

              {/* Avatar */}
              <div style={{
                width: 36, height: 36, borderRadius: "50%",
                background: u.role === "ADMIN" ? c.purpleDim : c.accentDim,
                border: "1px solid " + (u.role === "ADMIN" ? c.purple : c.accent) + "55",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, fontWeight: 800,
                color: u.role === "ADMIN" ? c.purple : c.accent,
                flexShrink: 0,
              }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>

              {/* Info */}
              <div style={{ flex: "2 1 150px" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.text }}>
                  {u.name}
                </div>
                <div style={{ fontSize: 11, color: c.muted, marginTop: 1 }}>
                  {u.email} · {u.phoneNumber || "N/A"}
                </div>
              </div>

              {/* Role Badge */}
              <div style={{
                fontSize: 10, fontWeight: 700,
                padding: "4px 10px", borderRadius: 20,
                letterSpacing: "0.08em",
                background: u.role === "ADMIN" ? c.purpleDim : c.accentDim,
                color: u.role === "ADMIN" ? c.purple : c.accent,
                border: "1px solid " + (u.role === "ADMIN" ? c.purple : c.accent) + "44",
              }}>
                {u.role}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6, marginLeft: "auto" }}>

                {/* Role Toggle */}
                <button
                  onClick={() => handleRoleChange(u.id, u.role === "ADMIN" ? "USER" : "ADMIN")}
                  style={{
                    padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                    border: "1px solid " + c.yellow + "55", background: c.yellowDim,
                    color: c.yellow, fontSize: 11,
                    fontWeight: 700, fontFamily: "inherit",
                  }}
                >
                  {u.role === "ADMIN" ? "→ USER" : "→ ADMIN"}
                </button>

                {/* Delete */}
                <button
                  onClick={() => handleDelete(u.id)}
                  style={{
                    padding: "5px 12px", borderRadius: 7, cursor: "pointer",
                    border: "1px solid " + c.red + "55", background: c.redDim,
                    color: c.red, fontSize: 11,
                    fontWeight: 700, fontFamily: "inherit",
                  }}
                >
                  🗑 Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </SpotlightCard>
  );
}