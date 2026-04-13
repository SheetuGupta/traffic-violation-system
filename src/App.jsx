import { useState } from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider,  useAuth  } from "./context/AuthContext";
import { ReportsProvider }          from "./context/ReportsContext";

import AuroraBG    from "./components/ui/AuroraBG";
import NoiseOverlay from "./components/ui/NoiseOverlay";
import Header      from "./components/shared/Header";
import LoginPage   from "./components/auth/LoginPage";

import DashboardPage  from "./pages/DashboardPage";
import ReportPage     from "./pages/ReportPage";
import MyReportsPage  from "./pages/MyReportsPage";
import ViolationsPage from "./pages/ViolationsPage";
import AnalyticsPage  from "./pages/AnalyticsPage";

// ── Inner shell (needs context) ──────────────────────────────
function Shell() {
  const { c, dark } = useTheme();
  const { loggedIn }  = useAuth();
  const [tab, setTab] = useState("dashboard");

  if (!loggedIn) return <LoginPage />;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "inherit", position: "relative" }}>
      <AuroraBG />
      <NoiseOverlay />

      <div style={{ position: "relative", zIndex: 5 }}>
        <Header tab={tab} setTab={setTab} />

        <main style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 16px 60px" }} key={tab}>
          {tab === "dashboard"  && <DashboardPage  setTab={setTab} />}
          {tab === "report"     && <ReportPage     setTab={setTab} />}
          {tab === "myreports"  && <MyReportsPage  />}
          {tab === "violations" && <ViolationsPage />}
          {tab === "analytics"  && <AnalyticsPage  />}
        </main>

        <footer style={{
          textAlign: "center", padding: "16px",
          color: c.dim, fontSize: 11,
          borderTop: `1px solid ${c.border}`,
        }}>
          TrafficWatch v2.0 · Smart Enforcement ·&nbsp;
          <span style={{ color: c.accent }}>JWT Secured</span> ·&nbsp;
          <span style={{ color: c.green }}>OCR Enabled</span>
        </footer>
      </div>
    </div>
  );
}

// ── Root App ─────────────────────────────────────────────────
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ReportsProvider>
          <Shell />
        </ReportsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
