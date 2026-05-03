import { useState, useEffect }    from "react";
import { ThemeProvider, useTheme } from "./context/ThemeContext";
import { AuthProvider,  useAuth  } from "./context/AuthContext";
import { ReportsProvider }          from "./context/ReportsContext";

import AuroraBG     from "./components/ui/AuroraBG";
import NoiseOverlay from "./components/ui/NoiseOverlay";
import Header       from "./components/shared/Header";
import NotificationSystem from "./components/ui/NotificationSystem";
import LoginPage    from "./components/auth/LoginPage";

// Admin pages
import DashboardPage  from "./pages/DashboardPage";
import ViolationsPage from "./pages/ViolationsPage";
import MyReportsPage  from "./pages/MyReportsPage";
import FiledViolationsPage from "./pages/FiledViolationsPage"; // New page

// User pages
import ReportPage        from "./pages/ReportPage";
import UserProfilePage   from "./pages/user/UserProfilePage";

import UserReportsPage   from "./pages/user/UserReportsPage";
import UserPaymentsPage  from "./pages/user/UserPaymentsPage";


function Shell() {
  const { c }              = useTheme();
  const { loggedIn, user } = useAuth();
  const isAdmin            = user?.role?.toUpperCase() === "ADMIN";

  const [tab, setTab] = useState("dashboard");

  useEffect(() => {
    if (loggedIn) {
      setTab(isAdmin ? "dashboard" : "profile");
    }
  }, [loggedIn, isAdmin]);

  if (!loggedIn) return <LoginPage />;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "inherit", position: "relative" }}>
      <AuroraBG />
      <NoiseOverlay />

      <div style={{ position: "relative", zIndex: 5 }}>
        <Header tab={tab} setTab={setTab} />
        <NotificationSystem />

        <main style={{ maxWidth: 1120, margin: "0 auto", padding: "26px 16px 60px" }} key={tab}>

          {/* ✅ Admin tabs */}
          {isAdmin && tab === "dashboard"  && <DashboardPage  setTab={setTab} />}
          {isAdmin && tab === "violations" && <ViolationsPage />}
          {isAdmin && tab === "myreports"  && <MyReportsPage  />}
          {isAdmin && tab === "filed"      && <FiledViolationsPage />}
          {isAdmin && tab === "report"     && <ReportPage setTab={setTab} />}

          {/* ✅ User tabs */}
          {!isAdmin && tab === "profile"   && <UserProfilePage  />}
         
          {!isAdmin && tab === "reports"   && <UserReportsPage  />}
          {!isAdmin && tab === "payments"  && <UserPaymentsPage />}
         
          {!isAdmin && tab === "report"    && <ReportPage setTab={setTab} />}

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