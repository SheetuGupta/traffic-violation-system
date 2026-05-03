import { useState }          from "react";
import { useTheme }          from "../context/ThemeContext";
import { useReports }        from "../context/ReportsContext";
import GlitchText            from "../components/ui/GlitchText";
import SpotlightCard         from "../components/ui/SpotlightCard";
import FilterBar             from "../components/shared/FilterBar";
import ReportRow             from "../components/shared/ReportRow";
import VehicleDetailModal    from "../components/citizen/VehicleDetailModal";

export default function MyReportsPage() {
  const { c }       = useTheme();
  const { reports } = useReports();

  const [filter,          setFilter]          = useState("All");
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [searchPlate,     setSearchPlate]     = useState("");
  const [searchError,     setSearchError]     = useState("");

  const filtered = filter === "All"
    ? reports
    : reports.filter(r => r.status === filter.toUpperCase());

  const totalFine = filtered
    .filter(r => r.fine != null)
    .reduce((sum, r) => sum + r.fine, 0);

  const fineIssuedTotal = reports
    .filter(r => r.status === "FINE ISSUED" && r.fine != null)
    .reduce((sum, r) => sum + r.fine, 0);

  const handleRowClick = (r) => {
    if (r.vehicleNumber && r.vehicleNumber !== "N/A") {
      setSelectedVehicle(r.vehicleNumber);
    }
  };

  const handleSearch = () => {
    const plate = searchPlate.trim().toUpperCase();
    if (!plate) {
      setSearchError("Plate number daalo.");
      return;
    }
    const found = reports.some(r => r.vehicleNumber === plate);
    if (!found) {
      setSearchError(plate + " ke liye koi violation nahi mila.");
      return;
    }
    setSearchError("");
    setSelectedVehicle(plate);
  };

  return (
    <div>

      {/* Header */}
      <div className="fade-up" style={{
        display: "flex", flexWrap: "wrap",
        justifyContent: "space-between", alignItems: "flex-start",
        gap: 12, marginBottom: 22
      }}>
        <div>
          <GlitchText text="My Reports" color={c.text} size={21} />
          <div style={{ color: c.muted, fontSize: 13, marginTop: 5 }}>
            {reports.length} complaints tracked · Click any row to see vehicle details
          </div>
        </div>
        <FilterBar filter={filter} setFilter={setFilter} />
      </div>

      {/* Vehicle Search Box */}
      <div style={{
        marginBottom: 18, padding: "14px 18px",
        borderRadius: 14, background: c.hi,
        border: "1px solid " + c.border,
      }}>
        <div style={{ fontSize: 10, color: c.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
          VEHICLE VIOLATIONS SEARCH
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10,
              background: c.bg, border: "1px solid " + c.border,
              color: c.text, fontSize: 13, outline: "none",
              fontFamily: "inherit", textTransform: "uppercase",
            }}
            placeholder="e.g. MH02DT4596"
            value={searchPlate}
            onChange={e => { setSearchPlate(e.target.value); setSearchError(""); }}
            onKeyDown={e => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            style={{
              padding: "10px 18px", borderRadius: 10,
              border: "1px solid " + c.accent + "55",
              background: c.accentDim, color: c.accent,
              cursor: "pointer", fontSize: 13,
              fontFamily: "inherit", fontWeight: 700,
            }}
          >
            Search
          </button>
        </div>
        {searchError && (
          <div style={{
            marginTop: 8, fontSize: 12, color: c.red,
            padding: "6px 12px", borderRadius: 8, background: c.redDim,
          }}>
            {searchError}
          </div>
        )}
      </div>

      {/* Fine Summary Cards */}
      <div style={{ display: "flex", gap: 12, marginBottom: 18, flexWrap: "wrap" }}>
        <div style={{
          background: c.hi, border: "1px solid " + c.border,
          borderRadius: 10, padding: "10px 20px", minWidth: 160
        }}>
          <div style={{ color: c.muted, fontSize: 11, marginBottom: 4 }}>
            {filter === "All" ? "Total Fine (All)" : "Total Fine (" + filter + ")"}
          </div>
          <div style={{ color: c.accent, fontWeight: 700, fontSize: 20 }}>
            {"₹" + totalFine.toLocaleString("en-IN")}
          </div>
        </div>

        <div style={{
          background: c.hi, border: "1px solid " + c.border,
          borderRadius: 10, padding: "10px 20px", minWidth: 160
        }}>
          <div style={{ color: c.muted, fontSize: 11, marginBottom: 4 }}>Fine Issued Total</div>
          <div style={{ color: c.red, fontWeight: 700, fontSize: 20 }}>
            {"₹" + fineIssuedTotal.toLocaleString("en-IN")}
          </div>
        </div>

        <div style={{
          background: c.hi, border: "1px solid " + c.border,
          borderRadius: 10, padding: "10px 20px", minWidth: 120
        }}>
          <div style={{ color: c.muted, fontSize: 11, marginBottom: 4 }}>Showing</div>
          <div style={{ color: c.text, fontWeight: 700, fontSize: 20 }}>
            {filtered.length} reports
          </div>
        </div>
      </div>

      {/* Report List */}
      <SpotlightCard style={{ padding: 18 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "44px", color: c.muted }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            No reports with status: <strong>{filter}</strong>
          </div>
        ) : (
          filtered.map((r, i) => (
            <ReportRow
              key={r.id}
              r={r}
              delay={i * 0.04}
              onClick={() => handleRowClick(r)}
            />
          ))
        )}
      </SpotlightCard>

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <VehicleDetailModal
          vehicleNumber={selectedVehicle}
          onClose={() => setSelectedVehicle(null)}
        />
      )}

    </div>
  );
}