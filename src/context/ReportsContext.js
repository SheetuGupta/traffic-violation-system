import { createContext, useContext, useState } from "react";
import { INITIAL_REPORTS } from "../data/constants";

const ReportsContext = createContext(null);

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState(INITIAL_REPORTS);

  const addReport = (report) => {
    const newReport = {
      ...report,
      id: `RPT-${String(reports.length + 1).padStart(3, "0")}`,
      status: "Pending",
      fine: 0,
      time: "Just now",
    };
    setReports(prev => [newReport, ...prev]);
    return newReport.id;
  };

  const updateStatus = (id, status) => {
    setReports(prev => prev.map(r => (r.id === id ? { ...r, status } : r)));
  };

  const pendingCount = reports.filter(r => r.status === "Pending").length;

  return (
    <ReportsContext.Provider value={{ reports, addReport, updateStatus, pendingCount }}>
      {children}
    </ReportsContext.Provider>
  );
}

export const useReports = () => useContext(ReportsContext);
