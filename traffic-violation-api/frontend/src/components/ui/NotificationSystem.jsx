import { useEffect, useState, useRef } from "react";
import { useReports } from "../../context/ReportsContext";
import { useTheme } from "../../context/ThemeContext";

export default function NotificationSystem() {
  const { reports } = useReports();
  const { c } = useTheme();
  const [toasts, setToasts] = useState([]);
  const prevReportsRef = useRef([]);

  useEffect(() => {
    if (prevReportsRef.current.length > 0 && reports.length > prevReportsRef.current.length) {
      // New reports added
      const newReportsCount = reports.length - prevReportsRef.current.length;
      const latest = reports[0]; // assuming sorted by newest first
      
      const newToast = {
        id: Date.now(),
        message: newReportsCount === 1 
          ? `New Violation: ${latest.type} (${latest.vehicleNumber})`
          : `${newReportsCount} New Violations Detected`,
      };
      
      setToasts(prev => [...prev, newToast]);
      
      // Auto dismiss
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newToast.id));
      }, 5000);
    }
    
    prevReportsRef.current = reports;
  }, [reports]);

  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed",
      bottom: 20,
      right: 20,
      zIndex: 9999,
      display: "flex",
      flexDirection: "column",
      gap: 10
    }}>
      {toasts.map(t => (
        <div key={t.id} className="slide-in hover-lift" style={{
          background: c.bg,
          border: `1px solid ${c.accent}`,
          borderLeft: `4px solid ${c.accent}`,
          padding: "12px 16px",
          borderRadius: 8,
          boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
          color: c.text,
          fontSize: 13,
          fontWeight: 600,
          display: "flex",
          alignItems: "center",
          gap: 12
        }}>
          <span>🔔</span>
          {t.message}
        </div>
      ))}
    </div>
  );
}
