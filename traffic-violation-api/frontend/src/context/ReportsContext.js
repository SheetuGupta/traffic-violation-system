import { createContext, useContext, useState, useEffect } from "react";
import api from "../axiosConfig";

const ReportsContext = createContext(null);

const formatStatus = (status) => {
  if (!status) return "PENDING";
  return status.replace(/_/g, " "); // ✅ global replace
};

const formatDate = (dateStr) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
};

export function ReportsProvider({ children }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchViolations = () => {
    api.get("/violations")
      .then(res => {
        const formatted = res.data.map(v => ({
          id: v.id,
          vehicleNumber: v.vehicleNumber || "N/A",
          type: v.violationType,
          fine: v.fineAmount,
          status: formatStatus(v.status),
          time: formatDate(v.violationDate),
          imageUrl: v.imageUrl || null,
          location: v.location || "N/A",
          assignedOfficer: v.assignedOfficer || null,
          reporterId: v.reporterId || null,
          reporterName: v.reporterName || "Unknown",
          reporterEmail: v.reporterEmail || null,
        }));
        setReports(formatted);
        setError(null);
      })
      .catch(err => {
        console.error(err);
      });
  };

  useEffect(() => {
    setLoading(true);
    fetchViolations();
    setLoading(false);
    
    // Real-time polling
    const interval = setInterval(fetchViolations, 5000);
    return () => clearInterval(interval);
  }, []);

  const addReport = async (report) => {
    const formData = new FormData();
    formData.append("file", report.file);
    formData.append("violationType", report.type);
    formData.append("fineAmount", report.fine);
    formData.append("vehicleNumber", report.vehicleNumber.toUpperCase().trim()); // ✅
    formData.append("location", report.location || "");
    if (report.reporterId) formData.append("reporterId", report.reporterId);
    if (report.reporterName) formData.append("reporterName", report.reporterName);
    if (report.reporterEmail) formData.append("reporterEmail", report.reporterEmail);

    try {
      const res = await api.post("/violations/upload", formData);
      setReports(prev => [{
        id: res.data.id,
        vehicleNumber: report.vehicleNumber.toUpperCase().trim(),
        type: report.type,
        status: formatStatus(res.data.status),
        fine: report.fine,
        time: "Just now",
        imageUrl: res.data.imageUrl || null,
        location: report.location || "N/A",
        reporterId: report.reporterId || null,
        reporterName: report.reporterName || "Unknown",
        reporterEmail: report.reporterEmail || null,
      }, ...prev]);
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Failed to submit report.");
      throw err;
    }
  };

  const updateStatus = async (id, status) => {
    try {
      // Actually we don't have a single update status endpoint, maybe we should use bulk update for single too
      await api.put("/violations/bulk-status", { ids: [id], status });
      fetchViolations();
    } catch (err) {
      console.error(err);
    }
  };

  const bulkUpdateStatus = async (ids, status) => {
    try {
      await api.put("/violations/bulk-status", { ids, status });
      fetchViolations();
    } catch (err) {
      console.error(err);
    }
  };

  const assignOfficer = async (id, officerName) => {
    try {
      await api.put(`/violations/${id}/assign-officer`, { officerName });
      fetchViolations();
    } catch (err) {
      console.error(err);
    }
  };

  // ✅ Vehicle detail fetch — modal ke liye
  const fetchVehicleDetail = async (vehicleNumber) => {
    const res = await api.get(`/violations/vehicle-detail/${vehicleNumber}`);
    return res.data; // { vehicleNumber, totalFine, totalViolations, violations[] }
  };

  const pendingCount = reports.filter(r => r.status === "PENDING").length;

  return (
    <ReportsContext.Provider value={{
      reports,
      addReport,
      updateStatus,
      bulkUpdateStatus,
      assignOfficer,
      pendingCount,
      loading,
      error,
      fetchVehicleDetail // ✅ expose kiya
    }}>
      {children}
    </ReportsContext.Provider>
  );
}

export const useReports = () => useContext(ReportsContext);
