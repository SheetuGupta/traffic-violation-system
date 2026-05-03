import { useState } from "react";
import { Sun, Moon, LogOut, Menu, User, FileText, CreditCard, Plus, BarChart3, AlertTriangle, List, Folder } from "lucide-react/dist/cjs/lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useAuth }  from "../../context/AuthContext";
import { useReports } from "../../context/ReportsContext";
import Chip from "../ui/Chip";

const USER_TABS = [
  { id: "profile",  icon: <User size={16} />, label: "Profile"  },
  { id: "reports",  icon: <FileText size={16} />, label: "Reports"   },
  { id: "payments", icon: <CreditCard size={16} />, label: "Payments"  },
  { id: "report",   icon: <Plus size={16} />,  label: "File Report" },
];

const ADMIN_TABS = [
  { id: "dashboard",  icon: <BarChart3 size={16} />, label: "Dashboard"  },
  { id: "violations", icon: <AlertTriangle size={16} />, label: "Violations" },
  { id: "myreports",  icon: <List size={16} />, label: "Reports"    },
  { id: "filed",      icon: <Folder size={16} />, label: "Filed Violations" },
  { id: "report",     icon: <Plus size={16} />,  label: "File Report" },
];

export default function Header({ tab, setTab }) {
  const { c, dark, toggle } = useTheme();
  const { user, logout }    = useAuth();
  const { pendingCount }    = useReports();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = user?.role === "ADMIN";
  const tabs    = isAdmin ? ADMIN_TABS : USER_TABS;

  const navBtn = (t) => (
    <button key={t.id} onClick={() => { setTab(t.id); setMobileOpen(false); }}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "8px 13px", borderRadius: 9, border: "none",
        cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 700 : 400,
        position: "relative",
        background: tab === t.id ? (dark ? `${c.accent}18` : c.accentDim) : "transparent",
        color: tab === t.id ? c.accent : c.muted,
        fontFamily: "inherit", transition: "all 0.2s",
      }}>
      <span>{t.icon}</span>
      <span>{t.label}</span>
      {t.id === "violations" && pendingCount > 0 && (
        <span style={{
          position: "absolute", top: 4, right: 4,
          width: 15, height: 15, borderRadius: "50%",
          background: c.red, color: "#fff",
          fontSize: 9, fontWeight: 700,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>{pendingCount}</span>
      )}
    </button>
  );

  return (
    <>
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: dark ? "rgba(7,12,20,0.88)" : "rgba(238,243,250,0.9)",
        backdropFilter: "blur(24px)",
        borderBottom: `1px solid ${c.border}`,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 20px", height: 56, gap: 12,
      }}>

        <div style={{ display: "flex", alignItems: "center", gap: 9, flexShrink: 0 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: `linear-gradient(135deg,${c.accent},${c.purple})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17,
          }}>🚦</div>
          <span style={{ fontSize: 15, fontWeight: 900, color: c.text, letterSpacing: "-0.3px" }}>
            TrafficWatch
          </span>
          <Chip
            label={isAdmin ? "ADMIN" : "USER"}
            color={isAdmin ? c.purple : c.accent}
            bg={isAdmin ? c.purpleDim : c.accentDim}
          />
        </div>

        <nav className="desk-nav" style={{ display: "flex", gap: 2 }}>
          {tabs.map(navBtn)}
        </nav>

        <div style={{ display: "flex", gap: 7, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: c.muted, display: "flex", alignItems: "center", gap: 5 }}>
            👤 {user?.name?.split(" ")[0] || user?.email}
          </span>
          <button onClick={toggle} style={{
            padding: "6px 10px", borderRadius: 8, border: `1px solid ${c.border}`,
            background: "transparent", color: c.muted, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {dark ? (
              <Sun size={16} />
            ) : (
              <Moon size={16} />
            )}
          </button>
          <button onClick={logout} style={{
            padding: "6px 11px", borderRadius: 8, border: `1px solid ${c.border}`,
            background: "transparent", color: c.muted, cursor: "pointer",
            fontSize: 11, fontFamily: "inherit",
          }}><LogOut size={14} /></button>
          <button className="mob-btn" onClick={() => setMobileOpen(v => !v)} style={{
            display: "none", padding: "6px 10px", borderRadius: 8,
            border: `1px solid ${c.border}`, background: "transparent",
            color: c.muted, cursor: "pointer", fontSize: 18, fontFamily: "inherit",
            alignItems: "center",
          }}><Menu size={16} /></button>
        </div>
      </header>

      {mobileOpen && (
        <div style={{
          position: "fixed", top: 56, left: 0, right: 0, zIndex: 99,
          background: dark ? "rgba(7,12,20,0.98)" : "rgba(238,243,250,0.98)",
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${c.border}`,
          padding: 14,
        }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setMobileOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, width: "100%",
                padding: "12px 14px", borderRadius: 10, border: "none",
                cursor: "pointer",
                background: tab === t.id ? (dark ? `${c.accent}14` : c.accentDim) : "transparent",
                color: tab === t.id ? c.accent : c.muted,
                fontFamily: "inherit", fontSize: 14,
                fontWeight: tab === t.id ? 700 : 400, marginBottom: 3,
              }}>
              <span style={{ fontSize: 18 }}>{t.icon}</span>
              {t.label}
              {t.id === "violations" && pendingCount > 0 && (
                <Chip label={String(pendingCount)} color="#fff" bg={c.red} />
              )}
            </button>
          ))}
        </div>
      )}
    </>
  );
}